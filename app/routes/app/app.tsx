import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useNavigate, useNavigation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { authenticate, sessionStorage } from "../../shopify.server";
import prisma from "../../db.server";
import { ErrorPage } from "../../components/ErrorPage";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useEffect, type MouseEvent } from "react";
import { changeAdminI18nLanguage, i18n, loadAdminLocaleResources } from "../../i18n/config";
import { ensureShopHasExpiringOfflineSession } from "../../services/offline-token.server";
import { AppLogger } from "../../lib/logger";
import { loadShopAdminLocale } from "../../services/admin-locale.server";
import { installAdminWebVitalsDiagnostics } from "../../lib/admin-web-vitals-diagnostics.client";
import { runAfterSaveBarLeaveConfirmation } from "../../lib/admin-savebar-navigation.client";
import { AdminRouteLoadingBar } from "../../components/AdminRouteLoadingBar";

function ensureExpiringOfflineSessionInBackground(shop: string, idToken?: string | null) {
  void ensureShopHasExpiringOfflineSession(prisma, shop, sessionStorage, { idToken }).catch((error) => {
    AppLogger.error("Failed to ensure expiring offline session during app load", {
      component: "app.app",
      shop,
    }, error);
  });
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const idToken = url.searchParams.get("id_token");
  ensureExpiringOfflineSessionInBackground(session.shop, idToken);
  const locale = await loadShopAdminLocale(session.shop);
  await loadAdminLocaleResources(locale);
  return {
    apiKey: process.env.SHOPIFY_API_KEY || "",
    locale,
    shop: session.shop,
  };
};

function AdminNavigation() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigation = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const shopify = (
      typeof window === "undefined"
        ? undefined
        : (window as typeof window & {
            shopify?: { saveBar?: { leaveConfirmation?: () => Promise<void> | void } };
          }).shopify
    );
    if (!shopify?.saveBar?.leaveConfirmation) {
      navigate(href);
      return;
    }
    void runAfterSaveBarLeaveConfirmation(
      {
        saveBar: {
          leaveConfirmation: () => shopify.saveBar?.leaveConfirmation?.(),
        },
      },
      () => navigate(href),
    );
  };

  return (
    <ui-nav-menu>
      <a href="/app/dashboard" rel="home" onClick={handleNavigation("/app/dashboard")}>{t("nav.dashboard")}</a>
      <a href="/app/settings" onClick={handleNavigation("/app/settings")}>{t("nav.settings")}</a>
      <a href="/app/integrations" onClick={handleNavigation("/app/integrations")}>{t("nav.integrations")}</a>
      <a href="/app/attribution" onClick={handleNavigation("/app/attribution")}>{t("nav.analytics")}</a>
      <a href="/app/events" onClick={handleNavigation("/app/events")}>{t("nav.events")}</a>
    </ui-nav-menu>
  );
}

export default function App() {
  const { locale } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigation = useNavigation();
  const isPageNavigationLoading = navigation.state === "loading"
    && navigation.location?.pathname !== undefined
    && navigation.location.pathname !== location.pathname;

  useEffect(() => {
    if (i18n.language !== locale) {
      void changeAdminI18nLanguage(locale);
    }
  }, [locale]);

  useEffect(() => {
    return installAdminWebVitalsDiagnostics();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <AdminNavigation />
      {isPageNavigationLoading ? (
        <AdminRouteLoadingBar label="Loading page" />
      ) : null}
      <Outlet />
    </I18nextProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status !== 401 && error.status !== 403) {
    return <ErrorPage error={error} />;
  }
  return boundary.error(error);
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
