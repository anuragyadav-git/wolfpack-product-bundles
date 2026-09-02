/**
 * Lifecycle Webhook Handlers
 *
 * Handles app lifecycle webhooks delivered through the direct worker and Inngest:
 * - app/uninstalled
 * - app/scopes_update
 *
 * Note: These handlers do NOT have access to the Shopify admin API
 * because background processing does not carry an authenticated Admin API context.
 * Metafield cleanup is handled automatically by Shopify when an app
 * is uninstalled ($app namespace metafields are deleted by Shopify).
 * These handlers focus on database cleanup only.
 */

import db from "../../../db.server";
import { AppLogger } from "../../../lib/logger";
import { getCachedShopifyShopGid, recordBusinessEvent } from "../../app-events.server";
import type { WebhookProcessResult } from "../types";

/**
 * Handle app/uninstalled webhook
 *
 * Performs comprehensive database cleanup when a merchant uninstalls the app.
 * Metafield cleanup is NOT done here because we don't have admin API access
 * in this background handler. Shopify automatically deletes $app namespace metafields on uninstall.
 *
 * Operations are idempotent - safe to run multiple times.
 */
export async function handleAppUninstalled(
  shopDomain: string,
  payload: any,
  currentWebhookEventId?: string
): Promise<WebhookProcessResult> {
  try {
    AppLogger.info("Processing app uninstall", {
      component: "webhook-processor",
      operation: "handleAppUninstalled",
    }, { shop: shopDomain });

    const shopifyShopGid = await getCachedShopifyShopGid(shopDomain);

    // Step 1: Delete all bundles (cascades to steps, step products, pricing)
    const deletedBundles = await db.bundle.deleteMany({
      where: { shopId: shopDomain },
    });

    AppLogger.info("Deleted bundles", {
      component: "webhook-processor",
      operation: "handleAppUninstalled",
    }, { shop: shopDomain, count: deletedBundles.count });

    // Step 2: Delete sessions
    await db.session.deleteMany({
      where: { shop: shopDomain },
    });

    // Step 3: Delete design settings
    try {
      await db.designSettings.deleteMany({
        where: { shopId: shopDomain },
      });
    } catch (e: any) {
      // Non-critical - log and continue
      AppLogger.warn("Failed to delete design settings", {
        component: "webhook-processor",
        operation: "handleAppUninstalled",
      }, { shop: shopDomain, error: e });
    }

    // Step 4: Delete queued jobs
    try {
      await db.queuedJob.deleteMany({
        where: { shopId: shopDomain },
      });
    } catch (e: any) {
      AppLogger.warn("Failed to delete queued jobs", {
        component: "webhook-processor",
        operation: "handleAppUninstalled",
      }, { shop: shopDomain, error: e });
    }

    // Step 5: Delete compliance records
    try {
      await db.complianceRecord.deleteMany({
        where: { shop: shopDomain },
      });
    } catch (e: any) {
      AppLogger.warn("Failed to delete compliance records", {
        component: "webhook-processor",
        operation: "handleAppUninstalled",
      }, { shop: shopDomain, error: e });
    }

    // Step 6: Delete webhook events
    try {
      await db.webhookEvent.deleteMany({
        where: {
          shopDomain,
          ...(currentWebhookEventId ? { id: { not: currentWebhookEventId } } : {})
        },
      });
    } catch (e: any) {
      AppLogger.warn("Failed to delete webhook events", {
        component: "webhook-processor",
        operation: "handleAppUninstalled",
      }, { shop: shopDomain, error: e });
    }

    // Step 7: Delete old business events. Revenue analytics are retained in
    // OrderAttribution and BundleEngagement; those tables are intentionally not
    // touched by uninstall cleanup.
    try {
      await db.businessEvent.deleteMany({
        where: { shopDomain },
      });
    } catch (e: any) {
      AppLogger.warn("Failed to delete business events", {
        component: "webhook-processor",
        operation: "handleAppUninstalled",
      }, { shop: shopDomain, error: e });
    }

    // Step 8: Delete shop record (cascades to subscriptions)
    try {
      await db.shop.deleteMany({
        where: { shopDomain },
      });
    } catch (e: any) {
      AppLogger.warn("Failed to delete shop record", {
        component: "webhook-processor",
        operation: "handleAppUninstalled",
      }, { shop: shopDomain, error: e });
    }

    await recordBusinessEvent({
      eventHandle: "app_uninstalled",
      shopDomain,
      shopifyShopGid,
      surface: "webhook",
      actor: "webhook",
      routeFamily: "lifecycle_webhook",
      result: "success",
      attributes: {
        topic: "APP_UNINSTALLED",
      },
    });

    AppLogger.info("App uninstall cleanup completed", {
      component: "webhook-processor",
      operation: "handleAppUninstalled",
    }, { shop: shopDomain, bundlesDeleted: deletedBundles.count });

    return {
      success: true,
      message: `App uninstalled, cleaned up ${deletedBundles.count} bundles and all shop data`,
    };
  } catch (error: any) {
    AppLogger.error("Error handling app uninstall", {
      component: "webhook-processor",
      operation: "handleAppUninstalled",
    }, error);

    return {
      success: false,
      message: "Error handling app uninstall",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Handle app/scopes_update webhook
 *
 * Updates the session scope when app permissions change.
 */
export async function handleScopesUpdate(
  shopDomain: string,
  payload: any
): Promise<WebhookProcessResult> {
  try {
    const currentScopes = payload.current;

    if (!currentScopes || !Array.isArray(currentScopes)) {
      return {
        success: false,
        message: "Missing or invalid current scopes in payload",
        error: "payload.current must be an array",
      };
    }

    AppLogger.info("Processing scopes update", {
      component: "webhook-processor",
      operation: "handleScopesUpdate",
    }, { shop: shopDomain, scopes: currentScopes });

    // Update all sessions for this shop with the current Shopify scopes.
    const updated = await db.session.updateMany({
      where: { shop: shopDomain },
      data: {
        scope: currentScopes.toString(),
      },
    });

    AppLogger.info("Updated session scopes", {
      component: "webhook-processor",
      operation: "handleScopesUpdate",
    }, { shop: shopDomain, sessionsUpdated: updated.count });

    return {
      success: true,
      message: `Updated ${updated.count} session scopes`,
    };
  } catch (error: any) {
    AppLogger.error("Error handling scopes update", {
      component: "webhook-processor",
      operation: "handleScopesUpdate",
    }, error);

    return {
      success: false,
      message: "Error handling scopes update",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
