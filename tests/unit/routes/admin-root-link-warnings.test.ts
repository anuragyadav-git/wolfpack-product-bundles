import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@remix-run/react", () => ({
  Links: () => null,
  Meta: () => null,
  Outlet: () => null,
  Scripts: () => null,
  ScrollRestoration: () => null,
  useLoaderData: () => ({ apiKey: "test_api_key" }),
  useRouteError: () => null,
  useRouteLoaderData: () => ({ apiKey: "test_api_key" }),
}));

jest.mock("../../../app/components/CrispChat", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("../../../app/components/ErrorPage", () => ({
  ErrorPage: () => null,
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: {},
}));

jest.mock("../../../app/lib/loader-cache.server", () => ({
  loaderCache: {
    getOrSet: jest.fn(),
  },
}));

jest.mock("../../../app/lib/server-timing.server", () => ({
  ServerTiming: jest.fn(),
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: { admin: jest.fn() },
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock("../../../app/components/ProxyHealthBanner", () => ({
  ProxyHealthBanner: () => null,
}));

jest.mock("../../../app/hooks/useDashboardState", () => ({
  useDashboardState: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../app/i18n/config", () => ({
  normalizeAdminLocale: (locale: string | null | undefined) => locale ?? "en",
}));

jest.mock("@shopify/app-bridge-react", () => ({
  useAppBridge: () => ({}),
}));

jest.mock("../../../app/services/admin-locale.server", () => ({
  saveShopAdminLocale: jest.fn(),
}));

jest.mock("../../../app/routes/app/app.dashboard/handlers", () => ({
  handleCloneBundle: jest.fn(),
  handleDeleteBundle: jest.fn(),
}));

jest.mock("../../../app/routes/app/app.dashboard/dashboard.module.css", () => ({}), {
  virtual: true,
});

describe("admin root link warnings", () => {
  it("does not render the font stylesheet onLoad handler as a string listener", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const { default: App } = await import("../../../app/root");

    expect(renderToStaticMarkup(React.createElement(App))).not.toContain("onLoad=\"this.media='all'\"");
    expect(renderToStaticMarkup(React.createElement(App))).not.toContain("onload=\"this.media='all'\"");
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("Expected `%s` listener to be a function"),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
    );
    consoleError.mockRestore();
  });

  it("renders the Admin font stylesheet without a pre-hydration media mutation", async () => {
    const { default: App } = await import("../../../app/root");
    const documentMarkup = renderToStaticMarkup(React.createElement(App));

    expect(documentMarkup).toMatch(
      /rel="stylesheet" href="https:\/\/cdn\.shopify\.com\/static\/fonts\/inter\/v4\/styles\.css"/,
    );
    expect(documentMarkup).not.toContain('media="print"');
  });

  it("preloads only first-render dashboard media with React-safe responsive image attributes", async () => {
    const { headers, links } = await import("../../../app/routes/app/app.dashboard/route");
    const preloads = links().filter((link) => (link as any).rel === "preload");

    expect(preloads).toHaveLength(1);
    expect(preloads[0]).toMatchObject({
      rel: "preload",
      as: "image",
      href: "/Parth.avif",
      imageSrcSet: "/Parth.avif 120w",
      imageSizes: "120px",
      fetchpriority: "high",
    });
    for (const preload of preloads) {
      expect(preload).not.toHaveProperty("fetchPriority");
      expect(preload).not.toHaveProperty("imagesrcset");
      expect(preload).not.toHaveProperty("imagesizes");
    }
    expect(headers({} as any)).not.toHaveProperty("Link");
  });

  it("renders OptimisedImage fetch priority without the React DOM prop warning", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const { OptimisedImage } = await import("../../../app/components/OptimisedImage");
    const view = renderToStaticMarkup(
      React.createElement(OptimisedImage, {
        src: "/Parth.jpg",
        alt: "Parth",
        width: 120,
        height: 120,
        loading: "eager",
        fetchPriority: "high",
      }),
    );

    expect(view).toContain('fetchpriority="high"');
    expect(view).not.toContain("fetchPriority");
    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("React does not recognize the `%s` prop on a DOM element"),
      "fetchPriority",
      "fetchpriority",
      expect.anything(),
    );
    consoleError.mockRestore();
  });
});
