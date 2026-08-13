import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@remix-run/react", () => ({
  useLoaderData: jest.fn(() => ({
    analytics: new Promise(() => {}),
    pixelStatus: new Promise(() => {}),
  })),
  useNavigate: jest.fn(() => jest.fn()),
  Await: ({ children }: { children: (value: unknown) => React.ReactNode }) =>
    React.createElement(React.Fragment, null, children({ active: false })),
}));

jest.mock("../../../app/lib/auth-guards.server", () => ({
  requireAdminSession: jest.fn(),
}));

jest.mock("../../../app/services/pixel-activation.server", () => ({
  getPixelStatus: jest.fn(),
  activateUtmPixel: jest.fn(),
  deactivateUtmPixel: jest.fn(),
}));

jest.mock("../../../app/services/analytics/order-backfill.server", () => ({
  backfillOrderAttribution: jest.fn(),
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {
    orderAttribution: { findMany: jest.fn() },
    bundle: { findMany: jest.fn() },
    bundleAnalytics: { findMany: jest.fn() },
    bundleEngagement: { findMany: jest.fn() },
  },
}));

describe("app.attribution route shell", () => {
  it("renders only the loading bar before attribution content is ready", async () => {
    const { default: AttributionRoute } = await import("../../../app/routes/app/app.attribution");

    const view = renderToStaticMarkup(React.createElement(AttributionRoute));

    expect(view).toContain('role="progressbar"');
    expect(view).toContain('aria-label="Loading Analytics"');
    expect(view).not.toContain("<ui-title-bar");
    expect(view).not.toContain("How shoppers move through your bundles");
    expect(view).not.toContain("UTM Pixel Tracking");
    expect(view).not.toContain("analyticsSkeletonCard");
  });

  it("keeps the shared readiness boundary pending until analytics and pixel status are both ready", async () => {
    const { waitForAnalyticsRouteReady } = await import(
      "../../../app/routes/app/app.attribution/AttributionRouteShell"
    );
    let resolvePixelStatus!: (value: { active: boolean }) => void;
    const pixelStatus = new Promise<{ active: boolean }>((resolve) => {
      resolvePixelStatus = resolve;
    });
    const ready = waitForAnalyticsRouteReady(
      Promise.resolve({ bundleMetricTrend: [] }),
      pixelStatus,
      Promise.resolve(),
    );
    const settled = jest.fn();
    void ready.then(settled);

    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    resolvePixelStatus({ active: true });
    await expect(ready).resolves.toEqual([
      { bundleMetricTrend: [] },
      { active: true },
      undefined,
    ]);
  });
});
