import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DashboardDeferredProxyHealthBanner } from "../../../app/routes/app/app.dashboard/DashboardDeferredProxyHealthBanner";

jest.mock("@remix-run/react", () => ({
  Await: ({ children, resolve }: { children: (value: unknown) => React.ReactNode; resolve: unknown }) =>
    React.createElement(React.Fragment, null, children(resolve)),
}));

jest.mock("../../../app/components/ProxyHealthBanner", () => ({
  ProxyHealthBanner: () => React.createElement("aside", null, "Proxy warning"),
}));

describe("Dashboard deferred status feedback", () => {
  it("renders the proxy warning only from resolved unhealthy banner data", () => {
    let view = renderToStaticMarkup(React.createElement(DashboardDeferredProxyHealthBanner, {
      appUrl: "https://example.test",
      banners: { proxyHealthy: false },
      shop: "example.myshopify.com",
    }));
    expect(view).toContain("Proxy warning");

    view = renderToStaticMarkup(React.createElement(DashboardDeferredProxyHealthBanner, {
      appUrl: "https://example.test",
      banners: { proxyHealthy: true },
      shop: "example.myshopify.com",
    }));
    expect(view).not.toContain("Proxy warning");
  });
});
