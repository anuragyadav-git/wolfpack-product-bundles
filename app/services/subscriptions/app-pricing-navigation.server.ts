export class AppPricingNavigationConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppPricingNavigationConfigurationError";
  }
}

const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const APP_HANDLE_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function getShopifyAppPricingUrl(
  shopDomain: string,
  appHandle: string,
): string {
  const normalizedShopDomain = shopDomain.trim().toLowerCase();
  if (!SHOP_DOMAIN_PATTERN.test(normalizedShopDomain)) {
    throw new AppPricingNavigationConfigurationError(
      "Invalid Shopify shop domain for App Pricing",
    );
  }

  const normalizedAppHandle = appHandle.trim();
  if (!APP_HANDLE_PATTERN.test(normalizedAppHandle)) {
    throw new AppPricingNavigationConfigurationError(
      "Invalid Shopify app handle for App Pricing",
    );
  }

  const storeHandle = normalizedShopDomain.slice(0, -".myshopify.com".length);
  return `https://admin.shopify.com/store/${storeHandle}/charges/${normalizedAppHandle}/pricing_plans`;
}
