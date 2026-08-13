import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { AppLogger } from "../../../lib/logger";
import { ERROR_MESSAGES } from "../../../constants/errors";
import { requireAdminSession } from "../../../lib/auth-guards.server";
import db from "../../../db.server";
import {
  fetchBundleProduct,
  fetchShopCurrencyCode,
  fetchShopLocales,
  fetchEmbedData,
} from "../../../lib/bundle-configure-loader.server";
import {
  handleSaveBundle,
  handleUpdateBundleStatus,
  handleSyncProduct,
  handleUpdateBundleProduct,
  handleUpdateBundleDesignTemplate,
} from "./handlers";
import { handleRecordBundlePreview } from "../shared/bundle-preview-action.server";
import {
  handleSyncStorefrontNow,
  handlePrepareStorefrontPreview,
} from "../shared/storefront-sync-action.server";
import ConfigureBundleFlow from "./ConfigureBundleFlow";
import { ReduxProvider } from "../../../store/ReduxProvider";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, admin } = await requireAdminSession(request);
  const { bundleId } = params;
  const url = new URL(request.url);
  const configureMode =
    url.searchParams.get("mode") === "create" ? "create" : "edit";
  const showFirstLoadTour =
    configureMode === "create" && url.searchParams.get("first_load") === "true";

  if (!bundleId) {
    throw new Response(ERROR_MESSAGES.BUNDLE_ID_REQUIRED, { status: 400 });
  }

  // Fetch the bundle with all related data
  const bundle = await db.bundle.findUnique({
    where: {
      id: bundleId,
      shopId: session.shop,
      // Note: bundleType filter removed - not needed for single bundle lookup
    },
    include: {
      steps: {
        include: {
          StepProduct: true,
          StepCategory: { orderBy: { sortOrder: "asc" } },
        },
      },
      pricing: true,
    },
  });

  if (!bundle) {
    throw new Response(ERROR_MESSAGES.BUNDLE_NOT_FOUND, { status: 404 });
  }

  // CRITICAL: Use app's API key (client_id from shopify.app.toml), NOT extension UUID
  // Per Shopify docs: addAppBlockId={api_key}/{handle}
  // Reference: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration
  const apiKey = process.env.SHOPIFY_API_KEY || "";

  const [bundleProduct, shopCurrencyCode, shopLocales, availableBundles, embedData] =
    await Promise.all([
      bundle.shopifyProductId
        ? fetchBundleProduct(admin, bundle.shopifyProductId, bundleId)
        : Promise.resolve(null),
      fetchShopCurrencyCode(admin),
      fetchShopLocales(admin),
      db.bundle.findMany({
        where: {
          shopId: session.shop,
          bundleType: "full_page",
          status: { in: ["draft", "active"] },
        },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
      fetchEmbedData(admin, session.shop, apiKey, "bundle-app-embed"),
    ]);

  return json({
    bundle,
    bundleProduct,
    availableBundles,
    shop: session.shop,
    configureMode,
    showFirstLoadTour,
    apiKey,
    shopLocales,
    shopCurrencyCode,
    appEmbedEnabled: embedData.appEmbedEnabled,
    themeEditorUrl: embedData.themeEditorUrl,
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const { session, admin } = await requireAdminSession(request);
    const { bundleId } = params;

    if (!session?.shop) {
      return json(
        { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 },
      );
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (!bundleId) {
      return json(
        { success: false, error: ERROR_MESSAGES.BUNDLE_ID_REQUIRED },
        { status: 400 },
      );
    }

    switch (intent) {
      case "saveBundle":
        return await handleSaveBundle(admin, session, bundleId, formData);
      case "updateBundleStatus":
        return await handleUpdateBundleStatus(
          admin,
          session,
          bundleId,
          formData,
        );
      case "syncProduct":
        return await handleSyncProduct(admin, session, bundleId, formData);
      case "updateBundleProduct":
        return await handleUpdateBundleProduct(
          admin,
          session,
          bundleId,
          formData,
        );
      case "recordBundlePreview":
        return await handleRecordBundlePreview(admin, session, bundleId, formData);
      case "syncBundle":
        return await handleSyncStorefrontNow(admin, session, bundleId, "full_page", "sync_bundle");
      case "preparePreviewBundle":
        return await handlePrepareStorefrontPreview(admin, session, bundleId, "full_page");
      case "updateBundleDesignTemplate":
        return await handleUpdateBundleDesignTemplate(
          admin,
          session,
          bundleId,
          formData,
        );
      default:
        return json(
          { success: false, error: ERROR_MESSAGES.UNKNOWN_ACTION },
          { status: 400 },
        );
    }
  } catch (error) {
    AppLogger.error(
      "Action failed",
      {
        component: "bundle-config",
        operation: "action",
      },
      error,
    );
    return json(
      {
        success: false,
        error: (error as Error).message || "An error occurred",
      },
      { status: 500 },
    );
  }
};

export default function FullPageBundleConfigureRoute() {
  return (
    <ReduxProvider>
      <ConfigureBundleFlow />
    </ReduxProvider>
  );
}
