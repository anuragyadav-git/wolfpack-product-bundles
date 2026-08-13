import {
  STOREFRONT_PROXY_ROOT,
  buildStorefrontApiPath,
  buildStorefrontProxyPath,
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
});
