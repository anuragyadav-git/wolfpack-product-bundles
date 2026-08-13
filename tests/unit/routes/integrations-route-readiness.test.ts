import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  IntegrationsLoadingState,
  waitForIntegrationsRouteReady,
} from "../../../app/routes/app/app.integrations/IntegrationsRouteShell";

function createDeferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

describe("Integrations route readiness", () => {
  it("keeps the catalog hidden until the shared loading interval completes", async () => {
    const loading = createDeferred();
    const settled = jest.fn();

    const routeReady = waitForIntegrationsRouteReady(loading.promise);
    void routeReady.then(settled);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();

    loading.resolve();
    await expect(routeReady).resolves.toBeNull();
  });

  it("renders only the shared loading bar while the catalog is preparing", () => {
    const view = renderToStaticMarkup(
      React.createElement(IntegrationsLoadingState),
    );

    expect(view).toContain('role="progressbar"');
    expect(view).toContain('aria-label="Loading Integrations"');
    expect(view).not.toContain("Integrations Hub");
  });
});
