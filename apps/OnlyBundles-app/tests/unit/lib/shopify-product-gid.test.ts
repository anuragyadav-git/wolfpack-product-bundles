import { normalizeProductVariantGid } from "../../../app/lib/shopify-product-gid";

describe("Shopify product GID normalization", () => {
  it("normalizes numeric ProductVariant identifiers", () => {
    expect(normalizeProductVariantGid("101")).toBe("gid://shopify/ProductVariant/101");
    expect(normalizeProductVariantGid(202)).toBe("gid://shopify/ProductVariant/202");
  });

  it("preserves canonical ProductVariant GIDs", () => {
    expect(normalizeProductVariantGid("gid://shopify/ProductVariant/303"))
      .toBe("gid://shopify/ProductVariant/303");
  });

  it("rejects missing, malformed, and wrong-resource identifiers", () => {
    expect(normalizeProductVariantGid("gid://shopify/Product/404")).toBeNull();
    expect(normalizeProductVariantGid("not-an-id")).toBeNull();
    expect(normalizeProductVariantGid("")).toBeNull();
    expect(normalizeProductVariantGid(null)).toBeNull();
    expect(normalizeProductVariantGid({ id: 101 })).toBeNull();
  });
});
