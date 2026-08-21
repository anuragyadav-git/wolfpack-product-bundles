import type { OrderAttributionRow } from "./analytics-helpers";

export interface BundleViewRow {
  bundleId: string | null;
  createdAt: Date;
}

export interface BundleMetricTrendPoint {
  date: string;
  revenueCents: number;
  views: number;
  orders: number;
  conversionRate: number;
  aovCents: number;
}

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export function buildBundleMetricTrendSeries(
  attributionRows: OrderAttributionRow[],
  viewRows: BundleViewRow[],
  windowStart: Date,
  windowEnd: Date,
): BundleMetricTrendPoint[] {
  const buckets = new Map<string, { revenueCents: number; views: number; orders: number }>();
  const cursor = new Date(windowStart);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(windowEnd);
  end.setUTCHours(0, 0, 0, 0);

  while (cursor <= end) {
    buckets.set(dateKey(cursor), { revenueCents: 0, views: 0, orders: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const row of attributionRows) {
    if (row.bundleId === null) continue;
    const bucket = buckets.get(dateKey(row.createdAt));
    if (!bucket) continue;
    bucket.revenueCents += row.revenue;
    bucket.orders += 1;
  }

  for (const row of viewRows) {
    if (row.bundleId === null) continue;
    const bucket = buckets.get(dateKey(row.createdAt));
    if (bucket) bucket.views += 1;
  }

  return Array.from(buckets.entries()).map(([date, bucket]: any) => ({
    date,
    ...bucket,
    conversionRate: bucket.views > 0 ? Number(((bucket.orders / bucket.views) * 100).toFixed(2)) : 0,
    aovCents: bucket.orders > 0 ? Math.round(bucket.revenueCents / bucket.orders) : 0,
  }));
}
