import {
  getShopifyAppPricingUrl,
  AppPricingNavigationConfigurationError,
} from "../../../app/services/subscriptions/app-pricing-navigation.server";

describe("getShopifyAppPricingUrl", () => {
  it("builds the store-specific Shopify Admin pricing destination", () => {
    expect(getShopifyAppPricingUrl(
      "example-shop.myshopify.com",
      "wolfpack-product-bundles",
    )).toBe(
      "https://admin.shopify.com/store/example-shop/charges/wolfpack-product-bundles/pricing_plans",
    );
  });

  it("rejects invalid shop domains", () => {
    expect(() => getShopifyAppPricingUrl(
      "attacker.example",
      "wolfpack-product-bundles",
    )).toThrow(AppPricingNavigationConfigurationError);
  });

  it("rejects invalid app handles", () => {
    expect(() => getShopifyAppPricingUrl(
      "example-shop.myshopify.com",
      "../pricing",
    )).toThrow(AppPricingNavigationConfigurationError);
  });
});
