const mockDb = {
  bundle: {
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUpdateShopMetafieldsAfterDeletion = jest.fn();

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: mockDb,
}));

jest.mock("../../../app/services/metafield-cleanup.server", () => ({
  MetafieldCleanupService: {
    updateShopMetafieldsAfterDeletion: mockUpdateShopMetafieldsAfterDeletion,
  },
}));

jest.mock("../../../app/services/widget-installation/widget-installation-core.server", () => ({
  WidgetInstallationService: {},
}));

jest.mock("../../../app/services/bundles/bundle-parent-product.server", () => ({
  ensureBundleParentProduct: jest.fn(),
}));

// eslint-disable-next-line import/first
import { handleDeleteBundle } from "../../../app/routes/app/app.dashboard/handlers/handlers.server";

function productDeleteResponse(input: {
  deletedProductId?: string | null;
  userErrors?: Array<{ message: string }>;
}) {
  return Promise.resolve(new Response(JSON.stringify({
    data: {
      productDelete: {
        deletedProductId: input.deletedProductId ?? null,
        userErrors: input.userErrors ?? [],
      },
    },
  }), { headers: { "content-type": "application/json" } }));
}

function formData(bundleId = "bundle-1") {
  const data = new FormData();
  data.set("bundleId", bundleId);
  return data;
}

function bundle(overrides: Record<string, unknown> = {}) {
  return {
    id: "bundle-1",
    bundleType: "full_page",
    shopifyProductId: null,
    ...overrides,
  };
}

describe("handleDeleteBundle resource cleanup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.bundle.delete.mockResolvedValue({});
    mockUpdateShopMetafieldsAfterDeletion.mockResolvedValue(undefined);
  });

  it("deletes a bundle row without Shopify cleanup when no parent product is stored", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle());
    const admin = { graphql: jest.fn() };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );

    expect(response.status).toBe(200);
    expect(admin.graphql).not.toHaveBeenCalled();
    expect(mockDb.bundle.delete).toHaveBeenCalledTimes(1);
  });

  it("deletes an FPB parent product before deleting the bundle row", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle({
      shopifyProductId: "gid://shopify/Product/41",
    }));
    const admin = { graphql: jest.fn(() => productDeleteResponse({
      deletedProductId: "gid://shopify/Product/41",
    })) };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );

    expect(response.status).toBe(200);
    expect(admin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("productDelete"),
      { variables: { input: { id: "gid://shopify/Product/41" } } },
    );
    expect(admin.graphql.mock.invocationCallOrder[0]).toBeLessThan(
      mockDb.bundle.delete.mock.invocationCallOrder[0],
    );
  });

  it("deletes a PPB parent product before deleting the bundle row", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle({
      bundleType: "product_page",
      shopifyProductId: "gid://shopify/Product/42",
    }));
    const admin = { graphql: jest.fn(() => productDeleteResponse({
      deletedProductId: "gid://shopify/Product/42",
    })) };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );

    expect(response.status).toBe(200);
    expect(admin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("productDelete"),
      { variables: { input: { id: "gid://shopify/Product/42" } } },
    );
    expect(admin.graphql.mock.invocationCallOrder[0]).toBeLessThan(
      mockDb.bundle.delete.mock.invocationCallOrder[0],
    );
    expect(mockDb.bundle.delete).toHaveBeenCalledTimes(1);
  });

  it("retains the bundle row when parent-product deletion fails", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle({
      bundleType: "product_page",
      shopifyProductId: "gid://shopify/Product/42",
    }));
    const admin = { graphql: jest.fn(() => productDeleteResponse({
      userErrors: [{ message: "Product cannot be deleted" }],
    })) };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );

    expect(response.status).toBe(500);
    expect(mockDb.bundle.delete).not.toHaveBeenCalled();
  });

  it("continues deleting when Shopify reports that the parent product is already gone", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle({
      shopifyProductId: "gid://shopify/Product/41",
    }));
    const admin = { graphql: jest.fn(() => productDeleteResponse({
      userErrors: [{ message: "Product does not exist" }],
    })) };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );

    expect(response.status).toBe(200);
    expect(mockDb.bundle.delete).toHaveBeenCalledTimes(1);
  });

  it("returns not found without cleanup when the bundle is outside the authenticated shop", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(null);
    const admin = { graphql: jest.fn() };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData("missing-bundle"),
    );

    expect(response.status).toBe(404);
    expect(admin.graphql).not.toHaveBeenCalled();
    expect(mockUpdateShopMetafieldsAfterDeletion).not.toHaveBeenCalled();
    expect(mockDb.bundle.delete).not.toHaveBeenCalled();
  });
});
