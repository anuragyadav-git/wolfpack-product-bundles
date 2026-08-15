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

jest.mock("../../../app/services/widget-installation.server", () => ({
  WidgetInstallationService: {},
}));

jest.mock("../../../app/services/bundles/bundle-parent-product.server", () => ({
  ensureBundleParentProduct: jest.fn(),
}));

// eslint-disable-next-line import/first
import { handleDeleteBundle } from "../../../app/routes/app/app.dashboard/handlers/handlers.server";

function pageDeleteResponse(input: {
  deletedPageId?: string | null;
  userErrors?: Array<{ code?: string; message: string }>;
  errors?: Array<{ message: string }>;
}) {
  return Promise.resolve(new Response(JSON.stringify({
    ...(input.errors ? { errors: input.errors } : {}),
    data: {
      pageDelete: {
        deletedPageId: input.deletedPageId ?? null,
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
    shopifyPageId: "gid://shopify/Page/1",
    shopifyPreviewPageId: "gid://shopify/Page/2",
    ...overrides,
  };
}

describe("handleDeleteBundle Page cleanup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.bundle.delete.mockResolvedValue({});
    mockUpdateShopMetafieldsAfterDeletion.mockResolvedValue(undefined);
  });

  it("deletes public and preview Pages before deleting the FPB row", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle());
    const admin = {
      graphql: jest.fn((_query: string, options?: any) =>
        pageDeleteResponse({ deletedPageId: options?.variables?.id })),
    };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );

    expect(response.status).toBe(200);
    expect(admin.graphql).toHaveBeenCalledTimes(2);
    expect(admin.graphql).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("pageDelete"),
      { variables: { id: "gid://shopify/Page/1" } },
    );
    expect(admin.graphql).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("pageDelete"),
      { variables: { id: "gid://shopify/Page/2" } },
    );
    expect(admin.graphql.mock.invocationCallOrder[1]).toBeLessThan(
      mockDb.bundle.delete.mock.invocationCallOrder[0],
    );
  });

  it("accepts an already-deleted Page and deletes duplicate GIDs once", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle({
      shopifyPreviewPageId: "gid://shopify/Page/1",
    }));
    const admin = {
      graphql: jest.fn(() => pageDeleteResponse({
        userErrors: [{ code: "NOT_FOUND", message: "Page not found" }],
      })),
    };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );

    expect(response.status).toBe(200);
    expect(admin.graphql).toHaveBeenCalledTimes(1);
    expect(mockDb.bundle.delete).toHaveBeenCalledTimes(1);
  });

  it("retains the FPB row when Shopify Page deletion fails", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle({ shopifyPreviewPageId: null }));
    const admin = {
      graphql: jest.fn(() => pageDeleteResponse({
        userErrors: [{ code: "TAKEN", message: "Page cannot be deleted" }],
      })),
    };

    const response = await handleDeleteBundle(
      admin as any,
      { shop: "test-shop.myshopify.com" },
      formData(),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ success: false, error: "Failed to delete bundle" });
    expect(mockDb.bundle.delete).not.toHaveBeenCalled();
  });

  it("does not call Page APIs when deleting a PPB", async () => {
    mockDb.bundle.findUnique.mockResolvedValue(bundle({
      bundleType: "product_page",
      shopifyPageId: null,
      shopifyPreviewPageId: null,
    }));
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
});
