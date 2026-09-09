import { Inngest, EventSchemas } from "inngest";
import type { ShopifyWebhookEvents } from "./types";

/**
 * Shared Inngest client.
 *
 * Used by:
 *  - Remix /webhooks action → inngest.send() to enqueue events
 *  - Remix /api/inngest route → serve() to register functions
 *
 * Dev mode: set INNGEST_DEV=1 to route events to the local Inngest Dev Server
 * (npx inngest-cli@latest dev) instead of Inngest Cloud. No signing key required.
 */
export const inngest = new Inngest({
  id: "wolfpack-product-bundles",
  schemas: new EventSchemas().fromRecord<ShopifyWebhookEvents>(),
  ...(process.env.INNGEST_EVENT_KEY
    ? { eventKey: process.env.INNGEST_EVENT_KEY }
    : {}),
  ...(process.env.INNGEST_DEV === "1"
    ? { isDev: true }
    : {}),
});
