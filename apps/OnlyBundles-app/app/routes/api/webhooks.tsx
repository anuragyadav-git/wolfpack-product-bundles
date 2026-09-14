import { json, type ActionFunctionArgs } from "@remix-run/node";
import { inngest } from "../../inngest/client";
import type { ShopifyWebhookEventData } from "../../inngest/types";
import { AppLogger } from "../../lib/logger";
import { isTrackedBundleProductDelete } from "../../services/webhooks/product-delete-relevance.server";
import { isActiveWebhookTopic } from "../../services/webhooks/topics";
import { authenticate } from "../../shopify.server";

function normalizeWebhookTopic(topic: string): string {
  return topic.trim().toLowerCase().replace("_", "/");
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    apiVersion,
    payload,
    shop,
    topic: authenticatedTopic,
    webhookId,
  } = await authenticate.webhook(request);
  const topic = normalizeWebhookTopic(String(authenticatedTopic));
  const rawBody = Buffer.from(JSON.stringify(payload));

  if (!isActiveWebhookTopic(topic)) {
    AppLogger.info("Ignored inactive Shopify webhook", {
      component: "webhooks",
      operation: "action",
    }, { shop, topic, webhookId });
    return json({ received: true, ignored: true });
  }

  if (topic === "products/delete") {
    try {
      const isTracked = await isTrackedBundleProductDelete({ rawBody, shopDomain: shop });
      if (!isTracked) {
        AppLogger.info("Ignored unreferenced product deletion", {
          component: "webhooks",
          operation: "action",
        }, { shop, topic, webhookId });
        return json({ received: true, ignored: true });
      }
    } catch (error: unknown) {
      AppLogger.error("Failed to check product deletion relevance; enqueueing for safety", {
        component: "webhooks",
        operation: "action",
      }, error);
    }
  }

  const eventData: ShopifyWebhookEventData = {
    rawPayload: rawBody.toString("base64"),
    topic,
    shopDomain: shop,
    webhookId,
    apiVersion,
  };

  try {
    await inngest.send({ name: "shopify/webhook", data: eventData });
  } catch (error: unknown) {
    AppLogger.error("Failed to enqueue Shopify webhook", {
      component: "webhooks",
      operation: "action",
    }, error);
    return json({ received: false }, { status: 503 });
  }

  return json({ received: true });
}
