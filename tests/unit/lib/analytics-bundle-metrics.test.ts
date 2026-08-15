import {
  buildBundleMetricTrendSeries,
  type BundleViewRow,
} from "../../../app/lib/analytics/bundle-metrics";
import type { OrderAttributionRow } from "../../../app/lib/analytics/analytics-helpers";

const D = (iso: string) => new Date(iso);

describe("buildBundleMetricTrendSeries", () => {
  it("fills the requested date window with zero-valued daily points", () => {
    expect(
      buildBundleMetricTrendSeries([], [], D("2026-08-01T00:00:00Z"), D("2026-08-03T23:59:59Z")),
    ).toEqual([
      { date: "2026-08-01", revenueCents: 0, views: 0, orders: 0, conversionRate: 0, aovCents: 0 },
      { date: "2026-08-02", revenueCents: 0, views: 0, orders: 0, conversionRate: 0, aovCents: 0 },
      { date: "2026-08-03", revenueCents: 0, views: 0, orders: 0, conversionRate: 0, aovCents: 0 },
    ]);
  });

  it("aggregates bundle revenue, views, orders, conversion, and AOV per day", () => {
    const attributions: OrderAttributionRow[] = [
      { bundleId: "bundle-1", revenue: 2_000, createdAt: D("2026-08-01T09:00:00Z") },
      { bundleId: "bundle-1", revenue: 4_000, createdAt: D("2026-08-01T10:00:00Z") },
    ];
    const views: BundleViewRow[] = Array.from({ length: 8 }, (_, index) => ({
      bundleId: "bundle-1",
      createdAt: D(`2026-08-01T${String(index).padStart(2, "0")}:00:00Z`),
    }));

    expect(
      buildBundleMetricTrendSeries(attributions, views, D("2026-08-01T00:00:00Z"), D("2026-08-01T23:59:59Z")),
    ).toEqual([
      {
        date: "2026-08-01",
        revenueCents: 6_000,
        views: 8,
        orders: 2,
        conversionRate: 25,
        aovCents: 3_000,
      },
    ]);
  });

  it("excludes attribution rows that are not connected to a bundle", () => {
    const attributions: OrderAttributionRow[] = [
      { bundleId: null, revenue: 9_999, createdAt: D("2026-08-01T09:00:00Z") },
    ];

    const [point] = buildBundleMetricTrendSeries(
      attributions,
      [],
      D("2026-08-01T00:00:00Z"),
      D("2026-08-01T23:59:59Z"),
    );

    expect(point).toMatchObject({ revenueCents: 0, orders: 0, aovCents: 0 });
  });
});
