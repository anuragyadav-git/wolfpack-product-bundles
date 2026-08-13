---
schema_version: 1
id: ppb-bundle-subscriptions
title: PPB Bundle Subscriptions
type: architecture
status: proposed
summary: Defines the provider-neutral PPB selling-plan, cart, discount, and release-validation architecture.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin
  - storefront
  - checkout
systems:
  - ppb-configure
  - bundle-widget-product-page
  - cart-transform
  - discount-function
source_paths:
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
  - app/services/cart-transform-runtime-token.server.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - extensions/bundle-cart-transform-rs/
  - extensions/bundle-discount-function/
related_docs:
  - Architecture/Admin Configure Page.md
  - Architecture/Cart Transform Function.md
  - Architecture/Widget Architecture.md
  - Shopify Integration/Cart Transform API.md
tags:
  - ppb
  - subscriptions
keywords:
  - selling plans
  - recurringCycleLimit
---

# PPB Bundle Subscriptions

## Scope

Subscriptions belong only to Product Page Bundles. Wolfpack discovers Shopify selling-plan groups created and owned by Shopify Subscriptions, Seal, or another provider; Wolfpack does not create, update, or delete provider-owned plans. The retired `individualSellingPlanSelection` field is not part of this architecture.

`Bundle.bundleSubscriptionConfig` is the single persisted source. `null` means disabled. A V1 value records one selected common group, a merchant-selected subset of its plans, one-time/default behavior, saved presentation copy, optional translations, and whether Wolfpack bundle pricing may recur. Disabled draft values may remain saved, but disabled subscription behavior is omitted from `bundle_ui_config`.

## Discovery and validation

Discovery must paginate every configured collection and inspect every selectable variant. Product-level group membership alone is insufficient: every selectable variant must expose the same compatible group and plan IDs. Returned groups include deterministic group/plan ordering, option names, positions, and normalized pricing policies.

Shopify supports both whole-product and explicit-variant selling-plan assignments. A group for which `SellingPlanGroup.appliesToProduct(productId:)` is true covers every selectable variant of that product. Otherwise, Wolfpack requires every selectable variant to be explicitly eligible. This distinction is required for Shopify Subscriptions, which creates whole-product assignments.

The initial release blocks subscriptions when PPB pricing is Buy X Get Y or when enabled free-gift, add-on, or personalization branches are present. These exclusions keep the exact signed component group and discount ownership unambiguous.

## Runtime contract

The public `bundle_ui_config` contains only the normalized, enabled purchase-options configuration. Localized copy resolves in this order: exact locale, language-only locale, saved base copy. Runtime code must not invent merchant-facing fallback copy.

The signed runtime-token request accepts an optional `subscription` object containing the saved group ID, plan ID, and recurring-bundle-discount choice. Absence is canonical one-time mode. The server reloads the shop-owned PPB, verifies the saved plan against the exact selected variants, and rejects stale plans, mixed plans, unsupported variants, wrong-shop requests, and tampering.

## Cart and discount ownership

One-time purchases keep the existing PPB merged-parent Cart Transform path. Subscription purchases add the same `selling_plan` value to every component item and remain separate component lines. They omit the public `Box` metadata used by the merged presentation while retaining private bundle identity and the signed runtime token.

Shopify documents that Cart Transform operations are rejected for cart lines with selling plans. The Function therefore emits no merge, expand, or update operation for a selling-plan group. Wolfpack bundle pricing for those component lines belongs to the product Discount Function, which validates the signature, exact plan allocation, variants, quantities, and complete group before emitting candidates.

Automatic app-discount nodes are role-tagged. The subscription initial-order node uses `recurringCycleLimit=1`; a recurring node uses `recurringCycleLimit=0` only after recurring checkout behavior is proven live. Add-on discount ownership remains a separate role.

## Release gate

The implementation is contained by the development and SIT release workflow rather than a second runtime environment flag. Production release still requires cache-cleared SIT evidence for the request to `/cart/add`, `/cart.js`, cart pricing, checkout cadence, and absence of Cart Transform rejection. If recurring billing cannot be proven, production exposes first-order-only bundle pricing and does not render the recurring-discount control. No autonomous deploy or tunnel restart is part of this workflow.

## Development-store evidence

On 2026-08-14, Shopify Subscriptions was installed on the agent development store and a monthly 10%-off plan was assigned to the four products in the PPB matrix fixture. The first discovery request returned no common plan because the validator considered only explicit variant assignments. After adding whole-product applicability handling, the same live request discovered the provider-owned group and plan. The saved configuration survived a hard Admin reload after the SIT schema migration and tunnel restart.

Cache-cleared Chrome verification then proved the provider-neutral slice on widget version `11.1.0`. The public proxy payload exposed only the normalized subscription configuration. The subscription request sent the numeric selling-plan transport ID on every component line, omitted public `Box` metadata, and retained the signed private runtime token. `/cart.js` returned a separate component line with selling-plan allocation `11986764035`, the provider cadence `Deliver every month, 10% off`, and the adjusted price `$746.10` from `$829.00`. Checkout showed the automatically renewing disclosure and `$746.10 every month`. No Cart Transform rejection occurred. A separate one-time request omitted `selling_plan` and still produced the existing merged parent line at `$829.00`.

Two Shopify behaviors were established by the live fixture. `appliesToProductVariant` can be false when Shopify Subscriptions assigns the whole product, even though that exact variant is eligible. Runtime validation must therefore resolve each selected variant's product and accept the group only when `appliesToProduct(productId:)` or `appliesToProductVariant(productVariantId:)` is true. Also, Admin contracts retain selling-plan GIDs, while the AJAX Cart `selling_plan` field requires the numeric selling-plan ID.
