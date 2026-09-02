import {
  compactBundleForConfigureResponse,
  syncBundleStorefrontNow,
} from "../../../app/services/bundles/storefront-sync.server";
import { ensureBundleParentProduct } from "../../../app/services/bundles/bundle-parent-product.server";

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: {
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("../../../app/services/cart-transform-service.server", () => ({
  CartTransformService: {
    completeSetup: jest.fn().mockResolvedValue({
      success: true,
      cartTransformId: "gid://shopify/CartTransform/1",
    }),
  },
}));

jest.mock("../../../app/services/bundles/metafield-sync.server", () => ({
  updateBundleProductMetafields: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../app/services/theme-colors.server", () => ({
  syncThemeColors: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../../../app/services/bundles/bundle-parent-product.server", () => ({
  ensureBundleParentProduct: jest.fn().mockResolvedValue({
    productId: "gid://shopify/Product/1",
    variantId: "gid://shopify/ProductVariant/1",
    handle: "wpb-parent-bundle-1",
    status: "UNLISTED",
    created: false,
  }),
}));

jest.mock(
  "../../../app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server",
  () => ({
    buildFullPageBundleMetafieldConfig: jest.fn().mockReturnValue({}),
  }),
);

jest.mock(
  "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server",
  () => ({
    buildSyncBundleConfiguration: jest.fn().mockReturnValue({}),
  }),
);

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

const getDb = () => require("../../../app/db.server").default;

describe("storefront sync direct flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, "now").mockReturnValue(1720440000000);
    getDb().bundle.update.mockImplementation(async ({ data }: any) => ({
      id: "bundle-1",
      publicNumber: 1,
      storefrontSyncStatus: data.storefrontSyncStatus,
      storefrontSyncAttemptId: data.storefrontSyncAttemptId,
      storefrontSyncLastError: data.storefrontSyncLastError ?? null,
      storefrontSyncQueuedAt: data.storefrontSyncQueuedAt ?? null,
      storefrontSyncStartedAt: data.storefrontSyncStartedAt ?? null,
      storefrontSyncedAt: data.storefrontSyncedAt ?? null,
      storefrontSyncFailedAt: data.storefrontSyncFailedAt ?? null,
      storefrontSyncStats: data.storefrontSyncStats ?? null,
    }));
    getDb().bundle.updateMany.mockResolvedValue({ count: 1 });
    getDb().bundle.findUnique.mockResolvedValue({
      id: "bundle-1",
      publicNumber: 1,
      shopId: "test.myshopify.com",
      bundleType: "full_page",
      status: "active",
      name: "Daily Essentials",
      description: null,
      shopifyProductId: "gid://shopify/Product/1",
      shopifyProductHandle: "daily-essentials",
      steps: [],
      pricing: null,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("syncs storefront data directly without sending a queue event", async () => {
    const result = await syncBundleStorefrontNow({
      admin: { graphql: jest.fn() } as any,
      shopDomain: "test.myshopify.com",
      bundleId: "bundle-1",
      bundleType: "full_page",
      reason: "save",
    });

    expect(getDb().bundle.update).not.toHaveBeenCalled();
    expect(ensureBundleParentProduct).toHaveBeenCalledWith(expect.objectContaining({
      shopDomain: "test.myshopify.com",
      bundle: expect.objectContaining({ id: "bundle-1", publicNumber: 1 }),
    }));
    expect(result).toMatchObject({
      skipped: false,
      synced: true,
    });
    expect(getDb().bundle.updateMany).not.toHaveBeenCalled();
  });

  it("propagates direct sync failures without persisting operational status", async () => {
    const { CartTransformService } = require("../../../app/services/cart-transform-service.server");
    CartTransformService.completeSetup.mockResolvedValueOnce({
      success: false,
      error: "Cart Transform activation failed",
    });

    await expect(
      syncBundleStorefrontNow({
        admin: { graphql: jest.fn() } as any,
        shopDomain: "test.myshopify.com",
        bundleId: "bundle-1",
        bundleType: "product_page",
        reason: "save",
      }),
    ).rejects.toThrow("Cart Transform activation failed");

    expect(getDb().bundle.update).not.toHaveBeenCalled();
    expect(getDb().bundle.updateMany).not.toHaveBeenCalled();
  });

  it("returns a compact configure response bundle without graph or sync internals", () => {
    const result = compactBundleForConfigureResponse({
      id: "bundle-1",
      publicNumber: 1,
      bundleType: "full_page",
      status: "active",
      name: "Daily Essentials",
      description: "Bundle copy",
      shopifyProductId: "gid://shopify/Product/1",
      shopifyProductHandle: "daily-essentials",
      storefrontSyncStatus: "synced",
      storefrontSyncAttemptId: "attempt-1",
      steps: [{ id: "step-1" }],
      pricing: { id: "pricing-1" },
    });

    expect(result).toEqual({
      id: "bundle-1",
      publicNumber: 1,
      bundleType: "full_page",
      status: "active",
      name: "Daily Essentials",
      description: "Bundle copy",
      shopifyProductId: "gid://shopify/Product/1",
      shopifyProductHandle: "daily-essentials",
    });
    expect(result).not.toHaveProperty("steps");
    expect(result).not.toHaveProperty("pricing");
    expect(result).not.toHaveProperty("storefrontSyncStatus");
    expect(result).not.toHaveProperty("storefrontSyncAttemptId");
  });
});
