import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { AppLogger } from "../../../lib/logger";
import { ERROR_MESSAGES } from "../../../constants/errors";
import { authenticate } from "../../../shopify.server";
import db from "../../../db.server";
import {
  handleSaveBundle,
  handleUpdateBundleStatus,
  handleSyncProduct,
  handleUpdateBundleProduct,
  handleGetPages,
  handleGetThemeTemplates,
  handleGetCurrentTheme,
  handleEnsureBundleTemplates,
  handleValidateWidgetPlacement,
  handleUpdateBundleDesignTemplate,
  handleAssignProductTemplate,
} from "./handlers";
import { handleValidateSellingPlanGroups } from "../../../services/bundle-subscription-discovery.server";
import { fetchBundleConfigureShopifyData } from "../../../lib/bundle-configure-loader.server";
import { handleRecordBundlePreview } from "../shared/bundle-preview-action.server";
import {
  handlePrepareStorefrontPreview,
  handleSyncStorefrontNow,
} from "../shared/storefront-sync-action.server";
import { createBundlePreviewToken } from "../../../lib/bundle-preview-token.server";
import ConfigureBundleFlow from "./ConfigureBundleFlow";
import { ReduxProvider } from "../../../store/ReduxProvider";
import { buildSpecificLinkOfferAdminState } from "../../../lib/specific-link-offer-admin";
import {
  handleGenerateSpecificLinkOffer,
  handleRevokeSpecificLinkOffer,
} from "../shared/specific-link-offer-action.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
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
      offerPolicy: {
        select: {
          specificLinkRequired: true,
          priority: true,
          stopLowerPriority: true,
          scheduleMode: true,
          startsAt: true,
          endsAt: true,
          recurrenceFrequency: true,
          recurrenceTimezone: true,
          recurrenceAnchorDate: true,
          recurrenceWindowStartMinute: true,
          recurrenceWindowEndMinute: true,
          recurrenceTermination: true,
          recurrenceEndsOn: true,
          recurrenceRunCount: true,
          countryTargetingEnabled: true,
          countryTargetingMode: true,
          countryCodes: true,
          ruleVersion: true,
          conditions: {
            where: { type: "specific_link" },
            orderBy: { position: "asc" },
            take: 1,
            select: { expiresAt: true, revokedAt: true },
          },
        },
      },
    },
  });

  if (!bundle) {
    throw new Response(ERROR_MESSAGES.BUNDLE_NOT_FOUND, { status: 404 });
  }

  // CRITICAL: Use app's API key (client_id from shopify.app.toml), NOT extension UUID
  // Per Shopify docs: addAppBlockId={api_key}/{handle}
  // Reference: https://shopify.dev/docs/apps/build/online-store/theme-app-extensions/configuration
  const apiKey = process.env.SHOPIFY_API_KEY || "";
  // Block handle must match the liquid filename (without .liquid extension)
  // File: extensions/bundle-builder/blocks/bundle-product-page.liquid
  const blockHandle = "bundle-product-page";

  const shopifyData = await fetchBundleConfigureShopifyData(
    admin,
    bundle.shopifyProductId,
    bundleId
  );

  const { offerPolicy, ...safeBundle } = bundle;
  return json({
    bundle: safeBundle,
    offerDelivery: buildSpecificLinkOfferAdminState(
      offerPolicy,
      shopifyData.shopIanaTimezone
    ),
    bundleProduct: shopifyData.bundleProduct,
    shop: session.shop,
    configureMode,
    showFirstLoadTour,
    apiKey,
    blockHandle,
    shopLocales: shopifyData.shopLocales,
    shopCurrencyCode: shopifyData.shopCurrencyCode,
    previewToken: createBundlePreviewToken({
      shop: session.shop,
      bundleId,
    }),
  });
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  try {
    const { session, admin } = await authenticate.admin(request);
    const { bundleId } = params;

    if (!session?.shop) {
      return json(
        { success: false, error: ERROR_MESSAGES.AUTH_REQUIRED },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (!bundleId) {
      return json(
        { success: false, error: ERROR_MESSAGES.BUNDLE_ID_REQUIRED },
        { status: 400 }
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
          formData
        );
      case "syncProduct":
        return await handleSyncProduct(admin, session, bundleId, formData);
      case "updateBundleProduct":
        return await handleUpdateBundleProduct(
          admin,
          session,
          bundleId,
          formData
        );
      case "getPages":
        return await handleGetPages(admin, session);
      case "getThemeTemplates":
        return await handleGetThemeTemplates(admin, session);
      case "getCurrentTheme":
        return await handleGetCurrentTheme(admin, session);
      case "ensureBundleTemplates":
        return await handleEnsureBundleTemplates(admin, session);
      case "validateWidgetPlacement":
        return await handleValidateWidgetPlacement(admin, session, bundleId);
      case "syncBundle":
        return await handleSyncStorefrontNow(
          admin,
          session,
          bundleId,
          "product_page",
          "sync_bundle"
        );
      case "preparePreviewBundle":
        return await handlePrepareStorefrontPreview(
          admin,
          session,
          bundleId,
          "product_page"
        );
      case "updateBundleDesignTemplate":
        return await handleUpdateBundleDesignTemplate(
          admin,
          session,
          bundleId,
          formData
        );
      case "assignProductTemplate":
        return await handleAssignProductTemplate(
          admin,
          session,
          bundleId,
          formData
        );
      case "recordBundlePreview":
        return await handleRecordBundlePreview(
          admin,
          session,
          bundleId,
          formData
        );
      case "generateSpecificLinkOffer":
        return await handleGenerateSpecificLinkOffer(
          session,
          bundleId,
          formData
        );
      case "revokeSpecificLinkOffer":
        return await handleRevokeSpecificLinkOffer(admin, session, bundleId);
      case "validateSellingPlanGroups":
        return await handleValidateSellingPlanGroups(
          admin,
          session,
          bundleId,
          "product_page"
        );
      default:
        return json(
          { success: false, error: ERROR_MESSAGES.UNKNOWN_ACTION },
          { status: 400 }
        );
    }
  } catch (error: any) {
    AppLogger.error(
      "Action failed",
      {
        component: "bundle-config",
        operation: "action",
      },
      error
    );
    return json(
      {
        success: false,
        error: (error as Error).message || "An error occurred",
      },
      { status: 500 }
    );
  }
};

export default function ProductPageBundleConfigureRoute() {
  return (
    <ReduxProvider>
      <ConfigureBundleFlow />
    </ReduxProvider>
  );
}
