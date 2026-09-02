import { matchLineItemGroupsToBundles, matchLineItemsToBundles, normalizeToOrderGid, orderIdMatchForms, type LineItemInput } from "../../../../app/lib/analytics/bundle-matcher.server";

const mockBundleFindMany = jest.fn();
const mockStepProductFindMany = jest.fn();

jest.mock("../../../../app/db.server", () => ({
  __esModule: true,
  default: {
    bundle: {
      findMany: (...args: unknown[]) => mockBundleFindMany(...args),
    },
    stepProduct: {
      findMany: (...args: unknown[]) => mockStepProductFindMany(...args),
    },
  },
}));

const SHOP = "test-bundle-store123.myshopify.com";

describe("matchLineItemsToBundles", () => {
  beforeEach(() => {
    mockBundleFindMany.mockReset();
    mockStepProductFindMany.mockReset();
  });

  it("Case 1: direct match on bundle container (GID input)", async () => {
    mockBundleFindMany.mockResolvedValue([{ id: "bundle-1", shopifyProductId: "gid://shopify/Product/100" }]);
    const lineItems: LineItemInput[] = [{ productId: "gid://shopify/Product/100" }];

    const result = await matchLineItemsToBundles(SHOP, lineItems);

    expect(result).toEqual(["bundle-1"]);
    expect(mockBundleFindMany).toHaveBeenCalledWith({
      where: { shopId: SHOP, shopifyProductId: { in: ["gid://shopify/Product/100"] } },
      select: { id: true, shopifyProductId: true },
    });
    expect(mockStepProductFindMany).not.toHaveBeenCalled();
  });

  it("Case 2: direct match on bundle container (numeric input is normalized to GID)", async () => {
    mockBundleFindMany.mockResolvedValue([{ id: "bundle-1", shopifyProductId: "gid://shopify/Product/100" }]);
    const lineItems: LineItemInput[] = [{ productId: "100" }];

    const result = await matchLineItemsToBundles(SHOP, lineItems);

    expect(result).toEqual(["bundle-1"]);
    expect(mockBundleFindMany).toHaveBeenCalledWith({
      where: { shopId: SHOP, shopifyProductId: { in: ["gid://shopify/Product/100"] } },
      select: { id: true, shopifyProductId: true },
    });
  });

  it("Case 3: component-product fallback (Pass 2) when Pass 1 has no match", async () => {
    mockBundleFindMany.mockResolvedValue([]);
    mockStepProductFindMany.mockResolvedValue([{
      productId: "gid://shopify/Product/500",
      step: { bundleId: "bundle-2" },
    }]);
    const lineItems: LineItemInput[] = [{ productId: "gid://shopify/Product/500" }];

    const result = await matchLineItemsToBundles(SHOP, lineItems);

    expect(result).toEqual(["bundle-2"]);
    expect(mockStepProductFindMany).toHaveBeenCalledWith({
      where: {
        productId: { in: ["gid://shopify/Product/500"] },
        step: { bundle: { shopId: SHOP } },
      },
      select: { productId: true, step: { select: { bundleId: true } } },
    });
  });

  it("Case 4: empty line items returns empty array without hitting DB", async () => {
    const result = await matchLineItemsToBundles(SHOP, []);

    expect(result).toEqual([]);
    expect(mockBundleFindMany).not.toHaveBeenCalled();
    expect(mockStepProductFindMany).not.toHaveBeenCalled();
  });

  it("Case 5: line items with null/undefined productId are filtered out", async () => {
    const lineItems: LineItemInput[] = [
      { productId: null },
      { productId: undefined },
    ];

    const result = await matchLineItemsToBundles(SHOP, lineItems);

    expect(result).toEqual([]);
    expect(mockBundleFindMany).not.toHaveBeenCalled();
    expect(mockStepProductFindMany).not.toHaveBeenCalled();
  });

  it("Case 6: Pass 2 does not run when Pass 1 finds any match", async () => {
    mockBundleFindMany.mockResolvedValue([{ id: "bundle-A", shopifyProductId: "gid://shopify/Product/100" }]);
    const lineItems: LineItemInput[] = [
      { productId: "gid://shopify/Product/100" },
      { productId: "gid://shopify/Product/500" },
    ];

    const result = await matchLineItemsToBundles(SHOP, lineItems);

    expect(result).toEqual(["bundle-A"]);
    expect(mockStepProductFindMany).not.toHaveBeenCalled();
  });

  it("Case 7: wrong shop returns no matches (shop scoping)", async () => {
    mockBundleFindMany.mockResolvedValue([]);
    mockStepProductFindMany.mockResolvedValue([]);
    const lineItems: LineItemInput[] = [{ productId: "100" }];

    const result = await matchLineItemsToBundles("wrong-shop.myshopify.com", lineItems);

    expect(result).toEqual([]);
    expect(mockBundleFindMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ shopId: "wrong-shop.myshopify.com" }) })
    );
  });

  it("Case 8: multiple bundles matched in Pass 1 returns all deduped", async () => {
    mockBundleFindMany.mockResolvedValue([
      { id: "bundle-A", shopifyProductId: "gid://shopify/Product/100" },
      { id: "bundle-B", shopifyProductId: "gid://shopify/Product/200" },
    ]);
    const lineItems: LineItemInput[] = [
      { productId: "gid://shopify/Product/100" },
      { productId: "gid://shopify/Product/200" },
    ];

    const result = await matchLineItemsToBundles(SHOP, lineItems);

    expect(result.sort()).toEqual(["bundle-A", "bundle-B"]);
  });

  it("Case 9: two component products matching the same bundle are deduped by Pass 2 distinct", async () => {
    mockBundleFindMany.mockResolvedValue([]);
    mockStepProductFindMany.mockResolvedValue([
      { productId: "gid://shopify/Product/500", step: { bundleId: "bundle-2" } },
      { productId: "gid://shopify/Product/501", step: { bundleId: "bundle-2" } },
    ]);
    const lineItems: LineItemInput[] = [
      { productId: "gid://shopify/Product/500" },
      { productId: "gid://shopify/Product/501" },
    ];

    const result = await matchLineItemsToBundles(SHOP, lineItems);

    expect(result).toEqual(["bundle-2"]);
  });

  it("matches an order page with one direct query and one fallback query", async () => {
    mockBundleFindMany.mockResolvedValue([
      { id: "bundle-direct", shopifyProductId: "gid://shopify/Product/100" },
    ]);
    mockStepProductFindMany.mockResolvedValue([
      { productId: "gid://shopify/Product/500", step: { bundleId: "bundle-component" } },
    ]);

    const result = await matchLineItemGroupsToBundles(SHOP, [
      [{ productId: "100" }],
      [{ productId: "gid://shopify/Product/500" }],
      [{ productId: null }],
    ]);

    expect(result).toEqual([
      ["bundle-direct"],
      ["bundle-component"],
      [],
    ]);
    expect(mockBundleFindMany).toHaveBeenCalledTimes(1);
    expect(mockStepProductFindMany).toHaveBeenCalledTimes(1);
  });
});

describe("normalizeToOrderGid", () => {
  it("passes through GID unchanged", () => {
    expect(normalizeToOrderGid("gid://shopify/Order/1001")).toBe("gid://shopify/Order/1001");
  });

  it("wraps numeric id in GID prefix", () => {
    expect(normalizeToOrderGid("1001")).toBe("gid://shopify/Order/1001");
  });
});

describe("orderIdMatchForms", () => {
  it("returns both GID and numeric form given a GID input", () => {
    expect(orderIdMatchForms("gid://shopify/Order/1001")).toEqual([
      "gid://shopify/Order/1001",
      "1001",
    ]);
  });

  it("returns both numeric and GID form given a numeric input", () => {
    expect(orderIdMatchForms("1001")).toEqual([
      "1001",
      "gid://shopify/Order/1001",
    ]);
  });
});
