import {
  CHECKOUT_INTEGRATION_PROVIDER_OPTIONS,
  getCheckoutIntegrationProvider,
  isDiscountCodeCheckoutIntegrationProvider,
  isSupportedCheckoutIntegrationProvider,
  normalizeCheckoutIntegrationProvider,
} from "../../../app/lib/checkout-integrations";

describe("checkout integration provider registry", () => {
  it("exposes every provider listed in the EB checkout and side-cart functions article", () => {
    expect(CHECKOUT_INTEGRATION_PROVIDER_OPTIONS).toEqual([
      "Shopify checkout",
      "Theme cart drawer",
      "GoKwik",
      "Shopflo",
    ]);
  });

  it("normalizes labels and provider IDs into stable provider IDs", () => {
    expect(normalizeCheckoutIntegrationProvider("Theme cart drawer")).toBe("theme_cart_drawer");
    expect(normalizeCheckoutIntegrationProvider("theme_cart_drawer")).toBe("theme_cart_drawer");
    expect(normalizeCheckoutIntegrationProvider("Shopify checkout")).toBe("native");
    expect(normalizeCheckoutIntegrationProvider("native")).toBe("native");
    expect(normalizeCheckoutIntegrationProvider("GoKwik")).toBe("gokwik");
    expect(normalizeCheckoutIntegrationProvider("Shopflo")).toBe("shopflo");
  });

  it("marks no legacy providers as discount-code providers", () => {
    expect(isDiscountCodeCheckoutIntegrationProvider("native")).toBe(false);
    expect(isDiscountCodeCheckoutIntegrationProvider("theme_cart_drawer")).toBe(false);
    expect(isDiscountCodeCheckoutIntegrationProvider("gokwik")).toBe(true);
    expect(isDiscountCodeCheckoutIntegrationProvider("shopflo")).toBe(true);
  });

  it("keeps app-proxy discount code creation closed to checkout handoff providers", () => {
    expect(isSupportedCheckoutIntegrationProvider("native")).toBe(false);
    expect(isSupportedCheckoutIntegrationProvider("theme_cart_drawer")).toBe(false);
    expect(isSupportedCheckoutIntegrationProvider("gokwik")).toBe(true);
    expect(isSupportedCheckoutIntegrationProvider("shopflo")).toBe(true);
    expect(isSupportedCheckoutIntegrationProvider("monster_cart")).toBe(false);
  });

  it("keeps callback mode metadata for side-cart integrations", () => {
    expect(getCheckoutIntegrationProvider("native")).toMatchObject({
      id: "native",
      callbackMode: "native",
      requiresDiscountCode: false,
      requiresCartRefresh: false,
    });
    expect(getCheckoutIntegrationProvider("theme_cart_drawer")).toMatchObject({
      id: "theme_cart_drawer",
      callbackMode: "side_cart",
      requiresDiscountCode: false,
      requiresCartRefresh: true,
    });
    expect(getCheckoutIntegrationProvider("gokwik")).toMatchObject({
      id: "gokwik",
      callbackMode: "checkout_handoff",
      requiresDiscountCode: true,
      requiresCartRefresh: false,
    });
    expect(getCheckoutIntegrationProvider("Shopflo")).toMatchObject({
      id: "shopflo",
      callbackMode: "checkout_handoff",
      requiresDiscountCode: true,
      requiresCartRefresh: false,
    });
    expect(getCheckoutIntegrationProvider("monster_cart")).toMatchObject({
      id: "native",
      callbackMode: "native",
      requiresDiscountCode: false,
    });
  });
});
