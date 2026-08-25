import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation, useNavigate, useNavigation, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { authenticate } from "../../shopify.server";
import { ErrorPage } from "../../components/ErrorPage";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useEffect, type MouseEvent } from "react";
import { changeAdminI18nLanguage, i18n, loadAdminLocaleResources } from "../../i18n/config";
import { loadShopAdminLocale } from "../../services/admin-locale.server";

type AdminLoadingApi = (isLoading?: boolean) => void;

export function isAdminPageNavigationLoading(
  state: string,
  currentPathname: string,
  destinationPathname?: string,
) {
  return state === "loading"
    && destinationPathname !== undefined
    && destinationPathname !== currentPathname;
}

export function syncAdminNavigationLoading(
  isLoading: boolean,
  loading: AdminLoadingApi,
) {
  loading(isLoading);
  return () => loading(false);
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
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
    void shopify.saveBar.leaveConfirmation().then(() => navigate(href));
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
  const isPageNavigationLoading = isAdminPageNavigationLoading(
    navigation.state,
    location.pathname,
    navigation.location?.pathname,
  );

  useEffect(() => {
    if (i18n.language !== locale) {
      void changeAdminI18nLanguage(locale);
    }
  }, [locale]);

  useEffect(
    () => syncAdminNavigationLoading(isPageNavigationLoading, shopify.loading),
    [isPageNavigationLoading],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <AdminNavigation />
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
