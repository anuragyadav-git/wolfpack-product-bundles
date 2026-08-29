import {
  fetchBundleConfigureShopifyData,
} from "../../../app/lib/bundle-configure-loader.server";
import { AppLogger } from "../../../app/lib/logger";

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    warn: jest.fn(),
  },
}));

describe("fetchBundleConfigureShopifyData", () => {
  it("loads product, currency, and published locales in isolated Shopify requests", async () => {
    const graphql = jest.fn()
      .mockResolvedValueOnce({
        json: async () => ({
          data: {
            product: { id: "gid://shopify/Product/1", title: "Bundle product" },
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ data: { shop: { currencyCode: "USD" } } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          data: {
            shopLocales: [
              { locale: "en", name: "English", primary: true, published: true },
              { locale: "de", name: "German", primary: false, published: false },
            ],
          },
        }),
      });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      "gid://shopify/Product/1",
      "bundle-1",
    )).resolves.toEqual({
      bundleProduct: { id: "gid://shopify/Product/1", title: "Bundle product" },
      shopCurrencyCode: "USD",
      shopLocales: [{ locale: "en", name: "English", primary: true }],
    });
    expect(graphql).toHaveBeenCalledTimes(3);
    expect(graphql).toHaveBeenCalledWith(
      expect.stringContaining("product(id: $id)"),
      { variables: { id: "gid://shopify/Product/1" } },
    );
    const productQuery = graphql.mock.calls.find(([query]) => query.includes("product(id: $id)"))?.[0];
    expect(productQuery).not.toContain("legacyResourceId");
    expect(productQuery).not.toContain("featuredMedia");
    expect(productQuery).not.toContain("media(first:");
  });

  it("loads shop data without a product query when the bundle has no Shopify product", async () => {
    const graphql = jest.fn()
      .mockResolvedValueOnce({
        json: async () => ({ data: { shop: { currencyCode: "GBP" } } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ data: { shopLocales: [] } }),
      });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      null,
      "bundle-1",
    )).resolves.toEqual({
      bundleProduct: null,
      shopCurrencyCode: "GBP",
      shopLocales: [],
    });
    expect(graphql).toHaveBeenCalledTimes(2);
    expect(graphql.mock.calls.every(([query]) => !query.includes("product(id:"))).toBe(true);
  });

  it("keeps required shop data when the optional product query fails", async () => {
    const graphql = jest.fn()
      .mockRejectedValueOnce(new Error("Access denied for media field"))
      .mockResolvedValueOnce({
        json: async () => ({ data: { shop: { currencyCode: "USD" } } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ data: { shopLocales: [] } }),
      });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      "gid://shopify/Product/1",
      "bundle-1",
    )).resolves.toEqual({
      bundleProduct: null,
      shopCurrencyCode: "USD",
      shopLocales: [],
    });
    expect(AppLogger.warn).toHaveBeenCalledWith(
      "Failed to fetch bundle product",
      expect.objectContaining({ operation: "fetch-product" }),
      expect.any(Error),
    );
  });

  it("keeps required shop data when the optional locale query fails", async () => {
    const graphql = jest.fn()
      .mockResolvedValueOnce({
        json: async () => ({ data: { shop: { currencyCode: "USD" } } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          errors: [{ message: "Access denied for shopLocales field" }],
        }),
      });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      null,
      "bundle-1",
    )).resolves.toEqual({
      bundleProduct: null,
      shopCurrencyCode: "USD",
      shopLocales: [],
    });
    expect(AppLogger.warn).toHaveBeenCalledWith(
      "Failed to fetch published shop locales",
      expect.objectContaining({ operation: "fetch-shop-locales" }),
      expect.any(Error),
    );
  });

  it("fails when Shopify omits the required shop currency", async () => {
    const graphql = jest.fn()
      .mockResolvedValueOnce({
        json: async () => ({ data: { shop: {} } }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ data: { shopLocales: [] } }),
      });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      null,
      "bundle-1",
    )).rejects.toThrow("Shop currency is missing");
  });
});
