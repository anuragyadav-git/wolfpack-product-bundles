---
schema_version: 1
id: shopify-metafields
title: Metafields
type: shopify-integration
status: authoritative
summary: Storefront bundle metafield ownership, synchronization, payload limits, and Shopify validation constraints.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - storefront
  - shopify-integration
systems:
  - bundle-config-metafields
  - widget-runtime
source_paths:
  - app/routes/root/wpb.$bundleId.tsx
  - app/services/bundles/metafield-sync/
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - metafields
  - storefront
  - ppb
keywords:
  - bundle config
  - component quantity
  - minimum quantity
---

# Metafields

## FPB Runtime Configuration

The canonical FPB app-proxy document embeds the complete formatted runtime
configuration directly in `data-bundle-config`. No current application writer
creates Page-owned `custom.bundle_config` or `custom.bundle_settings`
metafields, and there is no Page-body marker writer.

FPB runtime layout is template/preset-driven. `bundleDesignTemplate:
"FBP_SIDE_FOOTER"` selects the full-page side-footer renderer and
`bundleDesignPresetId` selects Standard, Classic, Compact, or Horizontal
styling. `Bundle.fullPageLayout` has been removed.

### Reader (Widget JS)
`app/assets/widgets/full-page/methods/analytics-config-methods.ts`

## Sync Rule

If the bundle config structure changes:
1. Update the **server formatter/writer** (`bundle-formatter.server.ts` and the relevant host/metafield writer)
2. Update the **widget parser** (`app/assets/widgets/full-page/methods/analytics-config-methods.ts`)
3. Both must be updated in the same change — never one without the other
4. Bump `WIDGET_VERSION` and show a sync prompt banner so merchants re-sync

## EB-Style Storefront Sync

As of 2026-07-08, configure Save, Sync Product, Sync Bundle, and Preview follow an EB-style direct server flow. The route persists bundle data to Postgres, performs required Shopify publication work synchronously, and returns a compact response such as `{ success, statusCode, message, bundle }` or `{ success, statusCode, ready }`.

The server reloads the bundle from DB, activates the Cart Transform, then writes
the current product/variant metafields before responding. Configure pages do not
show a separate storefront sync status or retry banner. Preview posts one compact
`/prepare-preview` request and keeps the Preview Bundle spinner active until that
promise resolves; failures surface through the existing preview error toast.
There is no persisted sync queue, status, attempt ID, timestamp, or error model.

Storefront sync does not define or write `$app.component_parents`. MERGE and
add-on discount validation use the signed runtime token route plus the
CartTransform owner `$app.runtime_token_secret` metafield. Parent product
metafields remain the source for EXPAND and display metadata.

## Why Bootstrap Hydration

The canonical app-proxy FPB document embeds the full configuration for immediate
first paint. The bundle API remains the widget fallback when the primary marker
is absent or malformed and keeps one retry after 3 seconds for `503`/`504`
Render cold starts. Do not introduce a third configuration source or change
this order.

## Size Constraints

Shopify metafield values have a 64KB hard limit. The bundle variant `$app.bundle_ui_config` payload is especially sensitive for category-backed FPB/PPB bundles because category products can include rich product, image, option, and variant objects.

Runtime category payloads must be compacted at `app/lib/bundle-config/category-runtime.ts` before they are written by `app/services/bundles/metafield-sync/operations/bundle-product.server.ts`. Preserve storefront-required fields only: product IDs/title/handle/image/price/weight, compact product options, and compact variants with ID/title/price/compare-at/weight/availability/inventory/options/image/selling-plan data. Strip admin/cache-only fields such as metafields, SKU, selectedOptions blobs, inventory policy, timestamps, and extra image metadata.

Admin save transport should follow the same compact-field policy before posting `stepsData`. The route-level FPB save serializer is responsible for stripping picker/Admin graph data while preserving the product, variant, collection, category, and rule fields needed by persistence and storefront runtime generation.

## PPB Component Quantity Invariant

Shopify's fixed-bundle `component_quantities` metafield has a minimum value of `1`. That constraint describes the quantity of a component when it participates in a bundle; it does not determine whether a shopper must select from a PPB step.

New PPB steps therefore start with `minQuantity: 0` and `maxQuantity: 10`, preserving optional-step semantics. The runtime `bundle_ui_config` and database keep that merchant-authored step minimum unchanged. At the Shopify metadata boundary, parent `component_quantities` normalize each candidate component to at least `1`. Buyer-selected PPB components and quantities remain validated by the signed runtime-token Cart Transform flow.

Do not reject an optional step or promote its persisted minimum merely to satisfy the Shopify metafield definition. Category-product `minQuantity: 0` likewise remains valid because it represents an optional product within a step.

## Bundle Details Order Attribution

The storefront widgets write app-owned cart metafield `bundle_details` through the signed app-proxy route `/apps/product-bundles/api/cart-bundle-details`. The route uses Storefront API `cartMetafieldsSet` without a namespace, so Shopify stores the key in the app-owned namespace (`$app`).

The same storefront add flow first requests `/apps/product-bundles/api/cart-transform-runtime-token`; that route returns `_wolfpack_bundle_runtime` for cart line properties after server-side DB validation.

`shopify.app.toml` and `shopify.app.wolfpack-product-bundles-sit.toml` define `[order.metafields.app.bundle_details]` with `capabilities.cart_to_order_copyable = true`. Shopify requires the cart and order metafields to have matching namespace and key before checkout completion can copy the cart value to the order.

This preserves EB-style bundle display metadata on created orders without adding a post-order reconstruction job.
