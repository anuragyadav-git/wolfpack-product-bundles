import { defer, json, type ActionFunctionArgs, type HeadersFunction, type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ServerTiming } from "../../../lib/server-timing.server";
import { authenticate } from "../../../shopify.server";
import db from "../../../db.server";
import { AppLogger } from "../../../lib/logger";
import { getSubscriptionInfoFromCache } from "../../../services/subscription-cache.server";
import { BundleStatus, BundleType } from "../../../constants/bundle";
import { handleCreateFpbPreview, handleRecordBundlePreview } from "../shared/bundle-preview-action.server";
import { saveShopAdminLocale } from "../../../services/admin-locale.server";
import { handleCloneBundle, handleDeleteBundle } from "./handlers";
import { DashboardPage } from "./DashboardPage";
import { ReduxProvider } from "../../../store/ReduxProvider";
import { getDashboardInitialImagePreloads } from "./dashboard-media-state";
import { queueDashboardBackgroundTask } from "./dashboard-background-tasks.server";
import { buildStorefrontApiPath } from "../../../config/storefront-proxy-routes";

/**
 * Preload first-viewport dashboard images via real
 * `<link rel="preload" as="image">` tags emitted during HTML parse.
 * The app embed card image is the measured embedded-app LCP candidate.
 */
export const links: LinksFunction = () => [
  ...getDashboardInitialImagePreloads().map((image) => ({
    rel: "preload",
    as: "image",
    href: image.href,
    imageSrcSet: image.imageSrcSet,
    imageSizes: image.imageSizes,
    type: image.type,
    fetchpriority: "high",
  } as ReturnType<LinksFunction>[number])),
];

export const headers: HeadersFunction = ({ loaderHeaders }) => {
  const headers = new Headers(loaderHeaders);
  headers.set("Timing-Allow-Origin", "https://admin.shopify.com");
  const imagePreloads = getDashboardInitialImagePreloads();
  if (imagePreloads.length > 0) {
    headers.set(
      "Link",
      imagePreloads
      .map((image) => `<${image.href}>; rel=preload; as=image; type=${image.type}; fetchpriority=high`)
      .join(", "),
    );
  }
  return headers;
};

function queueProductHandleBackfill(
  admin: any,
  shopifyProductIds: string[],
  bundlesNeedingBackfill: Array<{ id: string; shopifyProductId: string | null; shopifyProductHandle: string | null; }>,
) {
  if (!shopifyProductIds.length) return;
  void (async () => {
    try {
      const GET_PRODUCTS = `query GetProductHandles($ids: [ID!]!) { nodes(ids: $ids) { ... on Product { id handle } } }`;
      const response = await admin.graphql(GET_PRODUCTS, { variables: { ids: shopifyProductIds } });
      const data = await response.json();
      if (!data?.data?.nodes) return;

      const updates: Promise<unknown>[] = [];
      for (const node of data.data.nodes) {
        if (!node?.id || !node?.handle) continue;
        const bundleToUpdate = bundlesNeedingBackfill.find(b => b.shopifyProductId === node.id);
        if (!bundleToUpdate) continue;
        updates.push(
          db.bundle.update({
            where: { id: bundleToUpdate.id },
            data: { shopifyProductHandle: node.handle },
          }),
        );
      }
      if (updates.length > 0) await Promise.all(updates);
    } catch (error: any) {
      AppLogger.error("Failed to backfill product handles", { component: "app.dashboard", operation: "backfill-product-handles" }, error);
    }
  })();
}

export const dashboardBundleListSelect = {
  id: true,
  publicNumber: true,
  name: true,
  status: true,
  bundleType: true,
  createdAt: true,
  shopifyProductId: true,
  shopifyProductHandle: true,
} as const;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Issue: admin-lcp-phase4-loaders-1.
  // Was: sequential awaits for bundles -> embed-check -> billing -> proxy-health -> shop-graphql.
  // Now: bundles first (required for the rest), then async work for optional metadata
  // backfill. billing + proxy-health are non-blocking and deferred where possible.
  const timing = new ServerTiming();
  const { session, admin } = await timing.track("auth", () => authenticate.admin(request));

  const bundlesPromise = timing.track("db.bundles", () => db.bundle.findMany({
    where: {
      shopId: session.shop,
      status: { in: [BundleStatus.ACTIVE, BundleStatus.DRAFT, BundleStatus.UNLISTED] }
    },
    select: dashboardBundleListSelect,
    orderBy: { createdAt: "desc" },
  }));

  const apiKey = process.env.SHOPIFY_API_KEY || "";
  const bundles = await bundlesPromise;
  const bundlesNeedingBackfill = bundles.filter(
    b => b.bundleType === BundleType.PRODUCT_PAGE && b.shopifyProductId && !b.shopifyProductHandle
  );

  if (bundlesNeedingBackfill.length > 0) {
    const productIds = bundlesNeedingBackfill
      .map((bundle) => bundle.shopifyProductId)
      .filter(Boolean) as string[];
    queueProductHandleBackfill(admin, productIds, bundlesNeedingBackfill);
  }

  const bundlesWithPreview = bundles.map(bundle => ({
    ...bundle,
    previewHandle: bundle.bundleType === BundleType.PRODUCT_PAGE
      ? bundle.shopifyProductHandle
      : bundle.publicNumber === null
        ? null
        : String(bundle.publicNumber),
  }));

  // Billing + proxy-health run concurrently and stream through the deferred
  // response. The Dashboard route readiness boundary keeps the workspace
  // loading surface visible until both are resolved, then reveals all visible
  // Dashboard content together.
  const billingPromise = (async () => {
    try {
      return await getSubscriptionInfoFromCache(session.shop);
    } catch (error: any) {
      AppLogger.error("Failed to fetch subscription info", { component: "app.dashboard", operation: "get-subscription-info" }, error);
      return null;
    }
  })();
  const proxyHealthPromise = (async () => {
    const controller = new AbortController();
    const proxyTimer = setTimeout(() => controller.abort(), 2000);
    try {
      const proxyRes = await fetch(
        `https://${session.shop}${buildStorefrontApiPath("proxy-health")}`,
        { signal: controller.signal },
      );
      if (proxyRes.status === 404) {
        const ct = proxyRes.headers.get("content-type") ?? "";
        if (ct.includes("text/html")) {
          AppLogger.warn("App proxy health check failed", { component: "app.dashboard", operation: "proxy-health-check", shop: session.shop });
          return false;
        }
      }
    } catch {
      /* Timeout or network error — default healthy */
    } finally {
      clearTimeout(proxyTimer);
    }
    return true;
  })();

  const banners = (async () => {
    const [subscriptionInfo, proxyHealthy] = await Promise.all([billingPromise, proxyHealthPromise]);
    return {
      subscription: subscriptionInfo ? {
        plan: subscriptionInfo.plan,
        currentBundleCount: subscriptionInfo.currentBundleCount,
        bundleLimit: subscriptionInfo.bundleLimit,
        canCreateBundle: subscriptionInfo.canCreateBundle,
      } : null,
      proxyHealthy,
    };
  })();
  const appUrl = process.env.SHOPIFY_APP_URL;
  if (appUrl) {
    queueDashboardBackgroundTask(async () => {
      try {
        const existingPixelRes = await admin.graphql(`query { webPixel { id settings } }`);
        const existingPixelData = await existingPixelRes.json();
        const existingId = existingPixelData.data?.webPixel?.id;
        const existingSettings = existingPixelData.data?.webPixel?.settings as Record<string, string> | null;
        if (existingId && existingSettings?.app_server_url === appUrl) {
          // Pixel correct — nothing to do.
        } else {
          if (existingId) {
            await admin.graphql(`mutation webPixelDelete($id: ID!) { webPixelDelete(id: $id) { deletedWebPixelId userErrors { field message } } }`, { variables: { id: existingId } });
          }
          const createRes = await admin.graphql(
            `mutation webPixelCreate($webPixel: WebPixelInput!) { webPixelCreate(webPixel: $webPixel) { userErrors { field message code } webPixel { id settings } } }`,
            { variables: { webPixel: { settings: { app_server_url: appUrl } } } }
          );
          const createData = await createRes.json();
          const errs = createData.data?.webPixelCreate?.userErrors || [];
          if (errs.length > 0) {
            AppLogger.warn("UTM pixel create/reconnect had errors on dashboard load", { component: "app.dashboard", operation: "ensure-web-pixel" }, errs);
          }
        }
      } catch (_err: any) { /* Non-critical */ }
    });
  }

  return defer({
    bundles: bundlesWithPreview,
    shop: session.shop,
    apiKey,
    appUrl,
    banners,
  }, { headers: timing.toHeaders() });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  if (intent === "cloneBundle") return handleCloneBundle(admin, session, formData);
  if (intent === "deleteBundle") return handleDeleteBundle(admin, session, formData);
  if (intent === "saveAdminLocale") {
    try {
      const locale = await saveShopAdminLocale(session.shop, String(formData.get("locale") || ""));
      return json({ success: true, locale });
    } catch {
      return json({ success: false, error: "Unsupported Admin locale" }, { status: 400 });
    }
  }
  if (intent === "createFpbPreview") {
    const bundleId = String(formData.get("bundleId") || "");
    if (!bundleId) return json({ success: false, error: "Missing bundleId" }, { status: 400 });
    return handleCreateFpbPreview(admin, session, bundleId, "dashboard");
  }
  if (intent === "recordBundlePreview") {
    const bundleId = String(formData.get("bundleId") || "");
    if (!bundleId) return json({ success: false, error: "Missing bundleId" }, { status: 400 });
    return handleRecordBundlePreview(admin, session, bundleId, formData);
  }
  return json({ error: "Unknown action" }, { status: 400 });
};

export default function Dashboard() {
  const { banners } = useLoaderData<typeof loader>();

  return (
    <ReduxProvider>
      <DashboardPage banners={banners} />
    </ReduxProvider>
  );
}
