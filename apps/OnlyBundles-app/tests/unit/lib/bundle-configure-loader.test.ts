import {
  fetchBundleConfigureShopifyData,
  fetchShopConfiguration,
} from "../../../app/lib/bundle-configure-loader.server";
import { AppLogger } from "../../../app/lib/logger";

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    warn: jest.fn(),
  },
}));

describe("fetchShopConfiguration", () => {
  it("returns Shopify-owned currency and timezone values", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: { shop: { currencyCode: "CAD", ianaTimezone: "America/Toronto" } },
      }),
    });

    await expect(fetchShopConfiguration({ graphql })).resolves.toEqual({
      shopCurrencyCode: "CAD",
      shopIanaTimezone: "America/Toronto",
    });
    expect(graphql).toHaveBeenCalledWith(expect.stringContaining("ianaTimezone"));
  });
});

describe("fetchBundleConfigureShopifyData", () => {
  it("loads product, currency, and published locales in one Shopify request", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          product: { id: "gid://shopify/Product/1", title: "Bundle product" },
          shop: { currencyCode: "USD", ianaTimezone: "America/New_York" },
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
      shopIanaTimezone: "America/New_York",
      shopLocales: [{ locale: "en", name: "English", primary: true }],
    });
    expect(graphql).toHaveBeenCalledTimes(1);
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
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          shop: { currencyCode: "GBP", ianaTimezone: "Europe/London" },
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
      shopIanaTimezone: "Europe/London",
      shopLocales: [],
    });
    expect(graphql).toHaveBeenCalledTimes(1);
    expect(graphql.mock.calls.every(([query]) => !query.includes("product(id:"))).toBe(true);
  });

  it("keeps required shop data when Shopify returns a partial product error", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          product: null,
          shop: { currencyCode: "USD", ianaTimezone: "America/Los_Angeles" },
          shopLocales: [],
        },
        errors: [
          {
            message: "Access denied for product field",
            path: ["product"],
          },
        ],
      }),
    });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      "gid://shopify/Product/1",
      "bundle-1",
    )).resolves.toEqual({
      bundleProduct: null,
      shopCurrencyCode: "USD",
      shopIanaTimezone: "America/Los_Angeles",
      shopLocales: [],
    });
    expect(AppLogger.warn).toHaveBeenCalledWith(
      "Failed to fetch bundle product",
      expect.objectContaining({ operation: "fetch-product" }),
      expect.objectContaining({ message: "Access denied for product field" }),
    );
  });

  it("keeps required shop data when Shopify returns a partial locale error", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          shop: { currencyCode: "USD", ianaTimezone: "UTC" },
          shopLocales: null,
        },
        errors: [
          {
            message: "Access denied for shopLocales field",
            path: ["shopLocales"],
          },
        ],
      }),
    });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      null,
      "bundle-1",
    )).resolves.toEqual({
      bundleProduct: null,
      shopCurrencyCode: "USD",
      shopIanaTimezone: "UTC",
      shopLocales: [],
    });
    expect(AppLogger.warn).toHaveBeenCalledWith(
      "Failed to fetch published shop locales",
      expect.objectContaining({ operation: "fetch-shop-locales" }),
      expect.objectContaining({ message: "Access denied for shopLocales field" }),
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

  it("fails when Shopify omits the required shop timezone", async () => {
    const graphql = jest.fn().mockResolvedValue({
      json: async () => ({
        data: {
          shop: { currencyCode: "USD" },
          shopLocales: [],
        },
      }),
    });

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      null,
      "bundle-1",
    )).rejects.toThrow("Shop timezone is missing");
  });

  it("propagates a failed combined request without starting a fallback chain", async () => {
    const graphql = jest.fn().mockRejectedValue(new Error("Shopify unavailable"));

    await expect(fetchBundleConfigureShopifyData(
      { graphql },
      "gid://shopify/Product/1",
      "bundle-1",
    )).rejects.toThrow("Shopify unavailable");
    expect(graphql).toHaveBeenCalledTimes(1);
  });
});
