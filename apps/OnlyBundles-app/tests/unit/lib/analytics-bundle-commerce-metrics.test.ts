import {
  buildBundleSalesTrend,
  computeBundleCommerceSummary,
  type BundleCommerceRow,
} from "../../../app/lib/analytics/bundle-commerce-metrics";

const date = (value: string) => new Date(`${value}T12:00:00.000Z`);

function row(overrides: Partial<BundleCommerceRow> = {}): BundleCommerceRow {
  return {
    orderId: "gid://shopify/Order/1",
    bundleId: "bundle-a",
    revenue: 10_000,
    bundleRevenue: 3_000,
    createdAt: date("2026-09-01"),
    ...overrides,
  };
}

describe("computeBundleCommerceSummary", () => {
  it("deduplicates order totals while counting each unique purchased bundle", () => {
    const result = computeBundleCommerceSummary([
      row(),
      row({ bundleId: "bundle-b", bundleRevenue: 2_000 }),
      row({
        orderId: "gid://shopify/Order/2",
        revenue: 5_000,
        bundleRevenue: 2_500,
      }),
    ], 3);

    expect(result).toEqual({
      totalOrderRevenue: 15_000,
      totalBundleRevenue: 7_500,
      ordersWithBundles: 2,
      averageOrderValue: 7_500,
      addToCartValue: 2_500,
      totalBundlesPurchased: 3,
    });
  });

  it("does not count a replayed order and bundle row twice", () => {
    const duplicate = row();
    expect(computeBundleCommerceSummary([duplicate, { ...duplicate }], 1)).toEqual({
      totalOrderRevenue: 10_000,
      totalBundleRevenue: 3_000,
      ordersWithBundles: 1,
      averageOrderValue: 10_000,
      addToCartValue: 3_000,
      totalBundlesPurchased: 1,
    });
  });

  it("returns null quotient metrics for zero denominators", () => {
    expect(computeBundleCommerceSummary([], 0)).toEqual({
      totalOrderRevenue: 0,
      totalBundleRevenue: 0,
      ordersWithBundles: 0,
      averageOrderValue: null,
      addToCartValue: null,
      totalBundlesPurchased: 0,
    });
  });
});

describe("buildBundleSalesTrend", () => {
  it("fills the UTC date window and deduplicates multi-bundle orders", () => {
    const result = buildBundleSalesTrend([
      row(),
      row({ bundleId: "bundle-b", bundleRevenue: 2_000 }),
      row({
        orderId: "gid://shopify/Order/2",
        revenue: 5_000,
        bundleRevenue: 2_500,
        createdAt: date("2026-09-03"),
      }),
    ], new Date("2026-09-01T00:00:00.000Z"), new Date("2026-09-03T23:59:59.999Z"));

    expect(result).toEqual([
      { date: "2026-09-01", bundleRevenue: 5_000, ordersWithBundles: 1 },
      { date: "2026-09-02", bundleRevenue: 0, ordersWithBundles: 0 },
      { date: "2026-09-03", bundleRevenue: 2_500, ordersWithBundles: 1 },
    ]);
  });
});
