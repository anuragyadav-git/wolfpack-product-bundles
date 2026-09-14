---
schema_version: 1
id: cart-transform-function
title: Cart Transform Function
type: architecture
status: authoritative
summary: Runtime-token-verified Shopify Cart Transform and Discount Function architecture, build ownership, and fail-closed pricing contract.
last_audited: 2026-09-15
owners:
  - engineering
domains:
  - checkout
systems:
  - bundle-cart-transform-rs
  - bundle-discount-function
  - cart-transform-service
source_paths:
  - extensions/bundle-cart-transform-rs/shopify.extension.toml
  - extensions/bundle-cart-transform-rs/src/run.graphql
  - extensions/bundle-cart-transform-rs/src/merge.rs
  - extensions/bundle-discount-function/shopify.extension.toml
  - extensions/bundle-discount-function/src/cart_lines_discounts_generate_run.graphql
  - extensions/bundle-discount-function/src/cart_lines_discounts_generate_run.rs
  - app/services/cart-transform-service.server.ts
  - app/services/cart-transform-runtime-token.server.ts
  - app/lib/shopify-product-gid.ts
  - app/routes/api/api.cart-transform-runtime-token.tsx
  - app/routes/api/api.cart-bundle-details.tsx
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

For both v1 and v2, Cart Transform and Discount Function read the shop's
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

For ordinary FPB component lines, the signed v1 token and display metadata are
stored in Shopify's app-reserved `$app.bundle_details` cart metafield before the
subsequent `/cart/add` request invokes Cart Transform. The component lines keep
only their compact `_wolfpackProductBundle:OfferId` grouping attributes. This
preserves Shopify's native bundle line-item group without exposing the large
signed token and display JSON as component properties in the merchant's order
view. Subscription components, FPB add-on lines evaluated independently by the
Discount Function, and PPB's static v2 line contract retain their required
line-level authorization.

`cartMetafieldsSet` uses `[CartMetafieldsSetInput!]!`. Updating a cart metafield
does not invoke Shopify Functions by itself, so clients must complete the
metafield write first and then perform the cart mutation that requires the
authorization. A failed metadata write fails the bundle add rather than adding
components that Cart Transform cannot verify.

Shopify ProductVariant identifier normalization is owned by the dependency-neutral
`app/lib/shopify-product-gid.ts` boundary. Cart Transform token validation and
checkout-offer serialization import that owner directly; checkout offers do not
depend on the token-signing service or its complete payload type.
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

## Scheduled checkout boundary

Scheduled offers use Shopify automatic app discounts. Save and deployment general
sync reconcile app-owned owners from paginated Shopify metadata, verify native
resource settings, and then publish the current policy with `metafieldsSet` and
`compareDigest`. Shopify is the owner registry; there are no mirrored discount-ID
columns, scheduler jobs, or custom checkout clocks. Deletion revokes the published
policy before removing the native owners and bundle parent.

`scheduled_initial` covers one-time bundle pricing, initial-only subscription
pricing and add-ons (`recurringCycleLimit: 1`). `scheduled_recurring` covers base
subscription pricing when configured to recur (`recurringCycleLimit: 0`). Both
reuse the existing Discount Function calculation code. The standard automatic,
subscription and code paths reject scheduled policy ownership, preventing a
second application of the same saving. Shopify owns combinations and the shared
25-active-automatic-discount capacity; native errors fail synchronization.

Both FPB and PPB require the current `{revision, pricingMode}` record in
`$app.ppb_policy_revisions`. Issuance compares canonical saved configuration with
that publication. Checkout add-on issuance also checks the current parent
revision. Newly hydrated variants must have a Shopify-resolved product
relationship; a browser-supplied product ID is insufficient. Add-on authorization
is restricted to configured add-on roles and signed maximum percentage ceilings.
This ceiling is not a claim of exact checkout-time add-on tier-threshold enforcement.

Scheduled MERGE and direct-parent EXPAND retain the original Shopify price and
append `transformedPricing` inside the existing signed runtime token. The receipt
binds shop, bundle, parent variant, current revision, offer group, quantity,
unit-price basis and percentage. Identity stays in the signed outer authorization;
`transformedPricing` contains only group, quantity, unit price and percentage. Serde `RawValue` preserves original token
fields without rebuilding subscription or presentation data. The native Discount
Function verifies both outer authorization and receipt before applying savings.

Shopify owns one-time `startsAt`/`endsAt`. Recurring owners use Shopify's local
date and `timeAfter` predicates through `$app.scheduled_offer` input variables.
Bounded weekly/monthly arithmetic skips nonexistent month days. The server uses
Temporal's IANA transitions for both copies of repeated hours and skipped windows.
A wholly skipped window still counts as a configured calendar occurrence.
Priority selects storefront offers; it does not arbitrate existing carts.
Countdowns are presentation only and currently render one-time deadlines; an old
one-time deadline is never reused for an always-on or recurring offer.

The private component-breakdown, component-count and computed savings attributes
have no repository runtime consumers and are removed. Checkout uses Shopify's
native discount allocations. `_bundle_total_retail_cents` remains for the existing
checkout-offer threshold consumer, derived from the native original price.
Public `component_pricing` and `component_quantities` metafields remain published.
The user confirmed there are no existing external dependencies on those private
attributes. Future integration contracts are assessed below.

Critical `price_adjustment` now carries `componentQuantities`; malformed, missing,
nonpositive or mismatched quantities reject expansion. Cart Transform reads neither
the redundant quantity metafield nor the unused display-pricing metafield. Query
cost is **26**, down from 32. Large display data remains outside pricing authorization.
This is a coordinated writer/Function cutover requiring bundle synchronization;
there is no legacy Function fallback.

## Third-party consumption assessment

Repository assessment on 2026-09-14 found no runtime reads of the removed
`_bundle_components`, `_bundle_component_count`, `_bundle_total_price_cents`,
`_bundle_total_savings_cents` or `_bundle_discount_percent` fields. Existing
checkout adapters pass checkout URLs, invoke provider callbacks, or refresh the
native cart; they do not construct a provider payload from these attributes.
The SDK cart writer also does not consume them. User confirmation covers existing
external custom dependencies; this is not certification of every third-party app.

| Integration need | Supported data owner | Boundary |
| --- | --- | --- |
| Cart composition and quantities | Storefront `ComponentizableCartLine.lineComponents`, merchandise and quantity | Contains actual transformed components, not arbitrary catalog metadata |
| Order/ERP/fulfillment grouping | Admin `LineItem.lineItemGroup` plus each component line's variant and quantity | Group by Shopify group ID; use native order lines for fulfillment |
| Final payable prices and applied discounts | Native cart/order cost and discount allocations | Allocations describe Discount Function savings; standard Cart Transform price changes are not themselves native discount allocations |
| Configured bundle display/composition | Retained public `component_pricing`, `component_reference`, `component_quantities` | Use the resolved app namespace and permitted API access; current catalog configuration is not a historical order snapshot |
| Historical bundle-only markdown reporting | A specifically agreed reporting contract | Do not substitute current catalog prices or pre-checkout private savings for final Shopify totals |

The direct-parent EXPAND path intentionally expands to the same parent variant.
It therefore does not expose the configured underlying component SKUs as native
fulfillment lines. MERGE does. Removing a title/price breakdown does not create
this existing distinction, and retaining that breakdown would not make it an
inventory or fulfillment contract. An integration needing component fulfillment
must validate actual order lines; changing EXPAND inventory semantics is a separate
product decision, not part of this query-cost change.

Rebuy documents Cart Transform bundle display, and Shopflo documents Shopify-backed
discounts. Neither establishes that all of our scheduled/subscription combinations
work through their checkout. GoKwik, Shopflo, Zecpay and Shiprocket/Fastrr handoffs
still require provider QA for native automatic discounts, expiration and component
order data. Standard integration codes deliberately cannot grant scheduled savings.
Do not restore unused attributes speculatively or create provider-specific pricing
copies; add an adapter only for a demonstrated consumer requirement.

Sources: [native cart components](https://shopify.dev/docs/api/storefront/latest/objects/ComponentizableCartLine),
[native order grouping](https://shopify.dev/docs/api/admin-graphql/latest/objects/LineItemGroup),
[actual discount allocations](https://shopify.dev/docs/api/admin-graphql/latest/objects/DiscountAllocation),
[Rebuy bundle behavior](https://help.rebuyengine.com/en/articles/10593786-faq-rebuy-s-bundle-builder-features-settings-and-troubleshooting),
[Shopflo discount support](https://intercom.help/shopflo-a9de00772be8/en/articles/10115196-create-and-manage-discounts-on-shopflo).

## Cart payload boundary

`cart-bundle-details.ts` is shared by the app-proxy and direct PPB Storefront
writers. It paginates native cart lines, recognizes parent and component offer
attributes, retains active entries plus the pending bundle, and removes stale
entries. The complete serialized JSON is limited to 10,000 UTF-8 bytes before
writing. Incomplete reads, malformed data, mutation failures, changing pagination
snapshots and mismatched readback fail without a cart-add retry.

FPB, PPB and SDK additions hold the same native Web Lock through metafield sync
and cart add. Browsers without Web Locks reject the operation. This coordinates
tabs on one origin; it does not provide atomicity across independent devices or
third-party cart writers. Shopify cart metafields have no compareDigest input.
Readback detects observed overwrites but cannot eliminate a later independent write.

The 10,000-byte metafield guard is not a whole-Function resource guarantee. Release
QA must measure compiled WASM, full input/output and instructions with representative
multi-bundle carts and large static line authorizations. Shopify's documented limits
are 256,000 binary bytes, 128,000 input bytes, 20,000 output bytes and 11 million
instructions for up to 200 cart lines. Hosted expiry, recurrence, country, subscription,
add-on and combination checks remain required before production certification.

### Tested selection limit and native resource evidence (2026-09-15)

The supported boundary is **10 bundle cart lines across the entire cart**, including
components, gifts and add-ons. Ordinary merchandise lines do not consume this
allowance. Native bundle children count individually, without also counting their
parent. This limits selected lines, not units per line or the number of choices
available in a bundle catalog.

FPB, PPB and SDK submit the pending line count to the shared cart preflight, which
adds existing bundle lines across all pages and rejects overflow before metafield
mutation or cart submission. Token issuance also rejects oversized selections.
The Cart Transform independently rejects more than 10 bundle lines before expensive
authorization; its native `blockOnFailure: true` setting blocks bypass submissions.
Both Discount Functions stop before authorization when their signed bundle-line
count exceeds 10. No new validation extension or custom checkout service is needed.

Before enforcement, 40 static component lines passed but 100 exceeded instructions.
Add-ons exposed a tighter boundary: 20 static add-on lines used 17.48 million
instructions. The user approved a tested selection cap; 10 is the conservative
common boundary supported by the following current binary measurements.

Rust compile ownership follows Function behavior. Signature verification is shared;
`signing.rs` is compiled by Cart Transform at runtime and by Discount tests only.
Standard checkout-code candidates are a child module loaded only by the standard
Discount binary. Shared add-on/subscription builders take a typed eligibility scope:
the standard owner checks standard policy mode, while the scheduled owner also checks
its exact shop, bundle and revision. No unused-code lint suppression is required.

The isolated builds use the configured stable Rust compiler and the installed
Shopify CLI 4.8.0 trampoline/Binaryen pipeline. Final WASM sizes: Cart Transform
255,966 bytes, standard Discount 206,427 bytes, scheduled Discount 244,369 bytes.
All fit 256,000 bytes; the Cart Transform has only 34 bytes of binary headroom and
must be remeasured after changes.

Production-length identifiers exposed a failure missed by the original short-ID
fixture: 10 static scheduled add-ons consumed 13,191,830 instructions. The shared
add-on builder now verifies each distinct signed bundle token once per invocation
and each line authorization once, reusing those validated results for quantity
aggregation and candidate construction. The scheduled parent-receipt pass skips
add-on lines, whose authorization belongs to that builder. Invalid line signatures
remain independently rejected; policy revision, country, scope and quantity checks
remain mandatory. This is invocation-local reuse, with no persisted authorization
cache or additional service.

| Full-query fixture / Function | Input bytes | Output bytes | Instructions | Result |
| --- | --- | --- | --- | --- |
| 10 production-length static add-ons / scheduled Discount | 17736 | 1284 | 3,375,040 | Pass |
| 10 add-ons, wide bundle policy, 9,918-byte published-policy map, 190 ordinary lines / scheduled Discount | 121178 | 1284 | 7,242,698 | Pass |
| Same configuration, 240 ordinary lines / scheduled Discount | 141278 | 1284 | 7,939,784 | Pass under proportional 250-line limits |
| 10 bundle groups, exact 10,000-byte cart metafield, 9,783-byte policy map, 190 ordinary lines / Transform | 110492 | 17274 | 10,229,431 | Pass, limited instruction/output headroom |

The checked-in native suite is `tests/native/function-resources.test.mjs`, with
synthetic, non-secret fixtures under `tests/fixtures/functions/`. Run it from the
app directory against binaries produced by the configured Shopify compilation,
trampoline and optimization pipeline:

```bash
SHOPIFY_FUNCTION_RUNNER=<installed-cli-function-runner> \
SCHEDULED_DISCOUNT_WASM=<compiled-scheduled-discount.wasm> \
CART_TRANSFORM_WASM=<compiled-cart-transform.wasm> \
node --test tests/native/function-resources.test.mjs
```

All five cases pass, including an independently tampered line sharing a valid bundle
token. The suite asserts actual binary, complete serialized input, output and
instruction budgets; native runner `success: true` alone is insufficient. Shopify
scales input/output/instruction limits proportionally above 200 cart lines. The
UTF-8 unit boundary separately accepts exactly 10,000 bytes and rejects 10,001,
including multibyte characters and JSON escapes.

These measurements cover representative complete payloads, not arbitrary token
sizes, quantities or ordinary-cart data. The 10-line cap and 10,000-byte metafield
guard remain required, and the 34-byte Transform binary headroom must be rechecked
after every Function change.

Real tokens emitted by the native Cart Transform were passed into the compiled
scheduled Discount Function in a 10-parent cart. The matching owner produced its
20% candidate in 2,224,925 instructions; expiration, wrong country, stale revision
and a tampered token produced no discount. The standard owner produced no scheduled
candidate. This proves local binary interoperability, not Shopify-hosted expiry or
provider behavior.

Hosted SIT preparation found a separate native update constraint: nested automatic
discount metafield updates must use `$app` namespace plus key without also including
the existing metafield ID. Combining those identities was rejected by Shopify.
The scheduled-owner service now uses namespace/key consistently; a regression test
covers resync of an existing owner, and the same hosted preview preparation then
returned `ready: true`.

**Hosted release gate remains open.** On `agent-5sfidg3m`, the temporary unlisted
`Checkout Release QA 2026-09-15` fixture was prepared, but a fresh Admin preview and
cache-cleared reload still requested an invalid `dev-ae97e563-1966-487e-8446-af737be1702b`
theme-extension handle. Bundle JS/CSS failed with `net::ERR_BLOCKED_BY_ORB` and the
widget version was absent. Clean and restart the SIT dev preview using the documented
manual workflow before testing checkout expiry, recurrence, country, subscriptions,
add-ons, combinations and overflow. No hosted checkout or third-party provider
compatibility is certified by these local resource results.

Native contracts: [Function limits](https://shopify.dev/docs/api/functions/latest#limitations),
[automatic discount input](https://shopify.dev/docs/api/admin-graphql/latest/input-objects/DiscountAutomaticAppInput),
[metafieldsSet](https://shopify.dev/docs/api/admin-graphql/latest/mutations/metafieldsSet),
[componentizable cart lines](https://shopify.dev/docs/api/storefront/latest/objects/ComponentizableCartLine).

## Language & Build

- **Language**: Rust
- **Compiled to**: WASM via Cargo and Shopify Functions
- **Crate**: `shopify_function` 2.2.0
- **Build command**: `npm run build:cart-transform`
- **Output**: `extensions/bundle-cart-transform-rs/target/wasm32-unknown-unknown/release/`

The release build uses Rust size optimization and Shopify CLI's compatible
trampoline and WASM optimizer. Use an isolated Cargo target directory for profiling
while the user's dev watcher is active, so QA does not compete for build artifacts.
Shopify `jsonValue` and native SDK value access read runtime settings and current
policy records without reparsing the shop JSON map for every bundle. This follows
[Shopify's Rust JSON metafield guidance](https://shopify.dev/docs/apps/build/functions/programming-languages/rust-for-functions).
HMAC-SHA256 uses RustCrypto with constant-time verification and a shared Function
module; Node crypto fixtures protect the existing signature contract. Do not infer
release readiness from a successful compiler exit alone.

MERGE and EXPAND share a cart-line-index bitmap. Do not replace it with cloned
line IDs in a `HashSet`: line indices are already stable for one Function run,
and the bitmap avoids hashing code, allocation, and unnecessary WASM size.
Bounded bundle groups, duplicate-name counters, and component-pricing lookups
likewise use direct list traversal instead of shipping Rust hash-map machinery.

Do not run `wasm-snip --snip-rust-panicking-code` on this Function. It can
replace reachable Rust formatting and deserialization failure paths with
`unreachable` instructions. A valid two-line v2 PPB request then trapped after
five instructions and Shopify blocked `/cart/add` because `blockOnFailure` is
enabled. The same captured input succeeded after removing panic snipping,
emitting one merge operation in 1,128,695 instructions. Also do not replace
Shopify CLI's final optimizer with a newer standalone Binaryen release; the
Shopify Function compiler has rejected otherwise smaller incompatible modules.

The Discount Function also builds to `wasm32-unknown-unknown`, but its Shopify
extension command must resolve both Cargo and Rustc from rustup's stable
toolchain. On macOS, Homebrew `cargo` and `rustc` can precede rustup in `PATH`;
mixing Homebrew Cargo with rustup's installed WASM standard library fails with
`can't find crate for core` even though `rustup target list --installed` shows
the target. The extension therefore delegates to
`scripts/build-discount-function.mjs`, which sets `RUSTC` from
`rustup which --toolchain stable rustc` and invokes Cargo through `rustup run
stable`. Keep shell expansion out of the extension TOML because Shopify CLI,
not an interactive shell, owns that command runner. Do not simplify this back
to bare `cargo build` unless the release environment proves it has one Rust
owner.

---

## Target-Specific Operation Names

The active `cart.transform.run` target's generated `CartOperation` input uses
`expand`, `merge`, and `update`. The regenerated schema also contains the older
generic `Operation` input with `lineExpand`, `linesMerge`, and `lineUpdate`, but
that is not the return type for this target. Use the target-specific generated
Rust types `ExpandOperation`, `MergeOperation`, and `UpdateOperation`.

Run the globally installed Shopify CLI from the repository root whenever the
checked-in Function schema and compiler disagree:

```bash
SHOPIFY_CLI_AGENT_INFO='n:codex|v:gpt-5|p:openai' \
  shopify app function schema \
  --path apps/OnlyBundles-app/extensions/bundle-cart-transform-rs
```

On 2026-09-14 the previously checked-in schema hid `Cart.metafield` and exposed
only the generic operation names. Regenerating it against the extension's
`2025-10` target restored the canonical cart-metafield field and target-specific
operation types. Treat this generated schema as build input, not as an
authoritative substitute for the active extension configuration.

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

The HMAC covers the base64url payload string, so Rust verifies the signature before decoding JSON. If `runtimeTokenSecret` is configured inside the CartTransform owner's `$app.runtime_configuration` and a line token is missing, tampered, or mismatched against actual cart line variants/quantities, the function emits no merge or add-on discount. The same JSON also carries `bundleCartLineMessaging`; consolidating those settings reduces the Function input query cost.

Offer analytics must not add separate Cart Transform input attributes. The
storefront nests its normalized `offerAnalytics` object inside the existing
`_bundle_display_properties` JSON envelope. MERGE serializes that object into
one private `_wpb_offer_analytics` JSON property on the parent line, while
unmerged component lines retain the nested object in
`_bundle_display_properties`. Ordinary FPB component lines no longer carry that
envelope; their equivalent display metadata is read from the matching entry in
`$app.bundle_details`.

On 2026-09-01, selecting five separate `_wpb_*` attributes raised the input
query complexity from 30 to 35. Shopify rejected the Function build, which also
prevented the current dev-preview extension assets from being published. Every
Cart Transform query change must therefore pass the Shopify CLI app build; a
successful Cargo build alone does not validate Shopify's query budget.

Parent bundle metafields are still written for EXPAND/display paths:
`component_reference`, `component_quantities`, `price_adjustment`, and
`component_pricing`. Component-variant `$app:component_parents` is not queried
or trusted by either Function. The Discount Function emits bundle-pricing
candidates only from a valid signed runtime token whose group and component
quantities match the current cart; a missing secret, token, or signature fails
closed.

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
| Base bundle components only | Component lines carry `_wolfpackProductBundle:OfferId`; the runtime token and display metadata are stored in the keyed `$app.bundle_details` cart metafield. | Rust Cart Transform verifies the cart-metafield runtime token and MERGEs components into the parent bundle variant. Bundle pricing applies to parent merge only. | Total and savings come from base component subtotal and bundle pricing rules. |
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

Shopify's merge operation can apply only one parent `percentageDecrease`, so mixed-price Buy X Get Y bundles use a percentage equivalent to the exact reward value. Calculate this from the whole-bundle totals, not summed rounded component savings. Native prices and discount allocations own the payable result. `_bundle_total_retail_cents` remains only for checkout-offer eligibility; removed private savings attributes are not an integration contract.

---

## Bundle Instance Tracking

- Each add-to-cart generates one 12-character EB-style session key and writes `_wolfpackProductBundle:OfferId` as `{offerId}_{sessionKey}_{itemIndex}`
- Cart Transform groups component lines by the `{offerId}_{sessionKey}` base and uses the cart metafield display data for the parent title
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
