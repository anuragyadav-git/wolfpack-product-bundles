---
schema_version: 1
id: shopify-metafields
title: Metafields
type: shopify-integration
status: authoritative
summary: Storefront bundle metafield ownership, synchronization, payload limits, and Shopify validation constraints.
last_audited: 2026-08-27
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
  - app/services/ppb-storefront-runtime.server.ts
  - app/services/ppb-static-authorization.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Architecture/Storefront Outage Resilience.md
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
promise resolves. Persistent configuration blockers surface through the
configure page's contextual critical alert; retryable launch or synchronization
attempt failures use transient error toasts.
There is no persisted sync queue, status, attempt ID, timestamp, or error model.

Storefront sync does not define or write `$app.component_parents`. FPB uses the
online signed runtime-token route. Parent-product PPB uses synchronized signed
v2 authorization plus shop `$app.ppb_policy_revisions`; Shopify Functions
compare every line's revision with current Shopify state before applying a
merge or discount. Parent product metafields remain the source for EXPAND and
display metadata.

## Why Bootstrap Hydration

The canonical app-proxy FPB document embeds the full configuration for immediate
first paint. The bundle API remains the widget fallback when the primary marker
is absent or malformed and keeps one retry after 3 seconds for `503`/`504`
Render cold starts. Do not introduce a third configuration source or change
this order.

## Size Constraints

Wolfpack enforces 64KB for existing FPB JSON values and 128KB for the
schema-v3 PPB `$app.bundle_ui_config` and shop `$app.ppb_storefront_runtime`.
The PPB writers reject oversized data before their mutations. The storefront
runtime stores one compact resolved copy per configured locale rather than
embedding the complete multilingual Settings document in every entry; the
39-locale translated-preset boundary fixture is 94,989 bytes. Shopify Function
input metafields are separately limited to 10KB, so the shop
`$app.ppb_policy_revisions` map is checked against that smaller boundary.

Runtime category payloads must be compacted at `app/lib/bundle-config/category-runtime.ts` before they are written by `app/services/bundles/metafield-sync/operations/bundle-product.server.ts`. Preserve storefront-required fields only: product IDs/title/handle/image/price/weight, compact product options, and compact variants with ID/title/price/compare-at/weight/availability/inventory/options/image/selling-plan data. Strip admin/cache-only fields such as metafields, SKU, selectedOptions blobs, inventory policy, timestamps, and extra image metadata.

Admin save transport should follow the same compact-field policy before posting `stepsData`. The route-level FPB save serializer is responsible for stripping picker/Admin graph data while preserving the product, variant, collection, category, and rule fields needed by persistence and storefront runtime generation.

## PPB Component Quantity Invariant

Shopify's fixed-bundle `component_quantities` metafield has a minimum value of `1`. That constraint describes the quantity of a component when it participates in a bundle; it does not determine whether a shopper must select from a PPB step.

New PPB steps therefore start with `minQuantity: 0` and `maxQuantity: 10`, preserving optional-step semantics. The runtime `bundle_ui_config` and database keep that merchant-authored step minimum unchanged. At the Shopify metadata boundary, parent `component_quantities` normalize each candidate component to at least `1`. Buyer-selected PPB components and quantities remain validated by the signed runtime-token Cart Transform flow.

Do not reject an optional step or promote its persisted minimum merely to satisfy the Shopify metafield definition. Category-product `minQuantity: 0` likewise remains valid because it represents an optional product within a step.

## Step Quantity Ownership

Admin step rules are the authoritative shopper-selection constraints. A rule
such as `equal_to 2` must not be compared with legacy or hidden
`minQuantity`/`maxQuantity` fields during save. When two step rules exist, save
validation checks whether those merchant-authored rules can both be satisfied.

Quantity-based discount tiers are separate bundle-total rules. For example,
two steps that each require exactly two items can validly coexist with discount
tiers at total quantities two and four.

Admin save transport, database persistence, and widget runtime serialization
preserve canonical quantity values without parsing, coercing, or supplying
zero defaults. Conversion is allowed only at an external contract boundary
that requires a different representation. The Shopify
`component_quantities` writer is such a boundary and enforces Shopify's
minimum component quantity there, without changing Admin or runtime state.

## Bundle Details Order Attribution

FPB writes app-owned cart metafield `bundle_details` through the signed
app-proxy route `/apps/product-bundles/api/cart-bundle-details`. Parent-product
PPB reads and merges the same metafield directly with Storefront API
`cartMetafieldsSet` and the synchronized public Storefront token. Both omit a
namespace so Shopify stores the key in the app-owned namespace (`$app`).

FPB requests `/apps/product-bundles/api/cart-transform-runtime-token` before
cart add. Parent-product PPB instead attaches the synchronized v2
`_wolfpack_bundle_runtime` and `_wolfpack_line_auth` values without a network
request to Wolfpack.

`shopify.app.toml` and `shopify.app.wolfpack-product-bundles-sit.toml` define `[order.metafields.app.bundle_details]` with `capabilities.cart_to_order_copyable = true`. Shopify requires the cart and order metafields to have matching namespace and key before checkout completion can copy the cart value to the order.

This preserves EB-style bundle display metadata on created orders without adding a post-order reconstruction job.
