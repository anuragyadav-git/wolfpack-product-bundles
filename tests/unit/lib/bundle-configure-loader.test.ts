import {
  fetchBundleProduct,
  fetchShopCurrencyCode,
  fetchShopLocales,
} from "../../../app/lib/bundle-configure-loader.server";

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    warn: jest.fn(),
  },
}));

describe("fetchBundleProduct", () => {
  it("queries current Shopify product media for the Admin bundle product card", async () => {
    const admin = {
      graphql: jest.fn().mockResolvedValue({
        json: async () => ({
          data: {
            product: {
              id: "gid://shopify/Product/1",
              title: "Product Page Fixture",
              featuredMedia: {
                image: { url: "https://cdn.shopify.com/placeholder.png" },
              },
            },
          },
        }),
      }),
    };

    const product = await fetchBundleProduct(admin, "gid://shopify/Product/1", "bundle-1");

    expect(product.title).toBe("Product Page Fixture");
    expect(admin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("featuredMedia"),
      expect.any(Object),
    );
    expect(admin.graphql).toHaveBeenCalledWith(
      expect.stringContaining("media(first: 5)"),
      expect.any(Object),
    );
  });
});

describe("fetchShopCurrencyCode", () => {
  it("returns the shop currency from Shopify Admin", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          shop: { currencyCode: "USD" },
        },
      }),
    });

    await expect(fetchShopCurrencyCode({ graphql })).resolves.toBe("USD");
    expect(graphql).toHaveBeenCalledTimes(1);
  });

  it("propagates Shopify query failures instead of fabricating a currency", async () => {
    const error = new Error("Shop query failed");
    const graphql = jest.fn().mockRejectedValue(error);

    await expect(fetchShopCurrencyCode({ graphql })).rejects.toBe(error);
  });
});

describe("fetchShopLocales", () => {
  it("keeps localization optional when the shop lacks locale access", async () => {
    const graphql = jest.fn().mockRejectedValue(
      new Error("Access denied for shopLocales field"),
    );

    await expect(fetchShopLocales({ graphql })).resolves.toEqual([]);
  });
});
