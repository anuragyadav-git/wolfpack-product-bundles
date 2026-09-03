---
schema_version: 1
id: checkout-reactive-bundle-offers
title: Checkout Reactive Bundle Offers
type: test-spec
status: active
summary: Verifies authenticated reactive add-on and gift mutations from the checkout Bundle and Save accordion.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - checkout
systems:
  - bundle-checkout-ui
  - cart-transform-runtime-token
  - bundle-discount-function
source_paths:
  - extensions/bundle-checkout-ui/src/BundleOffers.tsx
  - app/routes/api/api.checkout-bundle-offer-token.tsx
  - app/services/checkout-bundle-offers.server.ts
related_docs:
  - internal docs/Shopify Integration/Checkout UI Extension.md
  - internal docs/Architecture/Cart Transform Function.md
tags:
  - tdd
  - checkout
  - add-ons
keywords:
  - Bundle and Save
  - quantity
  - runtime token
---

# Test Spec: Checkout Reactive Bundle Offers

**Spec ID:** checkout-reactive-bundle-offers  **Created:** 2026-08-13

## Purpose

Verify that checkout offer controls mirror the live cart, enforce current merchant configuration server-side, and restore the prior line state when Shopify rejects or fails to allocate the authorized discount.

## Test Cases

### RuntimeOfferContract

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB tier DTO | Enabled personalization tier with variants, discount, and maximum | One checkout offer with authoritative variants, tier, discount, and maximum | Uses direct FPB personalization config |
| 2 | PPB tier DTO | Enabled free-gift step with add-on tier and step variants | One checkout offer with tier and quantity fields | Synced into `$app.bundle_ui_config` |
| 3 | Disabled merchant gate | Disabled add-ons or inactive bundle | No mutable offer | Fail closed |
| 4 | Active tier | Multiple quantity tiers and signed component quantities | Highest eligible tier is selected | Server-derived tier |
| 5 | Stale quantity | Existing offer line above current maximum | Offer is read-only and quantity is not truncated | Preserves cart state |
| 6 | Multi-variant stale state | Two distinct existing variants in one single-select offer | Offer is read-only | No destructive normalization |

### CheckoutOfferTokenRoute

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid quantity token | Checkout session token, parent token, eligible offer variant and quantity | Exact variant/quantity signed token and server-derived attributes | No client discount input |
| 2 | Invalid quantity | Zero, fractional, or over-limit quantity | `400` | Maximum applies across offer |
| 3 | Tampered parent | Invalid HMAC | `400` | Reject before mutation |
| 4 | Cross-shop parent | Valid token for a different shop | `400` | Checkout shop is authoritative |
| 5 | Ineligible variant | Variant outside active offer | `400` | Membership from current DB config |
| 6 | Inactive or changed config | Disabled bundle, disabled offer, or no longer active tier | `400` | Current merchant config wins |
| 7 | Server discount derivation | Client supplies a fake percentage | Returned token uses current tier percentage | Client value ignored |

### ReactiveCartMutation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Add | Empty offer plus selected variant | Token requested and one add call made at quantity `1` | No Apply button |
| 2 | Remove | Existing gift/add-on plus no-selection | Current line ID re-read and line removed | No-selection is zero path |
| 3 | Replace | Existing variant plus different selection | One update call replaces variant, quantity, and attributes | Valid quantity preserved |
| 4 | Quantity change | Existing variant plus new quantity | Fresh exact token and one update call | Re-read unstable line ID |
| 5 | Maximum | Requested quantity above offer max | Mutation rejected locally | Route also enforces |
| 6 | API/inventory rejection | Shopify returns error | Previous displayed/cart state retained | Control unlocks |
| 7 | Allocation verification failure | Updated line lacks expected allocation | Previous variant, quantity, and attributes restored | Native Discount Function reruns automatically |
| 8 | Multi-bundle grouping | Two parent offer groups | Independent accordion groups | No cross-instance mutation |
| 9 | Pending locking | Mutation in flight | Only active control disabled | Other groups remain reactive |
| 10 | Read-only statuses | Volume, BXGY, and Bundle Quantity Options config | Status text only | No mutation controls |

### RustAuthorization

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parent merge attributes | Valid runtime-token merge | Parent retains token and offer-group attributes | Checkout route anchor |
| 2 | Exact add-on authorization | Signed add-on variant, quantity, and discount | Discount candidate emitted only for exact line | Quantity changes require a fresh token |

## Acceptance Criteria

- [x] All listed focused Jest and Rust cases pass.
- [x] Checkout extension builds against API version `2026-04`.
- [x] Cart-line and thank-you targets are removed; Total Savings remains.
- [x] `purchase.checkout.block.render` recommends `ORDER_SUMMARY2` and declares `$app.bundle_ui_config` plus `$app.serverUrl`.
- [x] Modified files have zero ESLint errors.
- [x] Widget assets and the graph are rebuilt.
- [x] Deployment and live Chrome verification remain manual follow-up work.
