import React from "react";
import { renderToString } from "react-dom/server";

const pendingChart = new Promise<never>(() => {});

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
  FunnelHero: () => null,
  TopCampaigns: () => null,
}));

jest.mock("../../../app/components/analytics/lazy", () => ({
  LazyBundleMetricChart: () => {
    throw pendingChart;
  },
}));

describe("Analytics chart loading boundary", () => {
  it("keeps the bundle results available while the chart chunk loads", async () => {
    const { default: AttributionDashboard } = await import(
      "../../../app/routes/app/app.attribution/AttributionDashboard"
    );

    const view = renderToString(
      React.createElement(AttributionDashboard, {
        data: {
          days: 90,
          prevFrom: "2026-03-01",
          prevTo: "2026-05-29",
          funnelSnapshot: {},
          bundleMetricTrend: [],
          bundleMatrix: [],
          topCampaignsRows: [],
          customUtmParameters: [],
        } as any,
      }),
    );

    expect(view).toContain("bundle-matrix-ready");
  });
});
