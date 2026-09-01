---
schema_version: 1
id: cart-transform-function
title: Cart Transform Function
type: architecture
status: authoritative
summary: Runtime-token-verified Shopify Cart Transform architecture and fail-closed bundle pricing contract.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - checkout
systems:
  - bundle-cart-transform-rs
  - cart-transform-service
source_paths:
  - extensions/bundle-cart-transform-rs/shopify.extension.toml
  - extensions/bundle-cart-transform-rs/src/merge.rs
  - app/services/cart-transform-service.server.ts
  - app/services/cart-transform-runtime-token.server.ts
  - app/routes/api/api.cart-transform-runtime-token.tsx
  - app/services/ppb-static-authorization.server.ts
related_docs:
  - Shopify Integration/Cart Transform API.md
  - Features/Pricing Pipeline.md
  - Architecture/Storefront Outage Resilience.md
tags:
  - architecture
  - shopify-function
keywords:
  - blockOnFailure
  - runtime token
  - bundle pricing
---

# Cart Transform Function

## Overview

The cart transform function intercepts Shopify's checkout flow to merge individual product variants into logical bundle line items and apply bundle pricing. The active implementation is the Rust Shopify Function in `extensions/bundle-cart-transform-rs`, compiled to WASM.

MERGE validation has two explicit signed contracts. FPB and service-dependent PPB
embed surfaces use v1: they POST the selected variants to
`/apps/product-bundles/api/cart-transform-runtime-token` immediately before
`/cart/add`. The parent-product PPB block uses v2: bundle sync signs the current
Shopify-hosted bundle policy and bounded product/variant line policies before
the outage occurs. Both use HMAC-SHA256 and the secret stored inside the
CartTransform owner's `$app.runtime_configuration` JSON.

For v2, Cart Transform and Discount Function also read the shop's
`$app.ppb_policy_revisions` map. A stale snapshot, changed bundle,
altered role or discount, mismatched product/variant, per-line excess, or an
aggregate quantity split across duplicate lines fails closed. The client never
receives the signing secret.

FPB subscription requests add the saved selling-plan group and plan to the v1
payload, and the token route revalidates the plan and selected variants. PPB v2
embeds the public selected-plan contract in its signed bundle policy. Cart
Transform emits no merge, expand,
or update operation for a group containing a selling-plan allocation. The
Discount Function's `subscription_initial` role accepts only a complete group
whose lines, plan allocations, variants, and quantities exactly match the
token, then applies bundle pricing through an automatic discount node with
`recurringCycleLimit=1`.

The v1 request body is mandatory, so every v1 caller must use `POST`.
The Remix resource route also exports a `GET` loader that returns controlled
`405 Method Not Allowed` JSON with `Allow: POST, OPTIONS`; without that loader,
an accidental or stale GET exposes Remix's missing-loader stack instead of the
public API contract.

CartTransform activation is fail-closed. `CartTransformService` creates the Shopify CartTransform with `blockOnFailure: true`, so a Function timeout, resource-limit breach, trap, or other execution failure blocks cart and checkout operations instead of accepting Shopify's unmodified component prices. The earlier activation mutation omitted this argument; Shopify therefore applied its `false` default and could fall through to ordinary pricing. Existing Rust transforms with `blockOnFailure: false` are deleted and recreated by `completeSetup()`, while already-compliant transforms are reused.

The guarded deployment backfill is intentionally stronger than normal setup: apply mode deletes and recreates the CartTransform once for every selected shop, even when the existing transform is already compliant. It restores the runtime-token secret before allowing that shop's bundle synchronization to proceed. Dry-run reports the selected shop count and performs no Admin API calls.

> ⚠️ The original `docs/CART_TRANSFORM_FUNCTION.md` contained multiple critical errors. This note is the authoritative reference.

---

## Extension Config (authoritative)

From `extensions/bundle-cart-transform-rs/shopify.extension.toml`:

```toml
api_version = "2025-10"
[[extensions]]
name = "Bundle Cart Transform (Rust)"
handle = "bundle-cart-transform-rs"
type = "function"
[[extensions.targeting]]
target = "cart.transform.run"
```

### Target status

`purchase.cart-transform.run` was deprecated in the 2025-07 API release. The current Rust extension already uses:
```
cart.transform.run
```
No target migration remains for the active extension.

---

## Language & Build

- **Language**: Rust
- **Compiled to**: WASM via Cargo and Shopify Functions
- **Crate**: `shopify_function` 2.2.0
- **Build command**: `npm run build:cart-transform`
- **Output**: `extensions/bundle-cart-transform-rs/target/wasm32-unknown-unknown/release/`

The release build uses Rust size optimization and Shopify CLI's compatible
WASM optimizer. Keep the authorization payload deserialization shared between
v1 and v2 and deserialize only fields consumed by this Function; unknown signed
payload fields are intentionally ignored. The resulting Shopify-optimized
artifact was 255,623 bytes during the 2026-08-25 agent-store verification.

Do not run `wasm-snip --snip-rust-panicking-code` on this Function. It can
replace reachable Rust formatting and deserialization failure paths with
`unreachable` instructions. A valid two-line v2 PPB request then trapped after
five instructions and Shopify blocked `/cart/add` because `blockOnFailure` is
enabled. The same captured input succeeded after removing panic snipping,
emitting one `linesMerge` in 1,128,695 instructions. Also do not replace
Shopify CLI's final optimizer with a newer standalone Binaryen release; the
Shopify Function compiler has rejected otherwise smaller incompatible modules.

---

## Operation Names (2025-07+ API)

As of API version `2025-07`, the operation names were renamed:

| Old name (pre-2025-07) | New name (2025-07+) |
|---|---|
| `expand` | `lineExpand` |
| `merge` | `linesMerge` |
| `update` | `lineUpdate` |

The codebase uses the new names. Do not use the old names when reading or modifying the function.

---

## MERGE/EXPAND Pattern

The function groups cart lines by EB's public `_wolfpackProductBundle:OfferId` cart attribute. The item-specific suffix is removed before grouping, so `MIX-894502_K1K_1` and `MIX-894502_K1K_2` become one bundle instance group keyed by `MIX-894502_K1K`:

1. **MERGE**: Groups all component lines for a bundle instance into a single parent line after verifying `_wolfpack_bundle_runtime`
   - `parentVariantId`: the bundle variant ID
   - `title`: bundle name (must be **unique per instance** to prevent Shopify's automatic consolidation of duplicate merges — append `" (2)"`, `" (3)"`, etc. via `bundleNameCounts` Map)
2. **EXPAND**: Breaks the merged line back into components at checkout for fulfillment

### Runtime token contract

The token payload contains:
- `offerGroupId` matching the `_wolfpackProductBundle:OfferId` base
- selected base `components` as ProductVariant GIDs plus quantities
- selected `addons` plus authorized percentage discount metadata
- parent bundle variant GID
- price adjustment config copied from current bundle pricing

The HMAC covers the base64url payload string, so Rust verifies the signature before decoding JSON. If `runtimeTokenSecret` is configured inside the CartTransform owner's `$app.runtime_configuration` and a line token is missing, tampered, or mismatched against actual cart line variants/quantities, the function emits no merge or add-on discount. The same JSON also carries `bundleCartLineMessaging`; consolidating those settings keeps the Function input query at Shopify's complexity limit of 30.

Offer analytics must not add separate Cart Transform input attributes. The
storefront nests its normalized `offerAnalytics` object inside the existing
`_bundle_display_properties` JSON envelope. MERGE serializes that object into
one private `_wpb_offer_analytics` JSON property on the parent line, while
unmerged component lines retain the nested object in
`_bundle_display_properties`.

On 2026-09-01, selecting five separate `_wpb_*` attributes raised the input
query complexity from 30 to 35. Shopify rejected the Function build, which also
prevented the current dev-preview extension assets from being published. Every
Cart Transform query change must therefore pass the Shopify CLI app build; a
successful Cargo build alone does not validate Shopify's query budget.

Parent bundle metafields are still written for EXPAND/display paths: `component_reference`, `component_quantities`, `price_adjustment`, and `component_pricing`. Component-variant `$app:component_parents` is no longer the configured MERGE source.

MERGE output also preserves the verified `_wolfpack_bundle_runtime` token and the
base `_wolfpackProductBundle:OfferId` on every parent line. The Checkout UI extension
uses those two attributes as its authorization anchor and bundle-instance key; it
still re-reads Shopify's unstable cart-line ID before each mutation. Add-on lines
receive a freshly signed exact variant/quantity token from the authenticated checkout
route whenever their selection or quantity changes.

### FPB add-on and free-gift pricing scenarios

FPB Add-Ons with Bundles mirror EB checkout behavior: selected add-ons are separate cart lines, and any add-on discount is a native product discount on that selected add-on line. The parent bundle line must not absorb selected add-on savings.

| Scenario | Storefront line contract | Cart Transform / Discount behavior | Summary sidebar behavior |
|---|---|---|---|
| Base bundle components only | Component lines carry `_wolfpackProductBundle:OfferId` and `_wolfpack_bundle_runtime`; no `_bundle_step_type=addon...` | Rust Cart Transform verifies runtime token and MERGEs components into the parent bundle variant. Bundle pricing applies to parent merge only. | Total and savings come from base component subtotal and bundle pricing rules. |
| Add-on tier with `0%` discount | Selected add-on line carries `_bundle_step_type=addon` and is listed in runtime token `addons` without a discount. | Add-on line is excluded from parent MERGE and receives no native product discount. | Add-on original price remains in the subtotal and final total. |
| Add-on tier with partial percentage discount | Selected add-on line carries `_bundle_step_type=addon:PERCENTAGE:n`, `_addon_product=true`, `_addonTierId`, and runtime token `addons[].discount={type:"PERCENTAGE",value:n}`. | Discount Function verifies the runtime token and emits native line discount message `Add On` for that add-on line. Parent MERGE excludes the add-on. | Original subtotal includes the add-on at full price; add-on savings are subtracted from the final total. |
| Add-on tier with `100%` discount (free gift case) | Same as partial add-on, with `_bundle_step_type=addon:PERCENTAGE:100`. Do not emit legacy `_bundle_step_type=free_gift` for EB-style add-on tiers. | Discount Function emits a native 100% add-on line discount, so the selected gift line final price is `0` and checkout savings are visible. Parent MERGE excludes the add-on. | Original subtotal includes the gift at full price; add-on savings subtract the gift price so the final total equals the paid bundle items. |
| Legacy free-gift step without add-on tier discount | Line may carry `_bundle_step_type=free_gift` when the step is a true free gift and has no add-on tier/discount contract. | It participates in the legacy free-gift merge/discount path, not the EB add-on line-discount path. | The true free gift is skipped from the original subtotal because there is no native add-on savings row to show. |

Current widget code must treat both current tier shapes as the same discount contract: nested EB shape `discount: { type, value }` and Admin draft shape `discountType` / `discountValue`. Dropping the latter causes the runtime token to omit add-on discount metadata, so checkout cannot reduce a `100%` selected gift line to zero.

---

## App-Context Diagnostics Gotcha

Cart Transform objects and owner metafields are app-owned. A generic Shopify CLI
store-auth query can authenticate successfully and still return empty
`cartTransforms` / `shopifyFunctions` for this app's Function state. Treat that
as an auth-context limitation, not proof that the transform is absent.

Use this order when a shop's storefront sends valid bundle lines but no merge
happens:

1. Start at the storefront version:
   `window.__BUNDLE_WIDGET_VERSION__`.
2. Confirm the deployed widget asset contains the current cart contract:
   `_wolfpackProductBundle:OfferId`, `_wolfpack_bundle_runtime`, and
   `/apps/product-bundles/api/cart-transform-runtime-token`.
3. Mint a runtime token through the storefront app proxy with real selected
   variants, add the component lines through `/cart/add`, and inspect
   `/cart.js`.
   - If component lines include `_wolfpack_bundle_runtime` but remain unmerged,
     the storefront contract is probably fine and the Function path rejected or
     did not run.
4. Verify active transform state through the embedded app route, not generic
   store auth:
   `https://admin.shopify.com/store/<store-handle>/apps/<app-handle>/api/check-cart-transform`
   then open the app iframe URL directly if the outer Admin shell hides the JSON.
5. If the route reports `activated: true` and no stale transforms but lines
   still do not merge, inspect/resync the CartTransform owner metafield
   `$app.runtime_configuration.runtimeTokenSecret` from app-context Admin API. The Rust MERGE path
   emits no operation when this secret is absent or mismatched.

Concrete 2026-07-10 example:

- `wolfpackdemostore.myshopify.com` loaded production widget `5.0.94` from
  `wolfpack-product-bundles-4-254`.
- The deployed asset already included the runtime-token contract.
- The app proxy minted a valid runtime token and `/cart/add` wrote component
  lines with `_wolfpack_bundle_runtime`.
- `/cart.js` still showed raw component lines.
- The embedded app route reported `activated: true`, one Rust transform, and no
  stale transforms.
- A generic `shopify store execute` query authenticated with
  `read_cart_transforms` but returned empty app-owned transforms/functions.

Conclusion for that historical case: not a widget payload issue; repair by running
`CartTransformService.completeSetup(admin, shopDomain)` in app context so the
active CartTransform is present and the current `$app.runtime_configuration`
owner metafield is synced.

### Repair script

Use `npm run cart-transform:repair` when multiple installed shops need the same
app-context repair. The script is disabled unless exactly one mode flag is set:

```bash
WPB_CART_TRANSFORM_REPAIR_DRY_RUN=true npm run cart-transform:repair
WPB_CART_TRANSFORM_REPAIR_APPLY=true npm run cart-transform:repair
```

Dry-run scans installed shops only and reports the target count. Apply mode
runs `CartTransformService.completeSetup(admin, shopDomain)` through
`unauthenticated.admin(shopDomain)` for every installed shop. That can create or
replace CartTransform objects and sync the `$app.runtime_configuration` owner
metafield. Do not run apply mode against production without explicit manual
approval for that exact operation.

---

## Pricing

- All prices stored and passed in **cents** (integers)
- `calculateDiscountPercentage()` clamps result to 0–100
- Supported discount methods: `percentage_off`, `fixed_amount_off`, `fixed_bundle_price`
- See [[Features/Pricing Pipeline]] for full unit conversion chain

### BXY rounding

Shopify `linesMerge` can apply only one parent `percentageDecrease`, so mixed-price Buy X Get Y bundles use a percentage equivalent to the exact reward value. Component detail rows may need proportional allocation, but parent cart metadata must use whole-bundle cents derived from the rounded discount amount. Do not sum rounded per-component bundle cents into `_bundle_total_price_cents`; that can drift by one cent for mixed-price BXY groups. The authoritative parent attributes are:

- `_bundle_total_retail_cents`
- `_bundle_total_price_cents`
- `_bundle_total_savings_cents`

---

## Bundle Instance Tracking

- Each add-to-cart generates one 12-character EB-style session key and writes `_wolfpackProductBundle:OfferId` as `{offerId}_{sessionKey}_{itemIndex}`
- Cart Transform groups component lines by the `{offerId}_{sessionKey}` base and uses `_bundleName` for the parent title
- Shopify's cart line properties still differ per component line because the trailing item index differs
- See [[Features/Bundle Instance Tracking]]

## Cart Line Messaging Format Gotcha

On 2026-07-16, the SIT PPB G26 parity replay proved that saving
`bundleCartLineMessaging.discountDisplay.format` and syncing the CartTransform
owner metafield is not sufficient evidence that the deployed Function applies
alternate cart-line display formats.

Verified state:

- DB `DesignSettings.bundleCartLineMessaging.discountDisplay.format` was set to
  `amount_only`, then `percentage_only`.
- `CartTransformService.syncCartLineMessagingSettings()` returned success for
  CartTransform `gid://shopify/CartTransform/111771907`.
- Direct Admin GraphQL read of the then-current
  `$app.bundle_cart_line_messaging` owner metafield returned
  `discountDisplay.format: "percentage_only"`. Current deployments store this
  value under `$app.runtime_configuration.bundleCartLineMessaging`.
- A fresh cache-cleared storefront add still produced public cart-line
  `You Save: "$72.40 (5%)"` instead of `"$72.40"` or `"5%"`.

For future debugging, verify the rendered `/cart.js` parent line after
metafield sync. Do not treat the owner metafield value alone as proof that the
live deployed Cart Transform honors cart-line format selection.
