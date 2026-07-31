export {};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ProductPageCartMethods } =
  require("../../../app/assets/widgets/product-page/methods/cart-methods.js");

describe("PPB runtime-token request", () => {
  it("uses POST through the signed storefront app proxy", async () => {
    const originalFetch = (global as any).fetch;
    const fetchMock = jest.fn(async () => ({
      ok: true,
      json: async () => ({ token: "runtime-token" }),
    }));
    (global as any).fetch = fetchMock;

    try {
      await ProductPageCartMethods.requestCartTransformRuntimeToken.call(
        {
          selectedBundle: { id: "bundle-1" },
          parseRuntimeAddonDiscount:
            ProductPageCartMethods.parseRuntimeAddonDiscount,
        },
        [{
          id: "gid://shopify/ProductVariant/101",
          _wpbProductId: "gid://shopify/Product/1",
          quantity: 1,
          properties: {},
        }],
        { offerGroupId: "MIX-bundle-1_ABC", bundleType: "product_page" },
      );
    } finally {
      (global as any).fetch = originalFetch;
    }

    expect(fetchMock).toHaveBeenCalledWith(
      "/apps/product-bundles/api/cart-transform-runtime-token",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
});
