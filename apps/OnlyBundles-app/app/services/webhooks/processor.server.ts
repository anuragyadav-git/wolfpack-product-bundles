/**
 * Webhook Processor Service
 *
 * Processes webhooks delivered via Google Cloud Pub/Sub.
 * Handles product changes and GDPR compliance.
 *
 * Architecture:
 * - Idempotent processing using WebhookEvent table
 * - Quick response pattern (mark processed, return immediately)
 * - Background queue processing for heavy operations
 *
 * Validated against Shopify best practices:
 * https://shopify.dev/docs/apps/build/webhooks/best-practices
 */

import db from "../../db.server";
import { AppLogger } from "../../lib/logger";
import type { WebhookMessage, WebhookProcessResult } from "./types";
import {
  handleProductDelete,
} from "./handlers/product.server";
import {
  handleCustomerDataRequest,
  handleCustomerRedact,
  handleShopRedact,
} from "./handlers/gdpr.server";
import {
  handleAppUninstalled,
  handleScopesUpdate,
} from "./handlers/lifecycle.server";
import { isActiveWebhookTopic } from "./topics";

/**
 * Main webhook processor entry point
 * Processes Pub/Sub messages from Google Cloud
 */
export class WebhookProcessor {
  private static async markWebhookEvent(
    webhookEventId: string,
    data: {
      processed: boolean;
      processedAt?: Date | null;
      error?: string | null;
    },
    context: {
      topic?: string;
      shopDomain?: string;
      webhookId?: string;
    }
  ): Promise<void> {
    const result = await db.webhookEvent.updateMany({
      where: { id: webhookEventId },
      data
    });

    if (result.count === 0) {
      AppLogger.info("Webhook event row was already removed before final status update", {
        component: "webhook-processor",
        operation: "markWebhookEvent"
      }, context);
    }
  }

  /**
   * Process a normalized Shopify webhook message
   * Implements idempotency and routes to appropriate handler
   */
  static async processWebhookMessage(
    message: WebhookMessage
  ): Promise<WebhookProcessResult> {
    const topic = message.attributes["X-Shopify-Topic"];
    const shopDomain = message.attributes["X-Shopify-Shop-Domain"];
    const webhookId = message.attributes["X-Shopify-Webhook-Id"];

    try {
      if (!isActiveWebhookTopic(topic)) {
        AppLogger.info("Ignored inactive webhook topic before persistence", {
          component: "webhook-processor",
          operation: "processWebhookMessage"
        }, { topic, shop: shopDomain, webhookId });

        return {
          success: true,
          message: `Ignored inactive webhook topic: ${topic}`
        };
      }

      // Decode base64 payload
      const payloadString = Buffer.from(message.data, "base64").toString("utf-8");
      const payload = JSON.parse(payloadString);

      AppLogger.info("Processing webhook", {
        component: "webhook-processor",
        operation: "processWebhookMessage"
      }, { topic, shop: shopDomain, webhookId });

      // Check idempotency - have we processed this webhook before?
      if (webhookId) {
        const existing = await db.webhookEvent.findUnique({
          where: {
            shopDomain_topic_webhookId: {
              shopDomain,
              topic,
              webhookId
            }
          }
        });

        if (existing?.processed) {
          AppLogger.info("Webhook already processed, skipping", {
            component: "webhook-processor",
            operation: "processWebhookMessage"
          }, { topic, shop: shopDomain, webhookId });

          return {
            success: true,
            message: "Webhook already processed"
          };
        }
      }

      // Create webhook event record
      const webhookEvent = await db.webhookEvent.create({
        data: {
          shopDomain,
          topic,
          webhookId,
          payload,
          processed: false
        }
      });

      // Route to appropriate handler
      let result: WebhookProcessResult;

      switch (topic) {
        case "products/delete":
          result = await handleProductDelete(shopDomain, payload);
          break;

        case "customers/data_request":
          result = await handleCustomerDataRequest(shopDomain, payload);
          break;

        case "customers/redact":
          result = await handleCustomerRedact(shopDomain, payload);
          break;

        case "shop/redact":
          result = await handleShopRedact(shopDomain, payload, webhookEvent.id);
          break;

        case "app/uninstalled":
          result = await handleAppUninstalled(shopDomain, payload, webhookEvent.id);
          break;

        case "app/scopes_update":
          result = await handleScopesUpdate(shopDomain, payload);
          break;

        default:
          throw new Error(`Active webhook topic has no handler: ${topic}`);
      }

      // SAFETY: Only mark webhook as processed if handler succeeded
      // Failed webhooks remain unprocessed for potential retry
      if (result.success) {
        await this.markWebhookEvent(
          webhookEvent.id,
          {
            processed: true,
            processedAt: new Date(),
            error: null
          },
          { topic, shopDomain, webhookId }
        );
      } else {
        // Log failure but don't mark as processed
        await this.markWebhookEvent(
          webhookEvent.id,
          {
            processed: false,
            error: result.error
          },
          { topic, shopDomain, webhookId }
        );
      }

      return result;

    } catch (error: any) {
      AppLogger.error("Error processing webhook", {
        component: "webhook-processor",
        operation: "processWebhookMessage"
      }, error);

      return {
        success: false,
        message: "Error processing webhook",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}
