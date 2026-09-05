import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@remix-run/react", () => ({
  useFetcher: jest.fn(() => ({
    data: undefined,
    state: "idle",
    submit: jest.fn(),
    Form: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      React.createElement("form", props, children),
  })),
  useNavigate: jest.fn(() => jest.fn()),
}));

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: jest.fn(() => ({ toast: { show: jest.fn() } })),
}));

jest.mock("../../../app/components/analytics", () => ({
  BundlePerformanceMatrix: () => React.createElement("div", null, "bundle-matrix-ready"),
  BundleConversionFunnel: ({ bundleViews, addedToCart, orders }: Record<string, number>) =>
    React.createElement(
      "div",
      { "data-testid": "bundle-conversion-funnel" },
      `${bundleViews}:${addedToCart}:${orders}`,
    ),
  BundleKeyStatistics: ({ summary }: { summary: { totalOrderRevenue: number } }) =>
    React.createElement("div", null, String(summary.totalOrderRevenue)),
  BundleSalesTrends: ({ trend }: { trend: Array<{ date: string }> }) =>
    React.createElement("div", null, trend.map((point) => point.date).join(",")),
  TopCampaigns: () => null,
}));

function buildData(accessMode: "SUMMARY" | "ADVANCED") {
  return {
    accessMode,
    days: 30,
    from: "2026-08-01",
    to: "2026-08-30",
    prevFrom: null,
    prevTo: null,
    views: { totalViews: accessMode === "ADVANCED" ? 645 : 12 },
    funnelSnapshot: {
      addedToCart: accessMode === "ADVANCED" ? 305 : 7,
      checkedOut: accessMode === "ADVANCED" ? 116 : 3,
    },
    bundleCommerceSummary: {
      totalOrderRevenue: accessMode === "ADVANCED" ? 10_000 : 2_500,
      totalBundleRevenue: 0,
      ordersWithBundles: 0,
      averageOrderValue: null,
      addToCartValue: null,
      totalBundlesPurchased: 0,
    },
    bundleSalesTrend: [
      { date: "2026-08-01", bundleRevenue: 0, ordersWithBundles: 0 },
    ],
    bundleMetricTrend: [],
    bundleMatrix: [],
    topCampaignsRows: [],
    customUtmParameters: [],
    offerAnalytics: {
      selectedOfferPolicyId: null,
      options: [],
      funnelSnapshot: {
        engaged: 0,
        addedToCart: 0,
        checkedOut: 0,
        revenueCents: 0,
      },
    },
  } as any;
}

describe("AttributionDashboard conversion funnel data", () => {
  it.each([
    ["ADVANCED", "645:305:116"],
    ["SUMMARY", "12:7:3"],
  ] as const)("uses the canonical counts in %s mode", async (accessMode, expected) => {
    const { default: AttributionDashboard } = await import(
      "../../../app/routes/app/app.attribution/AttributionDashboard"
    );

    const view = renderToStaticMarkup(
      React.createElement(AttributionDashboard, {
        data: buildData(accessMode),
        onOfferSelectionChange: jest.fn(),
      }),
    );

    expect(view).toContain(expected);
    expect(view.includes("bundle-matrix-ready")).toBe(
      accessMode === "ADVANCED",
    );
    expect(view).toContain(accessMode === "ADVANCED" ? "10000" : "2500");
    expect(view).toContain("2026-08-01");
  });
});
