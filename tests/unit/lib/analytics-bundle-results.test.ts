import {
  filterAndSortBundleResults,
  type BundleResultSortDirection,
  type BundleResultSortKey,
} from "../../../app/lib/analytics/bundle-results";
import type { BundleMatrixRow } from "../../../app/lib/analytics/engagement-helpers";

const row = (overrides: Partial<BundleMatrixRow>): BundleMatrixRow => ({
  bundleId: "bundle-1",
  bundleName: "Starter Bundle",
  presetId: null,
  status: "active",
  engagedSessions: 0,
  views: 0,
  ordersFromBundle: 0,
  revenueCents: 0,
  aovCents: null,
  engagementToOrderRate: null,
  overallConversionRate: 0,
  ...overrides,
});

const rows = [
  row({ bundleId: "alpha", bundleName: "Alpha Box", views: 12, ordersFromBundle: 2, revenueCents: 4_000, overallConversionRate: 16.67 }),
  row({ bundleId: "beta", bundleName: "Beta Collection", views: 40, ordersFromBundle: 5, revenueCents: 12_000, overallConversionRate: 12.5 }),
  row({ bundleId: "gamma", bundleName: "Gamma Box", views: 8, ordersFromBundle: 1, revenueCents: 2_000, overallConversionRate: 12.5 }),
];

describe("filterAndSortBundleResults", () => {
  it("matches bundle names case-insensitively", () => {
    expect(filterAndSortBundleResults(rows, "BOX", "bundleName", "asc").map(item => item.bundleId)).toEqual([
      "alpha",
      "gamma",
    ]);
  });

  it.each<[BundleResultSortKey, BundleResultSortDirection, string]>([
    ["views", "desc", "beta"],
    ["ordersFromBundle", "desc", "beta"],
    ["revenueCents", "desc", "beta"],
    ["overallConversionRate", "desc", "alpha"],
    ["bundleName", "desc", "gamma"],
  ])("sorts %s in %s order", (sortKey, direction, expectedFirst) => {
    expect(filterAndSortBundleResults(rows, "", sortKey, direction)[0].bundleId).toBe(expectedFirst);
  });

  it("applies Lowest as ascending order to the selected metric", () => {
    expect(filterAndSortBundleResults(rows, "", "revenueCents", "asc").map(item => item.bundleId)).toEqual([
      "gamma",
      "alpha",
      "beta",
    ]);
  });
});
