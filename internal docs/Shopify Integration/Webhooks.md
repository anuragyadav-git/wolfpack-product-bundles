---
schema_version: 1
id: shopify-webhooks
title: Webhooks
type: architecture-note
status: active
summary: Defines Wolfpack's app-specific Shopify webhook subscriptions, payload version, processing ownership, and delivery-volume safeguards.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - webhook-worker
  - webhook-processor
  - inngest
source_paths:
  - shopify.app.toml
  - shopify.app.wolfpack-product-bundles-sit.toml
  - app/services/webhook-worker.server.ts
  - app/services/webhooks/topics.ts
  - app/services/webhooks/product-delete-relevance.server.ts
  - app/services/webhooks/processor.server.ts
related_docs:
  - internal docs/Shopify Integration/Admin API.md
tags:
  - webhooks
keywords:
  - 2026-07
  - events
---

# Webhooks

## App Config Subscriptions

Production and SIT use Shopify webhook API version `2026-07`. This version controls how Shopify serializes payloads for every app-specific subscription declared under `[webhooks]`; it does not change the API version used by unrelated Admin or Storefront API clients.

The app subscribes only to operational webhook topics that are required across installs:

- `app/uninstalled`
- `app/scopes_update`
- `products/delete`

Shopify App Pricing state is verified through the Partner API, the hosted return route, and hourly reconciliation. The app does not subscribe to app-subscription or one-time-purchase billing webhooks.

Broad topics that generated high delivery volume without a required runtime effect are intentionally not subscribed:

- `app_purchases_one_time/update`
- `app_subscriptions/update`
- `products/update`
- `inventory_levels/update`
- `orders/create`

Shopify sends every event matching a subscribed topic. Filtering after receipt still counts as a Shopify delivery, so broad product and inventory topics can create high delivery counts even when most payloads do not affect a Wolfpack bundle.

## Events Validator Workaround

The `[events]` block in both app configurations is a no-op with `api_version = "unstable"` and an empty `subscription` array. It exists only because Shopify's remote app-configuration schema began incorrectly requiring the developer-preview Events section on 2026-08-24, even for apps using only classic webhooks.

Do not add a placeholder Events subscription. A real `[[events.subscription]]` entry registers a delivery contract with its own topic, actions, and handler URI. Remove the no-op block after Shopify resolves the validator regression and validation succeeds without it.

## Product Delete

`products/delete` is retained because it is the only product catalog webhook currently required for bundle integrity. The handler removes deleted products from bundle steps and archives active bundles that would otherwise contain empty steps.

Shopify deletes the product's variants, inventory items, publications, and
Shopify-owned metafields, but it does not remove Wolfpack's app-owned
`StepProduct` rows or rewrite already-synced bundle configuration. Shopify's
native fixed-bundle APIs own their component relationships; Wolfpack's
configurable FPB and PPB Cart Transform bundles use app-owned database and
metafield references instead.

The direct webhook worker therefore performs one indexed, shop-scoped
`StepProduct` lookup after HMAC validation. An unreferenced deletion is
acknowledged without creating an Inngest event or `WebhookEvent` row. A
referenced deletion is sent to Inngest for durable cleanup. If the relevance
lookup itself fails, the worker fails open to Inngest so a potentially relevant
deletion is not lost.

Shopify cannot usefully filter this subscription by current product state: the
classic delete payload contains only the deleted product ID, and the Events
resource is already null after deletion. Dynamic per-shop ID filters would need
continuous subscription rewrites whenever bundle membership changes and are not
the canonical ownership boundary.

This topic covers complete product deletion only. Variant-only deletion is a
separate lifecycle case; do not restore broad `products/update` delivery as an
implicit substitute.

## App Uninstall Cleanup

`app/uninstalled` removes app-owned operational data for the shop: bundles and their cascaded child records, sessions, design settings, queued jobs, compliance records, old webhook events, old business events, and the shop record.

Revenue analytics are intentionally retained after uninstall. `OrderAttribution` and `BundleEngagement` are not deleted by the uninstall handler because they power historical revenue and funnel reporting for merchant performance driven by the app.

The handler deletes old `BusinessEvent` rows before writing the final `app_uninstalled` event so churned shops do not keep growing event-log storage while still preserving a final uninstall marker.

## Removed Topics

`orders/create` is not subscribed because order attribution is handled by the Web Pixel to `/api/attribution`. Its former no-op handler has been removed.

`products/update` is not subscribed because Shopify cannot filter it by Wolfpack DB membership. Reintroducing it would deliver all product updates unless the app also writes and maintains a Shopify-side marker such as a tag or metafield.

`inventory_levels/update` is not subscribed because each event requires a shop-wide bundle lookup before inventory sync. Runtime storefront inventory checks and explicit bundle sync flows should own this until there is a narrower, Shopify-side event filter.

The retired product-update and order-create handlers, inventory webhook handler,
shop-wide inventory synchronization service, and legacy GCP Pub/Sub Remix route
have been removed. Do not restore them while their topics and transport remain
retired.

## Storage Gotcha

The direct worker accepts only the six topics in `ACTIVE_WEBHOOK_TOPICS` before
calling Inngest. `WebhookProcessor` applies the same contract before decoding or
inserting a `WebhookEvent`, so a stale subscription or direct Inngest event
cannot restore retired traffic. The inactive set includes
`app_purchases_one_time/update`, `app_subscriptions/update`, `products/update`,
`inventory_levels/update`, `orders/create`, and every unknown topic.

Production evidence from 2026-07-10:
- `WebhookEvent` was 7.7 GB in a 7.7 GB database.
- `products/update` alone accounted for about 2.4M rows and 5.6 GB of JSON payload.
- The previous 24 hours added about 82k `products/update` rows and 296 MB of JSON payload.
- Webhook IDs were present and unique, so the issue was not duplicate delivery. The issue was storing distinct broad-topic events that the app no longer needs.

Production evidence from the 30 days ending 2026-08-31:
- `products/delete` delivered 75,394 unique product IDs across 30 shops.
- One shop accounted for 73,164 deliveries, proving that the membership gate
  belongs before Inngest rather than after persistence.
- Three stale `app_subscriptions/update` deliveries were stored on 2026-08-30;
  the shared active-topic boundary now drops that topic at both ingress and
  processor boundaries.

Do not reintroduce persistence for retired broad topics. If they appear again, fix the Shopify subscription source and keep the processor-side guard as the last line of defense.

## Upstream Subscription Audit

On 2026-08-31, a read-only Admin GraphQL audit for the shop that emitted the
three stale `app_subscriptions/update` deliveries returned zero API-managed
webhook subscriptions. There was therefore no shop-scoped subscription object
to delete. The deliveries came from outside that per-shop subscription surface,
most plausibly an app-version-managed contract that was active when Shopify
emitted them.

The Shopify CLI showed production version `wolfpack-product-bundles-280` from
2026-07-31 as active and newer production versions as inactive. SIT version
`wolfpack-bundles-sit-404` from 2026-08-17 was active. A future approved release
must deploy the current TOML contract so Shopify's active app version and the
repository agree; processor and ingress guards remain required even after that
release.
