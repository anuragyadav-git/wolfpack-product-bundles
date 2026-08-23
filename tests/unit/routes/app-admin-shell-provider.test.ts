import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

jest.mock("@remix-run/react", () => ({
  Outlet: () => React.createElement("main", null, "outlet"),
  useLoaderData: jest.fn(),
  useLocation: jest.fn(),
  useNavigation: jest.fn(),
  useNavigate: () => jest.fn(),
  useRouteError: () => null,
  isRouteErrorResponse: jest.fn(),
}));

jest.mock("@shopify/shopify-app-remix/server", () => ({
  boundary: {
    error: jest.fn(),
    headers: jest.fn(),
  },
}));

jest.mock("../../../app/shopify.server", () => ({
  authenticate: {
    admin: jest.fn(),
  },
  sessionStorage: { storeSession: jest.fn() },
}));

jest.mock("../../../app/db.server", () => ({
  __esModule: true,
  default: { session: {} },
}));

jest.mock("../../../app/services/offline-token.server", () => ({
  ensureShopHasExpiringOfflineSession: jest.fn(),
}));

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    error: jest.fn(),
  },
}));

jest.mock("../../../app/services/admin-locale.server", () => ({
  loadShopAdminLocale: jest.fn(),
}));

jest.mock("react-i18next", () => ({
  I18nextProvider: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../app/i18n/config", () => ({
  changeAdminI18nLanguage: jest.fn(),
  i18n: {
    language: "en",
    changeLanguage: jest.fn(),
  },
  loadAdminLocaleResources: jest.fn(),
}));

jest.mock("../../../app/components/ErrorPage", () => ({
  ErrorPage: () => null,
}));

const { useLoaderData, useLocation, useNavigation } = require("@remix-run/react");

describe("app Admin shell provider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({ pathname: "/app/dashboard" });
    useNavigation.mockReturnValue({ state: "idle" });
  });

  it("renders the Admin tree without global React Polaris or Redux providers", async () => {
    useLoaderData.mockReturnValue({
      apiKey: "shopify-api-key",
      locale: "en",
      shop: "test-shop.myshopify.com",
    });
    const { default: App } = await import("../../../app/routes/app/app");

    const markup = renderToStaticMarkup(React.createElement(App));
    expect(markup).not.toContain("data-shopify-app-provider");
    expect(markup).not.toContain("data-redux-provider");
    expect(markup).not.toContain("data-mantle-provider");
    expect(markup).toContain("<main>outlet</main>");
  });

  it("renders the shared top-edge loading bar while another Admin page is loading", async () => {
    useLoaderData.mockReturnValue({
      apiKey: "shopify-api-key",
      locale: "en",
      shop: "test-shop.myshopify.com",
    });
    useNavigation.mockReturnValue({
      state: "loading",
      location: { pathname: "/app/settings" },
    });
    const { default: App } = await import("../../../app/routes/app/app");

    const view = renderToStaticMarkup(React.createElement(App));

    expect(view).toContain('role="progressbar"');
    expect(view).toContain('aria-label="Loading page"');
  });

  it.each([
    ["loading", "/app/dashboard"],
    ["submitting", "/app/settings"],
  ])("hides the shell bar for %s state after the current screen is available", async (state, pathname) => {
    useLoaderData.mockReturnValue({
      apiKey: "shopify-api-key",
      locale: "en",
      shop: "test-shop.myshopify.com",
    });
    useNavigation.mockReturnValue({ state, location: { pathname } });
    const { default: App } = await import("../../../app/routes/app/app");

    const view = renderToStaticMarkup(React.createElement(App));

    expect(view).not.toContain('aria-label="Loading page"');
  });
});
