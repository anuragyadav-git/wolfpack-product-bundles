import { buildSyncBundleConfiguration } from "../../../app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server";

describe("PPB low-stock runtime configuration", () => {
  it("preserves the persisted low-stock fields for Shopify metafield sync", () => {
    const config = buildSyncBundleConfiguration(
      {
        id: "bundle-1",
        shopId: "test.myshopify.com",
        name: "Bundle",
        description: "",
        status: "active",
        bundleType: "product_page",
        steps: [],
        pricing: null,
        lowStockAlertEnabled: true,
        lowStockAlertThreshold: 8,
        lowStockAlertMessage: "Hurry, {{stock}} remaining",
      },
      "gid://shopify/Product/1",
    );

    expect(config).toEqual(
      expect.objectContaining({
        lowStockAlertEnabled: true,
        lowStockAlertThreshold: 8,
        lowStockAlertMessage: "Hurry, {{stock}} remaining",
      }),
    );
  });
});
