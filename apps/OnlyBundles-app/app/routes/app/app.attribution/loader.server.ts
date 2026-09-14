import { defer, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../../../shopify.server";
import { getPixelStatus } from "../../../services/pixel-activation.server";
import {
  computeBundleFunnel,
  computeOfferFunnel,
  buildBundlePerformanceMatrix,
} from "../../../lib/analytics/engagement-helpers";
import type { OrderAttributionRow } from "../../../lib/analytics/analytics-helpers";
import { buildBundleMetricTrendSeries } from "../../../lib/analytics/bundle-metrics";
import {
  buildBundleSalesTrend,
  computeBundleCommerceSummary,
} from "../../../lib/analytics/bundle-commerce-metrics";
import { loadFreeAttributionSummary } from "../../../services/analytics/free-attribution-summary.server";
import {
  normalizeAttributionWindow,
  normalizeSavedCustomUtmParameters,
} from "../../../lib/analytics/attribution-controls";
import { normalizeOfferAnalyticsDimensions } from "../../../lib/analytics/offer-dimensions";
import db from "../../../db.server";
import { getAnalyticsAccessMode } from "../../../lib/subscriptions/analytics-entitlements";
import { resolveShopEntitlements } from "../../../services/subscriptions/subscription-service.server";

async function loadAttributionDashboardData({
  shopId,
  url,
}: {
  shopId: string;
  url: URL;
}) {
  const {
    since,
    until,
    days,
    from: fromStr,
    to: toStr,
  } = normalizeAttributionWindow(url.searchParams);
  const requestedOfferPolicyId = normalizeOfferAnalyticsDimensions({
    offerPolicyId: url.searchParams.get("offerPolicyId"),
  }).offerPolicyId;

  const prevSince = new Date(since);
  prevSince.setDate(prevSince.getDate() - days);
  const prevUntil = new Date(since);
  prevUntil.setDate(prevUntil.getDate() - 1);
  const prevFromStr = prevSince.toISOString().split("T")[0];
  const prevToStr = prevUntil.toISOString().split("T")[0];

  const [
    shop,
    currentAttributions,
    previousAttributions,
    viewEvents,
    prevViewEvents,
    engagementRows,
  ] = await Promise.all([
    db.shop.findUnique({
      where: { shopDomain: shopId },
      select: { customUtmParameters: true },
    }),
    db.orderAttribution.findMany({
      where: { shopId, createdAt: { gte: since, lte: until } },
      orderBy: { createdAt: "asc" },
    }),
    db.orderAttribution.findMany({
      where: { shopId, createdAt: { gte: prevSince, lt: since } },
    }),
    db.bundleAnalytics.findMany({
      where: { shopId, event: "view", createdAt: { gte: since, lte: until } },
      select: { bundleId: true, createdAt: true },
    }),
    db.bundleAnalytics.findMany({
      where: {
        shopId,
        event: "view",
        createdAt: { gte: prevSince, lt: since },
      },
      select: { bundleId: true },
    }),
    db.bundleEngagement.findMany({
      where: { shopId, createdAt: { gte: since, lte: until } },
      select: {
        bundleId: true,
        sessionId: true,
        presetId: true,
        eventName: true,
        createdAt: true,
        offerPolicyId: true,
        offerRuleVersion: true,
        offerTierId: true,
        offerEligibilitySource: true,
      },
    }),
  ]);

  // Issue: admin-lcp-phase4-loaders-1.
  // Was: 3 separate db.bundle.findMany calls (here, at viewsByBundle, at matrixBundles)
  // each filtering by a different ID set, executed sequentially. p95 cost ~600 ms.
  // Now: union all bundle ids needed by the page, fire ONE query, then partition.
  const attributionBundleIds = currentAttributions
    .filter((a) => a.bundleId)
    .map((a) => a.bundleId!);
  const viewBundleIds = viewEvents
    .filter((v) => v.bundleId)
    .map((v) => v.bundleId!);
  const engagementBundleIds = engagementRows.map((r) => r.bundleId);
  const allBundleIds = [
    ...new Set([
      ...attributionBundleIds,
      ...viewBundleIds,
      ...engagementBundleIds,
    ]),
  ];

  const allBundles =
    allBundleIds.length > 0
      ? await db.bundle.findMany({
          where: { id: { in: allBundleIds } },
          select: { id: true, name: true, status: true },
        })
      : [];
  const fullBundleMap: Record<string, { name: string; status: string }> = {};
  for (const b of allBundles)
    fullBundleMap[b.id] = { name: b.name, status: b.status };
  const bundleIds = [...new Set(attributionBundleIds)];
  const bundleNameMap = Object.fromEntries(
    allBundles.map((b) => [b.id, b.name])
  );

  const totalRevenue = currentAttributions.reduce((s, a) => s + a.revenue, 0);
  const totalOrders = currentAttributions.length;
  const bundleOrders = currentAttributions.filter((a) => a.bundleId).length;
  const aov = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const prevTotalRevenue = previousAttributions.reduce(
    (s, a) => s + a.revenue,
    0
  );
  const prevTotalOrders = previousAttributions.length;
  const prevAov =
    prevTotalOrders > 0 ? Math.round(prevTotalRevenue / prevTotalOrders) : 0;

  const byPlatformMap: Record<string, { revenue: number; orders: number }> = {};
  for (const a of currentAttributions) {
    const src = a.utmSource || "direct";
    if (!byPlatformMap[src]) byPlatformMap[src] = { revenue: 0, orders: 0 };
    byPlatformMap[src].revenue += a.revenue;
    byPlatformMap[src].orders += 1;
  }
  const byPlatform = Object.entries(byPlatformMap)
    .map(([source, d]: any) => ({ source, ...d }))
    .sort((a, b) => b.revenue - a.revenue);

  const byMediumMap: Record<string, { revenue: number; orders: number }> = {};
  for (const a of currentAttributions) {
    const med = a.utmMedium || "unknown";
    if (!byMediumMap[med]) byMediumMap[med] = { revenue: 0, orders: 0 };
    byMediumMap[med].revenue += a.revenue;
    byMediumMap[med].orders += 1;
  }
  const byMedium = Object.entries(byMediumMap)
    .map(([medium, d]: any) => ({ medium, ...d }))
    .sort((a, b) => b.revenue - a.revenue);

  // Exclude attribution rows that have no bundleId — those represent UTM-tracked
  // orders that didn't include any bundle product (recorded by api.attribution for
  // broader analytics). Including them here makes TopCampaigns show non-zero while
  // the bundle-aware cards (RevenueAttribution, BundlePerformanceMatrix) stay at
  // zero for the same campaign, which reads as a bug on a Bundle Analytics page.
  const byCampaignMap: Record<
    string,
    { revenue: number; orders: number; source: string }
  > = {};
  for (const a of currentAttributions) {
    if (!a.bundleId) continue;
    const campaign = a.utmCampaign || "(no campaign)";
    if (!byCampaignMap[campaign]) {
      byCampaignMap[campaign] = {
        revenue: 0,
        orders: 0,
        source: a.utmSource || "direct",
      };
    }
    byCampaignMap[campaign].revenue += a.bundleRevenue;
    byCampaignMap[campaign].orders += 1;
  }
  const byCampaign = Object.entries(byCampaignMap)
    .map(([campaign, d]: any) => ({ campaign, ...d }))
    .sort((a, b) => b.revenue - a.revenue);

  const byBundleMap: Record<
    string,
    { name: string; revenue: number; orders: number }
  > = {};
  for (const a of currentAttributions) {
    if (!a.bundleId) continue;
    if (!byBundleMap[a.bundleId]) {
      byBundleMap[a.bundleId] = {
        name: bundleNameMap[a.bundleId] || "Unknown Bundle",
        revenue: 0,
        orders: 0,
      };
    }
    byBundleMap[a.bundleId].revenue += a.bundleRevenue;
    byBundleMap[a.bundleId].orders += 1;
  }
  const byBundle = Object.values(byBundleMap).sort(
    (a, b) => b.revenue - a.revenue
  );

  const byLandingMap: Record<string, { revenue: number; orders: number }> = {};
  for (const a of currentAttributions) {
    if (!a.landingPage) continue;
    const page = a.landingPage.split("?")[0];
    if (!byLandingMap[page]) byLandingMap[page] = { revenue: 0, orders: 0 };
    byLandingMap[page].revenue += a.revenue;
    byLandingMap[page].orders += 1;
  }
  const byLandingPage = Object.entries(byLandingMap)
    .map(([page, d]: any) => ({ page, ...d }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const timeSeriesMap: Record<string, { revenue: number; orders: number }> = {};
  for (const a of currentAttributions) {
    const dateKey = new Date(a.createdAt).toISOString().split("T")[0];
    if (!timeSeriesMap[dateKey])
      timeSeriesMap[dateKey] = { revenue: 0, orders: 0 };
    timeSeriesMap[dateKey].revenue += a.revenue;
    timeSeriesMap[dateKey].orders += 1;
  }

  const timeSeries: Array<{ date: string; revenue: number; orders: number }> =
    [];
  const cursor = new Date(since);
  while (cursor <= until) {
    const dateKey = cursor.toISOString().split("T")[0];
    timeSeries.push({
      date: dateKey,
      ...(timeSeriesMap[dateKey] ?? { revenue: 0, orders: 0 }),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const attrRows: OrderAttributionRow[] = currentAttributions.map((a) => ({
    orderId: a.orderId,
    bundleId: a.bundleId,
    revenue: a.revenue,
    bundleRevenue: a.bundleRevenue,
    createdAt: a.createdAt,
  }));
  const bundleMetricTrend = buildBundleMetricTrendSeries(
    attrRows,
    viewEvents,
    since,
    until
  );

  const totalViews = viewEvents.length;
  const prevTotalViews = prevViewEvents.length;

  const viewsByBundleMap: Record<string, number> = {};
  for (const v of viewEvents) {
    if (v.bundleId) {
      viewsByBundleMap[v.bundleId] = (viewsByBundleMap[v.bundleId] ?? 0) + 1;
    }
  }
  // bundleNameMap already covers every bundle id referenced by viewEvents (it was
  // included in allBundleIds above). No follow-up findMany needed.
  const viewsByBundle = Object.entries(viewsByBundleMap)
    .map(([bundleId, views]: any) => ({
      bundleId,
      name: bundleNameMap[bundleId] ?? "Unknown Bundle",
      views,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // ── Engagement-funnel data plumbing (wpb-analytics-revamp-1) ──
  const engagementRowsTyped = engagementRows.map((r) => ({
    bundleId: r.bundleId,
    offerPolicyId: r.offerPolicyId,
    sessionId: r.sessionId,
    eventName: r.eventName,
    presetId: r.presetId ?? null,
    createdAt: r.createdAt,
  }));
  const funnelSnapshot = computeBundleFunnel(
    engagementRowsTyped,
    currentAttributions.map((a) => ({
      orderId: a.orderId,
      bundleId: a.bundleId,
      revenue: a.revenue,
      bundleRevenue: a.bundleRevenue,
      createdAt: a.createdAt,
    }))
  );
  const bundleCommerceRows = currentAttributions.map((attribution) => ({
    orderId: attribution.orderId,
    bundleId: attribution.bundleId,
    revenue: attribution.revenue,
    bundleRevenue: attribution.bundleRevenue,
    createdAt: attribution.createdAt,
  }));
  const bundleCommerceSummary = computeBundleCommerceSummary(
    bundleCommerceRows,
    funnelSnapshot.addedToCart,
  );
  const bundleSalesTrend = buildBundleSalesTrend(
    bundleCommerceRows,
    since,
    until,
  );
  const offerOptionMap = new Map<
    string,
    {
      bundleId: string | null;
      ruleVersion: number | null;
      eligibilitySource: string | null;
      tierIds: Set<string>;
    }
  >();
  for (const row of [...currentAttributions, ...engagementRows]) {
    if (!row.offerPolicyId) continue;
    const existing = offerOptionMap.get(row.offerPolicyId) ?? {
      bundleId: row.bundleId ?? null,
      ruleVersion: row.offerRuleVersion ?? null,
      eligibilitySource: row.offerEligibilitySource ?? null,
      tierIds: new Set<string>(),
    };
    if (row.offerTierId) existing.tierIds.add(row.offerTierId);
    offerOptionMap.set(row.offerPolicyId, existing);
  }
  const offerOptions = Array.from(offerOptionMap.entries())
    .map(([id, option]) => ({
      id,
      bundleId: option.bundleId,
      label: option.bundleId
        ? `${bundleNameMap[option.bundleId] ?? "Unknown Bundle"} · ${id}`
        : id,
      ruleVersion: option.ruleVersion,
      eligibilitySource: option.eligibilitySource,
      tierIds: Array.from(option.tierIds).sort(),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
  const selectedOfferPolicyId =
    requestedOfferPolicyId && offerOptionMap.has(requestedOfferPolicyId)
      ? requestedOfferPolicyId
      : null;
  const offerFunnelSnapshot = computeOfferFunnel(
    engagementRowsTyped,
    currentAttributions.map((a) => ({
      orderId: a.orderId,
      bundleId: a.bundleId,
      offerPolicyId: a.offerPolicyId,
      revenue: a.revenue,
      bundleRevenue: a.bundleRevenue,
      createdAt: a.createdAt,
    })),
    selectedOfferPolicyId
  );

  // fullBundleMap already covers every bundle id from views + engagement + attributions
  // (built in the single consolidated findMany above). Just compute the matrix id set.
  const matrixBundleIds = [
    ...new Set([
      ...bundleIds,
      ...viewBundleIds,
      ...engagementRows.map((r) => r.bundleId),
    ]),
  ];

  const matrixBundles = matrixBundleIds.map((id) => {
    const meta = fullBundleMap[id];
    const presetSample =
      engagementRows.find((r) => r.bundleId === id)?.presetId ?? null;
    return {
      id,
      name: meta?.name ?? "Unknown Bundle",
      status: meta?.status ?? "active",
      presetId: presetSample,
    };
  });
  const bundleMatrix = buildBundlePerformanceMatrix(
    matrixBundles,
    engagementRowsTyped,
    currentAttributions.map((a) => ({
      orderId: a.orderId,
      bundleId: a.bundleId,
      revenue: a.bundleRevenue,
      bundleRevenue: a.bundleRevenue,
      createdAt: a.createdAt,
    })),
    viewEvents
  );

  // Top campaigns — derived from existing byCampaign array.
  const topCampaignsRows = byCampaign
    .filter((c) => c.campaign !== "(no campaign)")
    .slice(0, 5)
    .map((c) => ({
      utmCampaign: c.campaign,
      revenueCents: c.revenue,
      orders: c.orders,
    }));

  const engagementToOrderPct =
    funnelSnapshot.engaged > 0
      ? Math.round((funnelSnapshot.checkedOut / funnelSnapshot.engaged) * 100)
      : null;

  return {
    accessMode: "ADVANCED" as const,
    days,
    from: fromStr,
    to: toStr,
    prevFrom: prevFromStr,
    prevTo: prevToStr,
    summary: {
      totalRevenue,
      totalOrders,
      bundleOrders,
      aov,
      prevTotalRevenue,
      prevTotalOrders,
      prevAov,
    },
    timeSeries,
    byPlatform,
    byMedium,
    byCampaign,
    byBundle,
    byLandingPage,
    bundleMetricTrend,
    views: { totalViews, prevTotalViews, viewsByBundle },
    // wpb-analytics-revamp-1 additions
    funnelSnapshot,
    bundleCommerceSummary,
    bundleSalesTrend,
    engagementToOrderPct,
    bundleMatrix,
    topCampaignsRows,
    offerAnalytics: {
      selectedOfferPolicyId,
      options: offerOptions,
      funnelSnapshot: offerFunnelSnapshot,
    },
    customUtmParameters: normalizeSavedCustomUtmParameters(
      shop?.customUtmParameters
    ),
  };
}

export type AttributionDashboardData = Awaited<
  ReturnType<typeof loadAttributionDashboardData>
>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const subscription = await resolveShopEntitlements({
    shopDomain: session.shop,
  });
  const accessMode = subscription?.entitlements
    ? getAnalyticsAccessMode(subscription.entitlements)
    : "SUMMARY";

  return defer({
    pixelStatus: getPixelStatus(admin),
    analytics:
      accessMode === "SUMMARY"
        ? loadFreeAttributionSummary(session.shop)
        : loadAttributionDashboardData({ shopId: session.shop, url }),
  });
};
