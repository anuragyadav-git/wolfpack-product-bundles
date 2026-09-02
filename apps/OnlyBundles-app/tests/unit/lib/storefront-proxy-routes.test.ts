import {
  STOREFRONT_PROXY_ROOT,
  buildStorefrontApiPath,
  buildStorefrontProxyPath,
  setStorefrontProxyRoot,
  resolveStorefrontProxyRoot,
} from "../../../app/config/storefront-proxy-routes";

describe("storefront proxy routes", () => {
  it("exposes the installed proxy root", () => {
    expect(STOREFRONT_PROXY_ROOT).toBe("/apps/product-bundles");
  });

  it("builds API paths from endpoint-specific segments", () => {
    expect(buildStorefrontApiPath("cart-bundle-details")).toBe(
      "/apps/product-bundles/api/cart-bundle-details",
    );
    expect(buildStorefrontApiPath("bundle/id.json")).toBe(
      "/apps/product-bundles/api/bundle/id.json",
    );
  });

  it("builds document paths from route-specific segments", () => {
    expect(buildStorefrontProxyPath("wpb/12")).toBe(
      "/apps/product-bundles/wpb/12",
    );
  });

  it("uses an explicit environment-specific proxy root", () => {
    expect(resolveStorefrontProxyRoot({
      configuredRoot: "/apps/product-bundles-sit",
    })).toBe("/apps/product-bundles-sit");
    expect(buildStorefrontProxyPath(
      "wpb/12",
      "/apps/product-bundles-sit",
    )).toBe("/apps/product-bundles-sit/wpb/12");
  });

  it("uses the Shopify-hosted browser runtime root for API paths", () => {
    const previousWindow = (globalThis as any).window;
    (globalThis as any).window = {};

    try {
      expect(setStorefrontProxyRoot("/apps/product-bundles-sit")).toBe(
        "/apps/product-bundles-sit",
      );
      expect(buildStorefrontApiPath("offer-eligibility.json")).toBe(
        "/apps/product-bundles-sit/api/offer-eligibility.json",
      );
    } finally {
      (globalThis as any).window = previousWindow;
    }
  });

  it("infers the proxy root from an FPB document pathname", () => {
    expect(resolveStorefrontProxyRoot({
      pathname: "/apps/product-bundles-sit/wpb/12",
    })).toBe("/apps/product-bundles-sit");
  });

  it("fails closed on a browser page without a hosted proxy root", () => {
    const previousWindow = (globalThis as any).window;
    (globalThis as any).window = { location: { pathname: "/products/test" } };

    try {
      expect(() => resolveStorefrontProxyRoot()).toThrow(
        "Storefront proxy root is not configured",
      );
    } finally {
      (globalThis as any).window = previousWindow;
    }
  });

  it.each([
    "https://example.test/apps/product-bundles-sit",
    "/invalid/product-bundles-sit",
    "/apps/product bundles",
  ])("rejects malformed configured root %p", (configuredRoot) => {
    expect(() => resolveStorefrontProxyRoot({ configuredRoot })).toThrow(
      "Invalid storefront proxy root",
    );
  });
});
