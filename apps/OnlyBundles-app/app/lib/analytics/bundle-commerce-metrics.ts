export interface BundleCommerceRow {
  orderId: string;
  bundleId: string | null;
  revenue: number;
  bundleRevenue: number;
  createdAt: Date;
}

export interface BundleCommerceSummary {
  totalOrderRevenue: number;
  totalBundleRevenue: number;
  ordersWithBundles: number;
  averageOrderValue: number | null;
  addToCartValue: number | null;
  totalBundlesPurchased: number;
}

export interface BundleSalesTrendPoint {
  date: string;
  bundleRevenue: number;
  ordersWithBundles: number;
}

function bundleRowsByUniquePurchase(rows: BundleCommerceRow[]) {
  const unique = new Map<string, BundleCommerceRow>();
  for (const row of rows) {
    if (!row.bundleId) continue;
    const key = `${row.orderId}\u0000${row.bundleId}`;
    const existing = unique.get(key);
    if (!existing || row.bundleRevenue > existing.bundleRevenue) {
      unique.set(key, row);
    }
  }
  return [...unique.values()];
}

export function computeBundleCommerceSummary(
  rows: BundleCommerceRow[],
  addedToCart: number,
): BundleCommerceSummary {
  const bundleRows = bundleRowsByUniquePurchase(rows);
  const orderRevenueById = new Map<string, number>();

  for (const row of bundleRows) {
    orderRevenueById.set(
      row.orderId,
      Math.max(orderRevenueById.get(row.orderId) ?? 0, row.revenue),
    );
  }

  const totalOrderRevenue = [...orderRevenueById.values()].reduce(
    (sum, revenue) => sum + revenue,
    0,
  );
  const totalBundleRevenue = bundleRows.reduce(
    (sum, row) => sum + row.bundleRevenue,
    0,
  );
  const ordersWithBundles = orderRevenueById.size;

  return {
    totalOrderRevenue,
    totalBundleRevenue,
    ordersWithBundles,
    averageOrderValue:
      ordersWithBundles > 0
        ? Math.round(totalOrderRevenue / ordersWithBundles)
        : null,
    addToCartValue:
      addedToCart > 0
        ? Math.round(totalBundleRevenue / addedToCart)
        : null,
    totalBundlesPurchased: bundleRows.length,
  };
}

const dateKey = (date: Date) => date.toISOString().slice(0, 10);

export function buildBundleSalesTrend(
  rows: BundleCommerceRow[],
  windowStart: Date,
  windowEnd: Date,
): BundleSalesTrendPoint[] {
  const buckets = new Map<
    string,
    { bundleRevenue: number; orderIds: Set<string> }
  >();
  const cursor = new Date(windowStart);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(windowEnd);
  end.setUTCHours(0, 0, 0, 0);

  while (cursor <= end) {
    buckets.set(dateKey(cursor), {
      bundleRevenue: 0,
      orderIds: new Set<string>(),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  for (const row of bundleRowsByUniquePurchase(rows)) {
    const bucket = buckets.get(dateKey(row.createdAt));
    if (!bucket) continue;
    bucket.bundleRevenue += row.bundleRevenue;
    bucket.orderIds.add(row.orderId);
  }

  return [...buckets.entries()].map(([date, bucket]) => ({
    date,
    bundleRevenue: bucket.bundleRevenue,
    ordersWithBundles: bucket.orderIds.size,
  }));
}
