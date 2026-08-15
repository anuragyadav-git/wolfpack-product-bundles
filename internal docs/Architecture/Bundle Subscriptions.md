---
schema_version: 1
id: ppb-bundle-subscriptions
title: Bundle Subscriptions
type: architecture
status: implemented
summary: Defines the provider-neutral FPB and PPB selling-plan, cart, discount, and release-validation architecture.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin
  - storefront
  - checkout
systems:
  - fpb-configure
  - ppb-configure
  - bundle-widget-full-page
  - bundle-widget-product-page
  - cart-transform
  - discount-function
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
  - app/lib/bundle-subscriptions.ts
  - app/services/bundle-subscription-discovery.server.ts
  - app/services/cart-transform-runtime-token.server.ts
  - app/routes/app/_shared/bundle-configure/BundleSubscriptionsSection.tsx
  - app/assets/widgets/shared/components/purchase-options.ts
  - app/assets/widgets/shared-css/purchase-options.css
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - extensions/bundle-cart-transform-rs/
  - extensions/bundle-discount-function/
related_docs:
  - Architecture/Admin Configure Page.md
  - Architecture/Cart Transform Function.md
  - Architecture/Widget Architecture.md
  - Shopify Integration/Cart Transform API.md
tags:
  - fpb
  - ppb
  - subscriptions
keywords:
  - selling plans
  - recurringCycleLimit
---

# Bundle Subscriptions

## Scope

Subscriptions use one shared provider-neutral contract for Full Page Bundles and Product Page Bundles. Wolfpack discovers Shopify selling-plan groups created and owned by Shopify Subscriptions, Seal, or another provider; Wolfpack does not create, update, or delete provider-owned plans. The retired `individualSellingPlanSelection` field is not part of this architecture.

`Bundle.bundleSubscriptionConfig` is the single persisted source. `null` means disabled. A V1 value records one selected common group, a merchant-selected subset of its plans, one-time/default behavior, base and localized per-plan presentation copy, whether Wolfpack bundle pricing may recur, and whether that bundle discount applies to subscription purchases, one-time purchases, or both. Disabled draft values may remain saved, but disabled subscription behavior is omitted from `bundle_ui_config`.

## Discovery and validation

Discovery must paginate every configured collection and inspect every selectable variant. Product-level group membership alone is insufficient: every selectable variant must expose the same compatible group and plan IDs. Returned groups include deterministic group/plan ordering, option names, positions, and normalized pricing policies.

Shopify supports both whole-product and explicit-variant selling-plan assignments. A group for which `SellingPlanGroup.appliesToProduct(productId:)` is true covers every selectable variant of that product. Otherwise, Wolfpack requires every selectable variant to be explicitly eligible. This distinction is required for Shopify Subscriptions, which creates whole-product assignments.

The initial release blocks subscriptions when bundle pricing is Buy X Get Y or when enabled free-gift, add-on, or personalization branches are present. These exclusions keep the exact signed component group and discount ownership unambiguous.

## Admin configuration surface

FPB and PPB render one shared Polaris-web-component configuration surface in the configure page's main column. Its hierarchy follows the verified provider-neutral reference flow without copying competitor styling: a `Bundle Subscriptions` section owns enablement, setup guidance, locale access, selected-group actions, and the storefront title; a `Plan Tiers` section owns refresh and per-plan presentation fields; and a `Configurations` section owns recurring behavior, one-time behavior/default, bundle-discount targeting, and secondary storefront display copy. The EB-style one-time default checkbox maps directly onto the persisted `defaultPurchaseOption` union, while multiple selected subscription plans retain an explicit default-plan choice.

## Runtime contract

The public `bundle_ui_config` contains only the normalized, enabled purchase-options configuration. Localized copy resolves in this order: exact locale, language-only locale, saved base copy. Runtime code must not invent merchant-facing fallback copy.

The purchase-options renderer and its responsive CSS are shared by FPB and PPB, but each template owns its mount. Its visual hierarchy follows the observed EB surface: a plain heading followed by bordered vertical option cards, with the selling-plan group always visible and only cadence, discount pill, and supporting description inside the subscription option. Plan-adjusted prices update the surrounding product cards and bundle summary rather than appearing inside the selector. FPB renders synchronized instances inside the desktop side summary and expanded mobile summary immediately before totals and checkout actions. PPB renders the same component inside its purchase controls before footer messaging and Add to Cart. This presents one bundle-level purchase decision even though Shopify represents the resulting subscription as separate component lines.

The signed runtime-token request accepts an optional `subscription` object containing the saved group ID, plan ID, and recurring-bundle-discount choice. Absence is canonical one-time mode. The server reloads the shop-owned bundle, verifies the saved plan against the exact selected variants, and rejects stale plans, mixed plans, unsupported variants, wrong-shop requests, and tampering.

## Cart and discount ownership

One-time purchases keep each bundle type's existing merged-parent Cart Transform path. Subscription purchases add the same `selling_plan` value to every FPB or PPB component item and remain separate component lines. They omit the public `Box` metadata used by the merged presentation while retaining private bundle identity and the signed runtime token.

Shopify documents that Cart Transform operations are rejected for cart lines with selling plans. The Function therefore emits no merge, expand, or update operation for a selling-plan group. Wolfpack bundle pricing for those component lines belongs to the product Discount Function, which validates the signature, exact plan allocation, variants, quantities, and complete group before emitting candidates.

Automatic app-discount nodes are role-tagged. The subscription initial-order node uses `recurringCycleLimit=1`; when the merchant enables recurring bundle discounts, a separate recurring node uses `recurringCycleLimit=0`. The Discount Function requires the signed recurring flag to agree with the node role, so initial and recurring candidates cannot cross-apply. Add-on discount ownership remains a separate role.

## Release gate

The implementation is contained by the development and SIT release workflow rather than a second runtime environment flag. Production release still requires cache-cleared SIT evidence for the request to `/cart/add`, `/cart.js`, cart pricing, checkout cadence, and absence of Cart Transform rejection. The recurring-cycle node and role separation are covered by service and Rust behavior tests; an actual renewal charge remains a post-order live verification item because checkout proves cadence but cannot trigger a future billing cycle. No autonomous deploy or tunnel restart is part of this workflow.

## Development-store evidence

On 2026-08-14, Shopify Subscriptions was installed on the agent development store and a monthly 10%-off plan was assigned to the four products in the PPB matrix fixture. The first discovery request returned no common plan because the validator considered only explicit variant assignments. After adding whole-product applicability handling, the same live request discovered the provider-owned group and plan. The saved configuration survived a hard Admin reload after the SIT schema migration and tunnel restart. This proved the provider-neutral Shopify contract for PPB. An FPB fixture using the same native plan subsequently proved the equivalent Admin, storefront, cart, and checkout path.

Cache-cleared Chrome verification then proved the provider-neutral slice on widget version `11.1.0`. The public proxy payload exposed only the normalized subscription configuration. The subscription request sent the numeric selling-plan transport ID on every component line, omitted public `Box` metadata, and retained the signed private runtime token. `/cart.js` returned a separate component line with selling-plan allocation `11986764035`, the provider cadence `Deliver every month, 10% off`, and the adjusted price `$746.10` from `$829.00`. Checkout showed the automatically renewing disclosure and `$746.10 every month`. No Cart Transform rejection occurred. A separate one-time request omitted `selling_plan` and still produced the existing merged parent line at `$829.00`.

Two Shopify behaviors were established by the live fixture. `appliesToProductVariant` can be false when Shopify Subscriptions assigns the whole product, even though that exact variant is eligible. Runtime validation must therefore resolve each selected variant's product and accept the group only when `appliesToProduct(productId:)` or `appliesToProductVariant(productVariantId:)` is true. Also, Admin contracts retain selling-plan GIDs, while the AJAX Cart `selling_plan` field requires the numeric selling-plan ID.

A separate authenticated Easy Bundles FPB audit on the same date confirmed the same architecture. After its required global collection sync, Easy Bundles discovered a native Shopify Subscriptions group shared by all six selectable products. Its FPB storefront rendered one purchase-options control inside the desktop bundle summary and expanded mobile summary, while `/cart/add.js`, `/cart.js`, and checkout retained separate component lines carrying the same selling plan and cadence. This is the provider-neutral behavior Wolfpack follows; it does not imply a generated parent product can own the selling plan.

After the EB layout comparison, cache-cleared Chrome verification on Wolfpack widget version `11.2.0` confirmed synchronized FPB purchase options inside the desktop side summary and expanded mobile summary. Selecting subscription in the mobile instance updated both rendered instances to the same plan. The retired `wpb-purchase-options__group` element was absent. The available PPB preview URL returned 404 for its bundle-config request during this final layout pass, so PPB placement remained covered by the shared renderer tests and production build rather than a claimed live browser result.
