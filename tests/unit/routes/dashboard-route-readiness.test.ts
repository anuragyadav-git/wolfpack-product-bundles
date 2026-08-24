import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  DashboardLoadingWorkspace,
  waitForDashboardRouteReady,
} from "../../../app/routes/app/app.dashboard/dashboard-route-readiness";
import { DashboardStatusGrid } from "../../../app/routes/app/app.dashboard/DashboardStatusGrid";

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

describe("Dashboard route readiness", () => {
  it("waits for every Dashboard dependency before resolving content", async () => {
    const bannerData = createDeferred<{ proxyHealthy: boolean }>();
    const settled = jest.fn();

    const routeReady = waitForDashboardRouteReady(
      bannerData.promise,
      Promise.resolve(),
    );
    void routeReady.then(settled);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    bannerData.resolve({ proxyHealthy: true });
    await expect(routeReady).resolves.toEqual({
      banners: { proxyHealthy: true },
    });
  });

  it("renders the shared loading bar with the workspace message", () => {
    const view = renderToStaticMarkup(
      React.createElement(DashboardLoadingWorkspace),
    );

    expect(view).toContain('role="progressbar"');
    expect(view).toContain('aria-label="Loading Dashboard"');
    expect(view).toContain("Loading your workspace");
    expect(view).not.toContain("Loading dashboard banner");
  });

  it("renders the App Embed banner instead of a skeleton after route readiness", () => {
    const view = renderToStaticMarkup(
      React.createElement(DashboardStatusGrid, {
        resources: [],
        error: false,
        appEmbedEnabled: true,
        themeEditorUrl: null,
        onOpenThemeEditor: jest.fn(),
      }),
    );

    expect(view).toContain("<s-banner");
    expect(view).not.toContain("Loading dashboard banner");
  });
});
