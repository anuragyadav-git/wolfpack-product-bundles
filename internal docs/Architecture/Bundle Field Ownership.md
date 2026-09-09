---
schema_version: 1
id: bundle-field-ownership
title: Bundle Field Ownership
type: architecture
status: authoritative
summary: Canonical ownership ledger for persisted bundle fields, public runtime fields, Shopify custom data, and retired aliases.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - bundles
systems:
  - bundle-persistence
  - storefront-runtime
source_paths:
  - prisma/schema.prisma
  - app/lib/bundle-formatter.server.ts
  - app/lib/bundle-config/category-persistence.ts
  - app/lib/bundle-config/category-runtime.ts
  - app/routes/api/api.bundle.$bundleId[.]json.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/assets/widgets/product-page/methods/layout-shell-methods.ts
related_docs:
  - Shopify Integration/Metafields.md
  - Operations/Deployment General Sync.md
tags:
  - architecture
  - data-contract
keywords:
  - field ownership
  - dead fields
  - canonical bundle contract
---

# Bundle Field Ownership

## Rule

Every saved field must have one named owner and one current reader. Persistence,
Admin form state, public runtime DTOs, and Shopify custom data are different
boundaries; a field is copied across them only when the receiving boundary uses
it. FPB and PPB keep separate save handlers because their form and persistence
semantics differ. They share only explicit persistence/runtime helpers.

Do not restore a removed alias, sparse API projection, compatibility read, or
second persisted owner. The app's Sync Bundle action is the upgrade path.

`bundleType` is mandatory at every public-config writer and renderer boundary.
The shared Shopify metafield writer accepts only exact `full_page` or
`product_page` values before it performs any Shopify lookup or mutation. The
FPB and PPB sync builders accept only `full_page` and `product_page`
respectively, and the Product Page renderer does not reinterpret a missing or
Full Page type through a PPB layout fallback.

## Ledger

| Classification | Fields or contract | Owner and reason |
| --- | --- | --- |
| `KEEP_USED` | Bundle identity, status, type, Shopify parent linkage, FPB design template/preset, steps, `StepProduct`, canonical `StepCategory` including PPB `variantSelectorMode` and `swatchTooltipEnabled`, pricing rules, direct `BundlePricing.displayOptions`, low-stock alert settings, PPB sticky add-to-cart settings, box selection, defaults, text, media, add-ons, visibility | Current Admin save, storefront formatter, widget, Cart Transform, or Shopify sync reads the field. |
| `KEEP_PLATFORM` | Shopify product/variant IDs and handles, publication state, inventory settings, analytics/event identifiers | Required to address Shopify resources or provide an explicit platform capability. |
| `KEEP_FOR_IMPLEMENTATION` | `showProductPrices`, `cartRedirectToCheckout`, `allowQuantityChanges`, `discountDisplayOverride`, and other merchant-visible controls whose runtime wiring is incomplete | The contract is approved or merchant-visible and its Admin/storefront wiring is incomplete. It must be wired or removed as a product decision; it must not be silently deleted as database debris. |
| `DERIVED` | Public `bundle_ui_config`, runtime `messaging`, compact product/category records, component references/quantities/pricing, signed runtime token payload | Generated at the server/Shopify boundary. `bundle_ui_config` uses canonical `id`, exact `bundleType`, and no duplicate `bundleId`. Never write these shapes back as a second bundle source. |
| `CONSOLIDATE_DUPLICATE` | Pricing display options | `BundlePricing.displayOptions` is the only persisted owner. `messages.displayOptions` is removed; runtime `messaging.displayOptions` is derived from the direct field. |
| `REMOVE_LEGACY` | `Bundle.fullPageLayout`; Shopify Page IDs/handles and handle index; `StepCategory.categoryRank`, `selectedProducts`, `collectionsData`, `collectionsSelectedData`, `variantColorMap`; sparse `fields=bootstrap`; response timestamp; `$app.component_parents`; duplicate standard/camel-case metafield writers | Superseded aliases, duplicate platform data, or abandoned contracts with no current owner. They are migrated once and removed, not read through fallbacks. |
| `REMOVE_DEAD` | Storefront sync status/attempt/timestamp/error columns; `BundleCustomField`; `DesignSettings.productPriceVisibility`, `loadingOverlayBgColor`, `loadingOverlayTextColor`, `emptySlotBorderColor`; `Bundle.individualSellingPlanSelection`; empty metaobject replay hook | No current merchant, runtime, platform, or operational reader. |

## Removed Pre-order and Subscription Integration Contract

The FPB and PPB Bundle Settings control named `Pre-order & Subscription
Integration` is fully retired. Its direct database field
`Bundle.individualSellingPlanSelection`, FPB/PPB form entries, save parsers,
metafield and proxy DTO fields, Storefront API selling-plan allocations, widget
selection helpers, and cart `selling_plan` output are not part of the current
bundle contract. A database migration drops the obsolete column; stale incoming
form or runtime objects do not restore it.

This removal does not delete Shopify app billing or PPB's separately owned
`Subscriptions` setup section and shared-selling-plan validation flow. Those
features have different owners and must not reuse the retired Bundle Settings
field implicitly.

## Canonical Category Contract

Persisted and runtime category identity is `id`. Ordering is `sortOrder`.
Selection sources are exactly `products` and `collections`. Category presentation,
conditions, translations, and auto-advance stay alongside those fields when
configured. PPB variant presentation uses exactly `variantSelectorMode`
(`dropdown`, `pill`, `color_swatch`, or `image_swatch`) and
`swatchTooltipEnabled`. Swatch color and image values are Shopify-owned
`ProductOptionValue.swatch` data fetched through the Storefront API. Variant
association uses Shopify `selectedOptions`; storefront code must not infer
colors from option names, substitute variant imagery, or restore a parallel
merchant color map.

There is no runtime or persistence fallback to `categoryId`, `rank`,
`categoryRank`, `selectedProducts`, `collectionsData`, or
`collectionsSelectedData`. The retired `displayVariantsAsSwatches` boolean is
also not read or migrated into the selector enum; merchants use Sync Bundle to
publish the current canonical defaults.

## Public Bundle API

`GET /apps/product-bundles/api/bundle/:id.json` returns exactly:

```json
{
  "success": true,
  "bundle": {}
}
```

The bundle is the canonical formatted runtime DTO. Query-string field selectors
do not change its shape, and the response contains no server timestamp.

## Storefront Sync

Save and explicit Sync Bundle calls execute the current Shopify writer directly.
Errors propagate to the caller. The database does not persist a second queue or
attempt-state model. Deployment general sync replays this same writer; it does
not own a parallel bundle serializer.

Variant custom data consists of component references, component quantities,
price adjustment, bundle UI config, and component pricing. The retired
`component_parents` definition and writer are not part of the contract.

`StepProduct` is the only persisted product-membership owner during
serialization, configure validation, checkout-offer construction,
runtime-token authorization, and subscription discovery. A missing relation is
not recovered from the legacy `BundleStep.products` JSON field. Public runtime
DTOs then expose the normalized membership as `steps[].products`; the FPB
widget does not read a `StepProduct` input or synthesize product JSON from it.
Current FPB and PPB category selections are form input, not a second
persistence owner: both save boundaries materialize the final union of direct
and category product selections into deduplicated `StepProduct` rows.
`StepCategory.products` is retained only to preserve merchant-authored
grouping. Strict readers never recover missing membership from either step or
category JSON.
Pricing's
derived operator vocabulary is exactly `gte`, `gt`, `lte`, `lt`, and `eq`;
step-condition operators retain their separate long-form contract.

Low-stock merchandising has exactly three direct Bundle owners:
`lowStockAlertEnabled`, `lowStockAlertThreshold`, and
`lowStockAlertMessage`. Runtime `lowStockAlert` is derived from those fields.
Inventory values remain Shopify-owned variant context and are never persisted
as a bundle-level stock total.

PPB sticky action presentation has exactly four direct Bundle owners:
`stickyAddToCartEnabled`, `stickyAddToCartShowDesktop`,
`stickyAddToCartShowMobile`, and `stickyAddToCartAction`. Runtime
`stickyAddToCart` is derived from those fields only for Product Page Bundles.
The action is presentation state, not a second cart contract: direct add
delegates to the canonical PPB CTA and incomplete selections return to that
existing validation surface.

PPB bundle-embed configuration is owned only by `bundleUpsellConfig`'s
`upsellConfiguration` and `multiLangText` objects. The normalizer does not read
or scrub embed fields from `textOverrides`; deployment zero-state verification
is the cutover gate for stale rows.

Countdown presentation has exactly six direct Bundle owners:
`countdownEnabled`, `countdownLayout`, `countdownPosition`, `countdownTitle`,
`countdownExpiryAction`, and `countdownExpiredMessage`. The nullable runtime
`countdown` object is derived from those fields plus `OfferPolicy.endsAt`, which
remains the only deadline owner. No countdown timestamp or duration is stored
on `Bundle`.

## FPB Page ownership

The app-proxy document is the canonical FPB host. Current Admin and storefront
flows do not create, publish, select, rename, or write metafields to Shopify
Pages. The four legacy Page columns and their handle index are absent from the
current Prisma schema and are dropped by the forward-only residue migration.
Dashboard deletion has no Shopify Page cleanup branch. FPB parent-product
synchronization owns canonical internal handles and redirects from prior
merchant-facing product handles. There is no bulk Page migration or preflight
command.
