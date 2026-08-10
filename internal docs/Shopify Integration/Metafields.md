---
schema_version: 1
id: shopify-metafields
title: Metafields
type: shopify-integration
status: authoritative
summary: Storefront bundle metafield ownership, synchronization, payload limits, and Shopify validation constraints.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
  - shopify-integration
systems:
  - bundle-config-metafields
  - widget-runtime
source_paths:
  - extensions/bundle-builder/blocks/bundle-full-page.liquid
  - app/services/bundles/metafield-sync/
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/services/bundles/metafield-sync/operations/component-product.server.ts
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

## Bundle Config Metafield

**Namespace/key**: `custom.bundle_config`
**Owner type**: Page
**Access**: `page.metafields.custom.bundle_config`

Stores the full FPB bundle configuration written by "Place Widget Now" and "Sync Bundle". Current full-page storefront markup does not serialize this full payload into page HTML; both the section app block and the hidden app-embed marker emit a compact bootstrap pointer and hydrate current bundle data through the app-proxy bundle API. This avoids stale page metafields or stale page-body marker HTML rendering an old template or product/category set before the API refresh corrects it.

### Writer
`app/services/bundles/metafield-sync/bundle-config-metafield.server.ts`

### Readers (Liquid / Page Body Marker)
```liquid
data-bundle-config='{"v":2,"type":"full_page","bundleType":"full_page","id":"...","bundleDesignTemplate":"FBP_SIDE_FOOTER","bundleDesignPresetId":"CLASSIC"}'
```

The hidden `data-wpb-full-page-bundle` marker written by `app/services/widget-installation/widget-full-page-bundle.server.ts` uses the same compact payload. The template and preset fields are lightweight visual route hints only; the widget still hydrates current products, steps, rules, and pricing through the app-proxy bundle API before rendering.

FPB runtime layout is template/preset-driven. `bundleDesignTemplate: "FBP_SIDE_FOOTER"` selects the full-page side-footer renderer and `bundleDesignPresetId` selects Standard, Classic, Compact, or Horizontal styling. The older `Bundle.fullPageLayout` database column is legacy storage only until a future schema migration; it must not be emitted in Admin save transport, app-proxy widget payloads, or FPB runtime metafield configs.

### Reader (Widget JS)
`app/assets/bundle-widget-full-page.ts` -> `loadBundleData()`

## Sync Rule

If the bundle config structure changes:
1. Update the **server writer** (`bundle-config-metafield.server.ts`)
2. Update the **widget parser** (`bundle-widget-full-page.ts`)
3. Both must be updated in the same change — never one without the other
4. Bump `WIDGET_VERSION` and show a sync prompt banner so merchants re-sync

## EB-Style Storefront Sync

As of 2026-07-08, configure Save, Sync Product, Sync Bundle, and Preview follow an EB-style direct server flow. The route persists bundle data to Postgres, performs required Shopify publication work synchronously, and returns a compact response such as `{ success, statusCode, message, bundle }` or `{ success, statusCode, ready }`.

The server reloads the bundle from DB, activates the Cart Transform, then writes page/product metafields before responding. Configure pages do not show a separate storefront sync status or retry banner. Preview posts one compact `/prepare-preview` request and keeps the Preview Bundle spinner active until that promise resolves; failures surface through the existing preview error toast. Save and sync responses do not include full step/category graphs, queue state, attempt IDs, timestamps, or sync stats.

As of 2026-07-08, storefront sync no longer fans out component-variant `$app:component_parents`. MERGE and add-on discount validation use the signed runtime token route plus the CartTransform owner `$app.runtime_token_secret` metafield. Parent product metafields remain the source for EXPAND and display metadata.

## Why Bootstrap Hydration

Full-page storefront markup uses a compact bootstrap marker so first render hydrates from the current app-proxy payload. The proxy path keeps a 3s retry for `503`/`504` responses to handle Render cold starts. The page metafield and hidden page-body marker remain useful for sync/install state, but neither must be treated as the first-paint full payload because Shopify page HTML can outlive a template change. The compact marker may carry `bundleDesignTemplate` and `bundleDesignPresetId` so the app embed can stamp the initial shell and load the correct preset stylesheet before proxy hydration, preventing a Standard-looking shell before Classic initializes.

Saving a placed FPB refreshes the hidden page-body marker before writing page metafields. This keeps template changes visible through the dev tunnel without requiring an app deploy or a separate placement refresh.

## Size Constraints

Shopify metafield values have a 64KB hard limit. The bundle variant `$app.bundle_ui_config` payload is especially sensitive for category-backed FPB/PPB bundles because category products can include rich product, image, option, and variant objects.

Runtime category payloads must be compacted at `app/lib/bundle-config/category-runtime.ts` before they are written by `app/services/bundles/metafield-sync/operations/bundle-product.server.ts`. Preserve storefront-required fields only: product IDs/title/handle/image/price/weight, compact product options, and compact variants with ID/title/price/compare-at/weight/availability/inventory/options/image/selling-plan data. Strip admin/cache-only fields such as metafields, SKU, selectedOptions blobs, inventory policy, timestamps, and extra image metadata.

Admin save transport should follow the same compact-field policy before posting `stepsData`. The route-level FPB save serializer is responsible for stripping picker/Admin graph data while preserving the product, variant, collection, category, and rule fields needed by persistence and storefront runtime generation.

## PPB Component Quantity Invariant

Shopify's fixed-bundle `component_quantities` metafield has a minimum value of `1`. That constraint describes the quantity of a component when it participates in a bundle; it does not determine whether a shopper must select from a PPB step.

New PPB steps therefore start with `minQuantity: 0` and `maxQuantity: 10`, preserving optional-step semantics. The runtime `bundle_ui_config` and database keep that merchant-authored step minimum unchanged. At the Shopify metadata boundary, parent `component_quantities` and matching component `component_parents` quantities normalize each candidate component to at least `1`. Buyer-selected PPB components and quantities remain validated by the signed runtime-token Cart Transform flow.

Do not reject an optional step or promote its persisted minimum merely to satisfy the Shopify metafield definition. Category-product `minQuantity: 0` likewise remains valid because it represents an optional product within a step.

## FPB Preview Cache Contract

Pending Bundle Visibility preview pages render from a generated Shopify page body with inline `data-bundle-config`. The full-page widget only trusts this cached config when the bundle has both `bundleDesignTemplate` and `bundleDesignPresetId`. Therefore `formatBundleForWidget()` must default full-page bundles with empty design fields to Standard Design: `bundleDesignTemplate: "FBP_SIDE_FOOTER"` and `bundleDesignPresetId: "STANDARD"`. Without those explicit defaults, preview can ignore the fresh inline config and fall back to stale/proxy behavior.

## Bundle Details Order Attribution

The storefront widgets write app-owned cart metafield `bundle_details` through the signed app-proxy route `/apps/product-bundles/api/cart-bundle-details`. The route uses Storefront API `cartMetafieldsSet` without a namespace, so Shopify stores the key in the app-owned namespace (`$app`).

The same storefront add flow first requests `/apps/product-bundles/api/cart-transform-runtime-token`; that route returns `_wolfpack_bundle_runtime` for cart line properties after server-side DB validation.

`shopify.app.toml` and `shopify.app.wolfpack-product-bundles-sit.toml` define `[order.metafields.app.bundle_details]` with `capabilities.cart_to_order_copyable = true`. Shopify requires the cart and order metafields to have matching namespace and key before checkout completion can copy the cart value to the order.

This preserves EB-style bundle display metadata on created orders without adding a post-order reconstruction job.
