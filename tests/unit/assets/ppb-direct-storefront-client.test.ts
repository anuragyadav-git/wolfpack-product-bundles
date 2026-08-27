// eslint-disable-next-line @typescript-eslint/no-require-imports
const {
  fetchPpbStorefrontProducts,
  resolvePpbStorefrontEndpoint,
  setPpbBundleDetailsCartMetafield,
} = require("../../../app/assets/widgets/product-page/storefront-client.js");

describe("PPB direct Shopify Storefront client", () => {
  it("uses the shop domain and synchronized API version", () => {
    expect(resolvePpbStorefrontEndpoint("shop.myshopify.com", "2026-07"))
      .toBe("https://shop.myshopify.com/api/2026-07/graphql.json");
  });

  it("batches product nodes and maps live inventory without a Wolfpack request", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { nodes: [{
        id: "gid://shopify/Product/1",
        title: "Product",
        handle: "product",
        description: "",
        descriptionHtml: "",
        featuredImage: { url: "https://cdn.example/product.jpg" },
        images: { nodes: [] },
        variants: { nodes: [{
          id: "gid://shopify/ProductVariant/11",
          title: "Default Title",
          availableForSale: true,
          quantityAvailable: 4,
          currentlyNotInStock: false,
          price: { amount: "10.00" },
          compareAtPrice: null,
          weight: 0,
          weightUnit: "GRAMS",
          image: null,
          selectedOptions: [],
        }], pageInfo: { hasNextPage: false, endCursor: null } },
      }] } }),
    });

    const products = await fetchPpbStorefrontProducts({
      shop: "shop.myshopify.com",
      apiVersion: "2026-07",
      accessToken: "public-token",
      productIds: ["gid://shopify/Product/1"],
      country: "CA",
      fetchImpl: fetchMock,
    });

    expect(fetchMock.mock.calls[0][0]).toBe("https://shop.myshopify.com/api/2026-07/graphql.json");
    expect(fetchMock.mock.calls[0][1].headers["X-Shopify-Storefront-Access-Token"]).toBe("public-token");
    expect(products[0].variants[0]).toMatchObject({
      id: "gid://shopify/ProductVariant/11",
      available: true,
      quantityAvailable: 4,
    });
  });

  it("fails on Shopify GraphQL errors without attempting another source", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ errors: [{ message: "Unavailable" }] }),
    });
    await expect(fetchPpbStorefrontProducts({
      shop: "shop.myshopify.com",
      apiVersion: "2026-07",
      accessToken: "public-token",
      productIds: ["gid://shopify/Product/1"],
      fetchImpl: fetchMock,
    })).rejects.toThrow("Storefront API request failed");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("paginates beyond Shopify's first 250 variants", async () => {
    const variant = (id: string) => ({
      id, title: id, availableForSale: true, quantityAvailable: 1,
      currentlyNotInStock: false, price: { amount: "10.00" }, compareAtPrice: null,
      weight: 0, weightUnit: "GRAMS", image: null, selectedOptions: [],
    });
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { nodes: [{
          id: "gid://shopify/Product/1", title: "Product", handle: "product",
          description: "", descriptionHtml: "", featuredImage: null, images: { nodes: [] },
          variants: { nodes: [variant("gid://shopify/ProductVariant/11")], pageInfo: { hasNextPage: true, endCursor: "cursor-1" } },
        }] } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { product: {
          variants: { nodes: [variant("gid://shopify/ProductVariant/12")], pageInfo: { hasNextPage: false, endCursor: null } },
        } } }),
      });

    const products = await fetchPpbStorefrontProducts({
      shop: "shop.myshopify.com", apiVersion: "2026-07", accessToken: "public-token",
      productIds: ["gid://shopify/Product/1"], fetchImpl: fetchMock,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).variables.cursor).toBe("cursor-1");
    expect(products[0].variants.map((item: any) => item.id)).toEqual([
      "gid://shopify/ProductVariant/11",
      "gid://shopify/ProductVariant/12",
    ]);
  });

  it("merges bundle_details through the direct Storefront cart metafield mutation", async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { cart: { metafields: [{ value: '{"existing":{"displayProperties":{"Box":"1"}}}' }] } } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { cartMetafieldsSet: { metafields: [{ key: "bundle_details" }], userErrors: [] } } }),
      });

    await expect(setPpbBundleDetailsCartMetafield({
      shop: "shop.myshopify.com",
      apiVersion: "2026-07",
      accessToken: "public-token",
      cartToken: "cart-token?key=secret",
      bundleDetailsKey: "MIX-bundle_SESSION",
      displayProperties: { Box: "2" },
      fetchImpl: fetchMock,
    })).resolves.toBe(true);

    const mutationBody = JSON.parse(fetchMock.mock.calls[1][1].body);
    expect(mutationBody.query).toContain("[CartMetafieldsSetInput!]!");
    const value = JSON.parse(mutationBody.variables.metafields[0].value);
    expect(value).toEqual({
      existing: { displayProperties: { Box: "1" } },
      "MIX-bundle_SESSION": { displayProperties: { Box: "2" } },
    });
  });
});
