---
schema_version: 1
id: storefront-outage-resilience
title: Storefront Outage Resilience
type: architecture
status: authoritative
summary: Defines the Shopify-hosted PPB snapshot, direct Storefront API hydration, and fail-closed purchase authorization used when Wolfpack services are unavailable.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - storefront
  - checkout
systems:
  - widget-runtime
  - bundle-cart-transform-rs
  - bundle-discount-function
source_paths:
  - app/services/ppb-storefront-runtime.server.ts
  - app/services/ppb-static-authorization.server.ts
  - app/assets/widgets/product-page/storefront-client.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
  - extensions/bundle-cart-transform-rs/
  - extensions/bundle-discount-function/
related_docs:
  - Architecture/Widget Architecture.md
  - Shopify Integration/Metafields.md
  - Shopify Integration/Storefront API.md
tags:
  - resilience
  - ppb
  - shopify-hosted
keywords:
  - outage
  - static authorization
  - storefront token
---

# Storefront Outage Resilience

The parent-product PPB block has no runtime dependency on Wolfpack web-service
availability. Shopify serves the extension Liquid, versioned JS/CSS assets, and
app-owned metafields. The browser reads the complete schema-v3 bundle snapshot
from the parent variant and hydrates current product, variant, price, market,
and inventory data directly from Shopify Storefront API `2026-07` with the
shop's public Storefront access token.

This does not assume Shopify caches an app-proxy response. The resilient path
removes the app proxy from PPB initialization, product hydration, settings
hydration, cart attribution, and purchase authorization. FPB and automatic PPB
embed/page-builder surfaces retain their documented app-proxy contracts.

## Synchronized Shopify State

- Parent variant `$app.bundle_ui_config`: complete schema-v3 PPB configuration,
  including materialized collection membership and signed v2 authorization.
- Shop `$app.ppb_storefront_runtime`: public Storefront endpoint contract,
  Product Page controls, and locale-keyed language data.
- Shop `$app.ppb_storefront_css`: sanitized Design CSS, including resolved Shop
  Brand colors.
- Shop `$app.ppb_policy_revisions`: compact map of bundle ID to current policy
  revision, consumed directly by Shopify Functions.

The bundle snapshot and shop revision map are submitted in one atomic
`metafieldsSet` mutation. Save rejects an
oversized snapshot before writing, so Shopify retains the last known-good state.
Settings saves similarly persist first and report a synchronization failure
without replacing the last known-good Shopify runtime.

## Purchase Integrity

The synchronized snapshot contains one HMAC-signed bundle token and bounded
line tokens. Each line token binds shop, bundle, policy revision, product or
variant, semantic role, aggregate maximum quantity, and maximum add-on
percentage. Cart Transform and Discount Functions validate signatures and the
current shop policy revision. They reject stale, altered, mismatched, or
split-line over-quantity submissions. Cart Transform remains
`blockOnFailure=true`.

The public Storefront token is intentionally browser-visible and grants only
Storefront API access. It is not the HMAC secret. The signing secret remains on
the CartTransform/Discount Function owner and is never emitted to Liquid.

## Failure Boundaries

During a Wolfpack outage, an already-synchronized parent-product PPB can render,
query live Shopify catalog state, add an authorized bundle, apply native bundle
pricing/add-on/subscription discounts, and update `$app.bundle_details` through
Storefront API. Merchant saves, new installations, re-sync, app-proxy FPB,
automatic PPB embed lookup, page-builder lookup, analytics, and checkout-editor
configuration remain service-dependent.

If Shopify Storefront API itself is unavailable, the widget fails closed rather
than using stale prices or inventory. If a merchant changes a source collection
during an outage, the last synchronized membership remains authoritative until
the next bundle sync.
