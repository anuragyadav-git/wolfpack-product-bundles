import db from "../../db.server";
import {
  buildBundleSalesTrend,
  computeBundleCommerceSummary,
} from "../../lib/analytics/bundle-commerce-metrics";

export async function loadFreeAttributionSummary(shopId: string) {
  const now = new Date();
  const until = new Date(now);
  until.setUTCHours(23, 59, 59, 999);
  const since = new Date(until);
  since.setUTCDate(since.getUTCDate() - 29);
  since.setUTCHours(0, 0, 0, 0);
  const createdAt = { gte: since, lte: until };
  const [views, addsToCart, purchases, orderRows] = await Promise.all([
    db.bundleAnalytics.count({ where: { shopId, event: "view", createdAt } }),
    db.bundleAnalytics.count({
      where: { shopId, event: "add_to_cart", createdAt },
    }),
    db.bundleAnalytics.count({
      where: { shopId, event: "purchase", createdAt },
    }),
    db.orderAttribution.findMany({
      where: { shopId, bundleId: { not: null }, createdAt },
      select: {
        orderId: true,
        bundleId: true,
        revenue: true,
        bundleRevenue: true,
        createdAt: true,
      },
    }),
  ]);
  const bundleCommerceSummary = computeBundleCommerceSummary(
    orderRows,
    addsToCart,
  );
  const checkedOut = Math.max(purchases, bundleCommerceSummary.ordersWithBundles);
  const revenueCents = bundleCommerceSummary.totalOrderRevenue;
  const from = since.toISOString().slice(0, 10);
  const to = until.toISOString().slice(0, 10);

  return {
    accessMode: "SUMMARY" as const,
    days: 30,
    from,
    to,
    prevFrom: null,
    prevTo: null,
    summary: {
      totalRevenue: revenueCents,
      totalOrders: checkedOut,
      bundleOrders: checkedOut,
      aov: checkedOut > 0 ? Math.round(revenueCents / checkedOut) : 0,
      prevTotalRevenue: 0,
      prevTotalOrders: 0,
      prevAov: 0,
    },
    timeSeries: [],
    byPlatform: [],
    byMedium: [],
    byCampaign: [],
    byBundle: [],
    byLandingPage: [],
    bundleMetricTrend: [],
    bundleCommerceSummary,
    bundleSalesTrend: buildBundleSalesTrend(orderRows, since, until),
    views: { totalViews: views, prevTotalViews: 0, viewsByBundle: [] },
    funnelSnapshot: {
      impressions: views,
      engaged: views,
      addedToCart: addsToCart,
      checkedOut,
      revenueCents,
      dropOffEngagedToAtc:
        views > 0
          ? Math.max(0, 100 - Math.round((addsToCart / views) * 100))
          : 0,
      dropOffAtcToCheckout:
        addsToCart > 0
          ? Math.max(0, 100 - Math.round((checkedOut / addsToCart) * 100))
          : 0,
    },
    engagementToOrderPct:
      views > 0 ? Math.round((checkedOut / views) * 100) : null,
    bundleMatrix: [],
    topCampaignsRows: [],
    offerAnalytics: {
      selectedOfferPolicyId: null,
      options: [],
      funnelSnapshot: {
        impressions: 0,
        engaged: 0,
        addedToCart: 0,
        checkedOut: 0,
        revenueCents: 0,
        dropOffEngagedToAtc: 0,
        dropOffAtcToCheckout: 0,
      },
    },
    customUtmParameters: [],
  };
}
