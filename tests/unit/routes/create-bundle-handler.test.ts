import {
  handleCloneBundle,
  handleCreateBundle,
} from "../../../app/routes/app/app.dashboard/handlers/handlers.server";
import db from "../../../app/db.server";
import { WidgetInstallationService } from "../../../app/services/widget-installation.server";
import { ensureBundleParentProduct } from "../../../app/services/bundles/bundle-parent-product.server";
import { createBundleWithPublicNumber } from "../../../app/services/bundles/fpb-public-number.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    shop: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    bundle: {
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bundleStep: {
      create: jest.fn(),
    },
    stepProduct: {
      createMany: jest.fn(),
    },
    bundlePricing: {
      create: jest.fn(),
    },
  },
}));

jest.mock("../../../app/services/widget-installation.server", () => ({
  WidgetInstallationService: {
    validateProductBundleWidgetSetup: jest.fn(),
  },
}));

jest.mock("../../../app/services/bundles/bundle-parent-product.server", () => ({
  ensureBundleParentProduct: jest.fn(),
}));

jest.mock("../../../app/services/bundles/fpb-public-number.server", () => ({
  createBundleWithPublicNumber: jest.fn(),
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const mockDb = db as jest.Mocked<typeof db>;

function makeForm(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

function makeAdmin() {
  return {
    graphql: jest
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({
          data: {
            productCreate: {
              product: {
                id: "gid://shopify/Product/1",
                handle: "standard-bundle",
              },
              userErrors: [],
            },
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          data: {
            publications: {
              edges: [],
            },
          },
        }),
      }),
  };
}

describe("handleCreateBundle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (mockDb.shop.findUnique as jest.Mock).mockResolvedValue({ firstCreateTourEligible: false });
    (mockDb.shop.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
    (mockDb.bundle.count as jest.Mock).mockResolvedValue(1);
    (createBundleWithPublicNumber as jest.Mock).mockResolvedValue({
      id: "bundle-1",
      publicNumber: 1,
      name: "Standard Bundle",
      shopifyProductId: null,
      shopifyProductHandle: null,
    });
    (ensureBundleParentProduct as jest.Mock).mockResolvedValue({
      productId: "gid://shopify/Product/1",
      variantId: "gid://shopify/ProductVariant/1",
      handle: "standard-bundle",
      status: "UNLISTED",
      created: true,
    });
    (WidgetInstallationService.validateProductBundleWidgetSetup as jest.Mock).mockResolvedValue({
      widgetInstalled: false,
      requiresOneTimeSetup: false,
      message: "",
    });
  });

  it("creates new FPB bundles with the Standard template selected", async () => {
    const response = await handleCreateBundle(
      makeAdmin() as any,
      { shop: "test-shop.myshopify.com" },
      makeForm({
        bundleName: "Standard Bundle",
        bundleType: "full_page",
      }),
    );

    expect(response.status).toBe(200);
    expect(createBundleWithPublicNumber).toHaveBeenCalledWith(expect.objectContaining({
        bundleType: "full_page",
        bundleDesignTemplate: "FBP_SIDE_FOOTER",
        bundleDesignPresetId: "STANDARD",
    }));
  });

  it("atomically claims first-create eligibility after required creation succeeds", async () => {
    (mockDb.shop.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

    const response = await handleCreateBundle(
      makeAdmin() as any,
      { shop: "test-shop.myshopify.com" },
      makeForm({
        bundleName: "First Bundle",
        bundleType: "product_page",
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      success: true,
      showFirstLoadTour: true,
    });
    expect(mockDb.shop.updateMany).toHaveBeenCalledWith({
      where: {
        shopDomain: "test-shop.myshopify.com",
        firstCreateTourEligible: true,
      },
      data: { firstCreateTourEligible: false },
    });
    expect(createBundleWithPublicNumber).toHaveBeenCalledWith(
      expect.objectContaining({
        bundleType: "product_page",
        bundleUpsellConfig: {
          upsellConfiguration: {
            isEnabled: false,
            title: "Build Your Bundle & Save More",
            subTitle: "",
            displayConfiguration: expect.objectContaining({
              showOnAllBundleProducts: true,
            }),
            useLinkProductAsDefaultProduct: false,
          },
          multiLangText: {},
        },
      }),
    );
  });

  it("keeps successful creation successful when the noncritical widget check fails", async () => {
    (mockDb.bundle.count as jest.Mock).mockResolvedValue(0);
    (mockDb.shop.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
    (WidgetInstallationService.validateProductBundleWidgetSetup as jest.Mock)
      .mockRejectedValue(new Error("theme API unavailable"));

    const response = await handleCreateBundle(
      makeAdmin() as any,
      { shop: "test-shop.myshopify.com" },
      makeForm({
        bundleName: "First Bundle",
        bundleType: "product_page",
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      showFirstLoadTour: true,
      widgetStatus: { checked: false },
    });
  });

  it("does not consume first-create eligibility when required creation fails", async () => {
    (ensureBundleParentProduct as jest.Mock).mockRejectedValue(
      new Error("product creation failed"),
    );

    const response = await handleCreateBundle(
      makeAdmin() as any,
      { shop: "test-shop.myshopify.com" },
      makeForm({
        bundleName: "First Bundle",
        bundleType: "product_page",
      }),
    );

    expect(response.status).toBe(500);
    expect(mockDb.shop.updateMany).not.toHaveBeenCalled();
  });
});

describe("handleCloneBundle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (createBundleWithPublicNumber as jest.Mock).mockResolvedValue({
      id: "cloned-bundle",
      publicNumber: 2,
      name: "Cloned Bundle",
    });
    (ensureBundleParentProduct as jest.Mock).mockResolvedValue({
      productId: "gid://shopify/Product/2",
      variantId: "gid://shopify/ProductVariant/2",
      handle: "cloned-bundle",
      status: "UNLISTED",
      created: true,
    });
  });

  it.each([
    ["full_page", "/app/bundles/full-page-bundle/configure/cloned-bundle?mode=create"],
    ["product_page", "/app/bundles/product-page-bundle/configure/cloned-bundle?mode=create"],
  ])("returns the %s configure redirect", async (bundleType, expectedRedirect) => {
    (mockDb.bundle.findUnique as jest.Mock).mockResolvedValue({
      id: "source-bundle",
      name: "Source Bundle",
      description: null,
      bundleType,
      templateName: null,
      steps: [],
      pricing: null,
    });

    const response = await handleCloneBundle(
      makeAdmin() as any,
      { shop: "test-shop.myshopify.com" },
      makeForm({ bundleId: "source-bundle" }),
    );

    await expect(response.json()).resolves.toMatchObject({
      success: true,
      bundleId: "cloned-bundle",
      redirectTo: expectedRedirect,
    });
  });

  it("clones all steps and step products in one nested bundle update", async () => {
    (mockDb.bundle.findUnique as jest.Mock).mockResolvedValue({
      id: "source-bundle",
      name: "Source Bundle",
      description: null,
      bundleType: "full_page",
      templateName: null,
      pricing: null,
      steps: [
        {
          name: "Step 1",
          products: [],
          collections: [],
          displayVariantsAsIndividual: false,
          icon: "box",
          position: 0,
          minQuantity: 1,
          maxQuantity: 2,
          enabled: true,
          conditionType: null,
          conditionOperator: null,
          conditionValue: null,
          conditionOperator2: null,
          conditionValue2: null,
          StepProduct: [{
            productId: "gid://shopify/Product/100",
            title: "Product 100",
            variants: [],
            imageUrl: null,
            minQuantity: 0,
            maxQuantity: 1,
            position: 0,
          }],
        },
      ],
    });
    (mockDb.bundle.update as jest.Mock).mockResolvedValue({ id: "cloned-bundle" });

    await handleCloneBundle(
      makeAdmin() as any,
      { shop: "test-shop.myshopify.com" },
      makeForm({ bundleId: "source-bundle" }),
    );

    expect(mockDb.bundle.update).toHaveBeenCalledTimes(1);
    expect(mockDb.bundle.update).toHaveBeenCalledWith({
      where: { id: "cloned-bundle" },
      data: {
        steps: {
          create: [expect.objectContaining({
            name: "Step 1",
            StepProduct: {
              create: [expect.objectContaining({
                productId: "gid://shopify/Product/100",
              })],
            },
          })],
        },
      },
    });
    expect(mockDb.bundleStep.create).not.toHaveBeenCalled();
    expect(mockDb.stepProduct.createMany).not.toHaveBeenCalled();
  });
});
