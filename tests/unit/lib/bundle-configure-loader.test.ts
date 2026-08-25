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
  it("loads product, currency, and published locales in one Shopify request", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          product: { id: "gid://shopify/Product/1", title: "Bundle product" },
          shop: { currencyCode: "USD" },
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
    expect(graphql).toHaveBeenCalledTimes(1);
    expect(graphql).toHaveBeenCalledWith(
      expect.stringContaining("product(id: $id)"),
      { variables: { id: "gid://shopify/Product/1" } },
    );
  });

  it("loads shop data without a product query when the bundle has no Shopify product", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          shop: { currencyCode: "GBP" },
          shopLocales: [],
        },
      }),
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
    expect(graphql).toHaveBeenCalledTimes(1);
    expect(graphql.mock.calls[0][0]).not.toContain("product(id:");
  });

  it("reports partial Shopify errors while keeping available required shop data", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: { shop: { currencyCode: "USD" } },
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
      "Shopify returned bundle configure data errors",
      expect.objectContaining({ operation: "fetch-configure-data" }),
    );
  });

  it("fails when Shopify omits the required shop currency", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({ data: { shop: {}, shopLocales: [] } }),
    });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      null,
      "bundle-1",
    )).rejects.toThrow("Shop currency is missing");
  });
});
