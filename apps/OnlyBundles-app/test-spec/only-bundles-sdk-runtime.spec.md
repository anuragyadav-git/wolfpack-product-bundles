---
schema_version: 1
id: only-bundles-sdk-runtime-test-spec
title: Only Bundles SDK Runtime Test Spec
type: test-spec
status: active
summary: Defines initialization, hydration, validation, mutation, event, pricing, and cart contracts for the limited-release Product Page Bundle SDK.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-sdk
source_paths:
  - apps/OnlyBundles-app/app/storefront/sdk.ts
  - apps/OnlyBundles-app/app/assets/sdk/
  - apps/OnlyBundles-app/tests/unit/assets/
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
keywords:
  - WolfpackBundles
  - wbp:init-failed
---

# Test Spec: Only Bundles SDK Runtime

**Spec ID:** only-bundles-sdk-runtime  **Created:** 2026-09-03

## Purpose

Ensure the public SDK becomes available only after a valid, eligible schema-v3
Product Page Bundle has been localized and hydrated from Shopify's Storefront
API, and that every public mutation preserves the normal PPB validation and
cart contracts.

## Test Cases

### Initialization

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Hydrate eligible bundle | Valid schema-v3 PPB snapshot and Storefront runtime | Products and variants are normalized before `wbp:ready` | Uses the PPB client and normalizer |
| 2 | Localize config | Regional Shopify locale | Localized step data is hydrated | Locale projection precedes exposure |
| 3 | Reject invalid config | Invalid JSON or non-v3/non-PPB snapshot | `wbp:init-failed` with `INVALID_CONFIGURATION` | No global is exposed |
| 4 | Reject missing runtime | Valid eligible snapshot without token/runtime fields | `wbp:init-failed` with `MISSING_STOREFRONT_RUNTIME` | Fail closed |
| 5 | Reject hydration failure | Storefront request fails or a configured product is missing | `wbp:init-failed` with `PRODUCT_HYDRATION_FAILED` | No ready event |
| 6 | Hide ineligible offer | Eligibility decision is false | Container is hidden without a failure event | Eligibility runs before product fetch |

### State and Mutations

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Read public state | Ready SDK | Configuration is frozen and selections are copied | Caller mutations cannot alter SDK state |
| 2 | Add known variant | Positive integer quantity and sellable hydrated variant | Selection changes and event uses `quantity` | No `qty` alias |
| 3 | Reject invalid quantity | Zero, negative, fractional, or non-finite quantity | Error result and no state mutation | Applies to add and remove |
| 4 | Reject unknown/unavailable variant | Variant absent or unavailable | Error result and no state mutation | Shopify catalog is authoritative |
| 5 | Enforce step rules | Quantity, amount, or weight upper boundary | Rule-breaking increase is rejected | Uses hydrated variant metrics |
| 6 | Enforce category rules | Category-specific upper boundary | Rule-breaking increase is rejected | Variant key maps to parent product |
| 7 | Validate bundle | Current selections | Quantity, amount, weight, and category rules match PPB behavior | Free-gift/default steps remain non-blocking |

### Pricing and Cart

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Calculate display price | Hydrated selections and pricing tiers | Cent totals and formatted price are returned | Uses shared pricing logic |
| 2 | Add valid bundle | Valid selections | Runtime token is requested before `/cart/add` | Existing PPB Cart Transform contract |
| 3 | Handle cart failure | Token or cart request fails | `wbp:cart-failed` is emitted | No redirect or order placement |

## Acceptance Criteria

- [x] All listed behavior tests pass.
- [x] Generated SDK is a self-contained valid browser script.
- [x] Widget version is `18.7.0`.
- [x] Shopify CSS asset-size validation passes.
