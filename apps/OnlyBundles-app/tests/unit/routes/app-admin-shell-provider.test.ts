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

jest.mock("../../../app/lib/logger", () => ({
  AppLogger: {
    error: jest.fn(),
  },
}));

jest.mock("react-i18next", () => ({
  I18nextProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../../app/i18n/config", () => ({
  changeAdminI18nLanguage: jest.fn(),
  i18n: {
    language: "en",
    changeLanguage: jest.fn(),
  },
  loadAdminLocaleResources: jest.fn(),
  resolveAdminLocaleFromRequest: jest.fn(() => "en"),
}));

jest.mock("../../../app/components/ErrorPage", () => ({
  ErrorPage: () => null,
}));

const {
  useLoaderData,
  useLocation,
  useNavigation,
} = require("@remix-run/react");
const { authenticate } = require("../../../app/shopify.server");
const {
  loadAdminLocaleResources,
  resolveAdminLocaleFromRequest,
} = require("../../../app/i18n/config");

describe("app Admin shell provider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLocation.mockReturnValue({ pathname: "/app/dashboard" });
    useNavigation.mockReturnValue({ state: "idle" });
  });

  it("authenticates the shared Admin layout before returning shop data", async () => {
    authenticate.admin.mockResolvedValue({
      session: { shop: "authenticated-shop.myshopify.com" },
    });
    resolveAdminLocaleFromRequest.mockReturnValue("fr");
    const { loader } = await import("../../../app/routes/app/app");
    const request = new Request("https://example.com/app/dashboard");

    const data = await loader({ request, params: {}, context: {} } as any);

    expect(authenticate.admin).toHaveBeenCalledWith(request);
    expect(loadAdminLocaleResources).toHaveBeenCalledWith("fr");
    expect(data).toEqual(
      expect.objectContaining({
        locale: "fr",
        shop: "authenticated-shop.myshopify.com",
      })
    );
  });

  it("propagates Shopify authentication failures before loading Admin data", async () => {
    const authFailure = new Response(null, {
      status: 302,
      headers: { Location: "/auth/login" },
    });
    authenticate.admin.mockRejectedValueOnce(authFailure);
    const { loader } = await import("../../../app/routes/app/app");

    await expect(
      loader({
        request: new Request("https://example.com/app/dashboard"),
        params: {},
        context: {},
      } as any)
    ).rejects.toBe(authFailure);
    expect(loadAdminLocaleResources).not.toHaveBeenCalled();
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
    expect(markup).toContain("<main>outlet</main>");
  });

  it("renders canonical App Bridge navigation with parent route links", async () => {
    useLoaderData.mockReturnValue({
      apiKey: "shopify-api-key",
      locale: "en",
      shop: "test-shop.myshopify.com",
    });
    const { default: App } = await import("../../../app/routes/app/app");

    const view = renderToStaticMarkup(React.createElement(App));

    expect(view).toContain("<s-app-nav>");
    expect(view).toContain(
      '<s-link href="/app/dashboard">nav.dashboard</s-link>'
    );
    expect(view).toContain(
      '<s-link href="/app/settings">nav.settings</s-link>'
    );
    expect(view).toContain(
      '<s-link href="/app/integrations">nav.integrations</s-link>'
    );
    expect(view).toContain(
      '<s-link href="/app/attribution">nav.analytics</s-link>'
    );
    expect(view).toContain('<s-link href="/app/billing">nav.billing</s-link>');
    expect(view).not.toContain('/app/events');
    expect(view).not.toContain("<ui-nav-menu>");
  });

  it("keeps the current Admin page rendered while another page is loading", async () => {
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

    expect(view).toContain("<main>outlet</main>");
    expect(view).not.toContain('role="progressbar"');
  });

  it.each([
    ["loading", "/app/dashboard"],
    ["submitting", "/app/settings"],
  ])(
    "does not render app-owned navigation feedback for %s state",
    async (state, pathname) => {
      useLoaderData.mockReturnValue({
        apiKey: "shopify-api-key",
        locale: "en",
        shop: "test-shop.myshopify.com",
      });
      useNavigation.mockReturnValue({ state, location: { pathname } });
      const { default: App } = await import("../../../app/routes/app/app");

      const view = renderToStaticMarkup(React.createElement(App));

      expect(view).not.toContain('aria-label="Loading page"');
    }
  );

  it("identifies only pathname-changing loader navigation", async () => {
    const { isAdminPageNavigationLoading } = await import(
      "../../../app/routes/app/app"
    );

    expect(
      isAdminPageNavigationLoading("loading", "/app/dashboard", "/app/settings")
    ).toBe(true);
    expect(
      isAdminPageNavigationLoading(
        "loading",
        "/app/dashboard",
        "/app/dashboard"
      )
    ).toBe(false);
    expect(
      isAdminPageNavigationLoading(
        "submitting",
        "/app/dashboard",
        "/app/settings"
      )
    ).toBe(false);
  });

  it("starts and cleans up Shopify Admin navigation loading", async () => {
    const { syncAdminNavigationLoading } = await import(
      "../../../app/routes/app/app"
    );
    const loading = jest.fn();

    const cleanup = syncAdminNavigationLoading(true, loading);

    expect(loading).toHaveBeenCalledWith(true);
    cleanup();
    expect(loading).toHaveBeenLastCalledWith(false);
  });
});
