---
schema_version: 1
id: bundle-types
title: Bundle Types
type: feature
status: authoritative
summary: Defines the storefront hosts and runtime responsibilities of full-page and product-page bundles.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - bundles
systems:
  - storefront
source_paths:
  - prisma/schema.prisma
  - app/routes/root/wpb.$bundleId.tsx
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
related_docs:
  - ../Architecture/Widget Architecture.md
tags:
  - fpb
  - ppb
keywords:
  - full-page bundle
  - product-page bundle
---

# Bundle Types

## Full-Page Bundle (FPB)

A dedicated bundle-builder document served by the signed Shopify app-proxy route. The customer configures the bundle by selecting from each step.

- **Host**: `/apps/product-bundles/wpb/{bundleId}` rendered inside the active Shopify theme layout
- **Widget**: `bundle-widget-full-page.ts`, loaded through `bundle-app-embed.liquid`
- **Config delivery**: complete app-proxy marker first, bundle JSON API fallback second
- **Promo banner**: per-bundle `promoBannerBgImage` field
- **Step timeline**: optional progress indicator (`showStepTimeline`)
- **Tier config**: tiered pricing JSON (`tierConfig`)

FPB does not create, select, or require a Shopify Page.

## Product-Page Bundle (PPB)

Embeds the bundle selector directly on a Shopify product page.

- **Widget**: `bundle-widget-product-page.ts`, loaded through `bundle-product-page.liquid`
- **Placement**: merchant-selected product template app block

## Bundle Status

| Status | Meaning |
|---|---|
| `active` | Bundle configuration is available to the Wolfpack storefront runtime |
| `inactive` | Bundle configuration is disabled in Wolfpack |
| `draft` | In progress, not yet published |
| `unlisted` | Exists but hidden from merchant list (archive/template use) |

Bundle status does not mutate the Shopify parent product status. Parent-product discoverability is merchant-owned after creation and is changed through **Edit Product** in Shopify Admin. See [[Architecture/Bundle Parent Product]].

## Inventory Handling

FPB and PPB are customized bundles implemented with Cart Transform, not fixed
bundles created through Shopify's product bundle API. Inventory therefore stays
attached to the selected component variants instead of being copied to the
parent bundle variant.

- The storefront reads current component availability from Shopify's Storefront
  API. When **Track inventory on Add To Cart** is enabled, FPB and PPB block
  tracked zero-stock variants while preserving Shopify's continue-selling
  behavior.
- Shopify validates the real component variants again in cart and checkout and
  deducts their inventory when the bundle is purchased. Cart Transform groups
  those component lines for bundle presentation; it does not create a separate
  inventory pool.
- The parent bundle variant is a neutral bundle identity with
  `inventoryPolicy: CONTINUE`. Wolfpack does not calculate or write an
  artificial parent quantity such as
  `MIN(component_inventory / component_quantity)`.
- `inventory_levels/update` is not subscribed, and there is no webhook-driven
  parent-inventory synchronization service. See [[Shopify Integration/Webhooks]].
- Exact component quantities require the
  `unauthenticated_read_product_inventory` Storefront scope. Without that scope,
  quantity is treated as unknown rather than fabricating a stock limit.

This matches Shopify's customized-bundle model: the app owns storefront
availability, while Shopify provides component checks after add-to-cart. Fixed
bundles use a different model in which Shopify maintains the parent variant's
sellable quantity. See [Shopify's bundle implementation comparison](https://shopify.dev/docs/apps/build/product-merchandising/bundles/start-building).
