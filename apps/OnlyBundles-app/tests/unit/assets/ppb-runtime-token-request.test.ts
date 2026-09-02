export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageCartMethods } =
  require("../../../app/assets/widgets/product-page/methods/cart-methods.js");

describe("PPB Shopify-hosted runtime authorization", () => {
  it("attaches synchronized bundle and line tokens without a network request", () => {
    const cartItems: Array<{ id: string; _wpbProductId: string; _wpbAuthorizationGroup: string; quantity: number; properties: Record<string, string> }> = [{
      id: "gid://shopify/ProductVariant/101",
      _wpbProductId: "gid://shopify/Product/1",
      _wpbAuthorizationGroup: "step-1",
      quantity: 1,
      properties: {},
    }];
    const context = {
      selectedBundle: {
        runtimeAuthorization: {
          version: 2,
          bundleToken: "bundle-token",
          groups: [{ id: "step-1", role: "component", minQuantity: 1, maxQuantity: 2 }],
          lines: [{
            groupId: "step-1",
            variantId: "gid://shopify/ProductVariant/101",
            role: "component",
            maxQuantity: 2,
            maxDiscountPercentage: 0,
            token: "line-token",
          }],
        },
      },
      parseRuntimeAddonDiscount: ProductPageCartMethods.parseRuntimeAddonDiscount,
    };

    expect(ProductPageCartMethods.applyPpbStaticAuthorization.call(context, cartItems))
      .toBe("bundle-token");
    expect(cartItems[0].properties._wolfpack_line_auth).toBe("line-token");
  });

  it("rejects quantities above the synchronized line bound", () => {
    expect(() => ProductPageCartMethods.applyPpbStaticAuthorization.call({
      selectedBundle: {
        runtimeAuthorization: {
          version: 2,
          bundleToken: "bundle-token",
          groups: [{ id: "step-1", role: "component", minQuantity: 1, maxQuantity: 1 }],
          lines: [{
            groupId: "step-1",
            productId: "gid://shopify/Product/1",
            role: "component",
            maxQuantity: 1,
            token: "line-token",
          }],
        },
      },
      parseRuntimeAddonDiscount: ProductPageCartMethods.parseRuntimeAddonDiscount,
    }, [{
      id: "101",
      _wpbProductId: "gid://shopify/Product/1",
      _wpbAuthorizationGroup: "step-1",
      quantity: 2,
      properties: {},
    }])).toThrow(/not authorized/);
  });
});
