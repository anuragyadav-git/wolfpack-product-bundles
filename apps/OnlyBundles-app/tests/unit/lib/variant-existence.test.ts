import {
  batchCheckStorefrontVariants,
  validateVariantIdFromShopify,
  isVariantExistsOnShopifyStorefront,
  resolveShopifyVariantNumericId,
} from "../../../app/lib/variant-existence.server";

const mockStorefrontGraphql = jest.fn();

jest.mock("../../../app/shopify.server", () => ({
  unauthenticated: {
    storefront: jest.fn(async () => ({
      storefront: { graphql: mockStorefrontGraphql },
    })),
  },
}));

describe("variant-existence helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("normalizes gid, numeric and slash-form variant ids to the same numeric form", async () => {
    await expect(validateVariantIdFromShopify("gid://shopify/ProductVariant/123456"))
      .resolves.toMatchObject({ numericId: "123456", isValidFormat: true });
    await expect(validateVariantIdFromShopify("123456"))
      .resolves.toMatchObject({ numericId: "123456", isValidFormat: true });
    expect(resolveShopifyVariantNumericId("https://shopify.com/products/123456")).toBe("123456");
  });

  it("rejects malformed variant ids", async () => {
    await expect(validateVariantIdFromShopify("bad-variant")).resolves.toMatchObject({
      isValidFormat: false,
      numericId: "",
    });
    expect(resolveShopifyVariantNumericId("bad-variant")).toBe("");
  });

  it("classifies storefront lookup status results", async () => {
    const originalFetch = (globalThis as any).fetch;
    (globalThis as any).fetch = jest.fn(async (url: string) => {
      if (url === "https://example.myshopify.com/variants/111.js") {
        return {
          ok: true,
          status: 200,
          json: async () => ({ available: true }),
        } as Response;
      }
      if (url === "https://example.myshopify.com/variants/404.js") {
        return { ok: false, status: 404 } as Response;
      }
      throw new Error("unexpected variant");
    });

    try {
      await expect(
        isVariantExistsOnShopifyStorefront("example.myshopify.com", "111"),
      ).resolves.toMatchObject({ ok: true, id: "111", status: 200, available: true });
      await expect(
        isVariantExistsOnShopifyStorefront("example.myshopify.com", "404"),
      ).resolves.toMatchObject({ ok: false, id: "404", status: 404, available: false });
    } finally {
      (globalThis as any).fetch = originalFetch;
    }
  });

  it("checks unique storefront-visible variants in one batch", async () => {
    mockStorefrontGraphql.mockResolvedValue({
      json: async () => ({
        data: {
          nodes: [
            { id: "gid://shopify/ProductVariant/111", availableForSale: false },
            null,
          ],
        },
      }),
    });

    const result = await batchCheckStorefrontVariants(
      "example.myshopify.com",
      ["111", "404", "111"],
    );

    expect(mockStorefrontGraphql).toHaveBeenCalledTimes(1);
    expect(mockStorefrontGraphql).toHaveBeenCalledWith(
      expect.stringContaining("StorefrontVariantVisibilityBatch"),
      {
        variables: {
          ids: [
            "gid://shopify/ProductVariant/111",
            "gid://shopify/ProductVariant/404",
          ],
        },
      },
    );
    expect(result.get("111")).toMatchObject({ ok: true, status: 200, available: false });
    expect(result.get("404")).toMatchObject({ ok: false, status: 404 });
  });
});
