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

  it("preserves the direct sticky add-to-cart fields for Shopify metafield sync", () => {
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
        stickyAddToCartEnabled: true,
        stickyAddToCartShowDesktop: false,
        stickyAddToCartShowMobile: true,
        stickyAddToCartAction: "add_selected_offer",
      },
      "gid://shopify/Product/1",
    );

    expect(config).toEqual(
      expect.objectContaining({
        stickyAddToCartEnabled: true,
        stickyAddToCartShowDesktop: false,
        stickyAddToCartShowMobile: true,
        stickyAddToCartAction: "add_selected_offer",
      }),
    );
  });

  it("derives countdown presentation from the saved offer schedule end", () => {
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
        countdownEnabled: true,
        countdownLayout: "full",
        countdownPosition: "below",
        countdownTitle: "Ends soon",
        countdownExpiryAction: "show_message",
        countdownExpiredMessage: "This offer has ended",
        offerPolicy: {
          id: "policy-1",
          ruleVersion: 1,
          specificLinkRequired: false,
          startsAt: null,
          endsAt: new Date("2030-01-02T03:04:05.000Z"),
        },
      },
      "gid://shopify/Product/1",
    );

    expect(config.countdown).toEqual({
      layout: "full",
      position: "below",
      title: "Ends soon",
      expiryAction: "show_message",
      expiredMessage: "This offer has ended",
      endsAt: "2030-01-02T03:04:05.000Z",
    });
  });
});
