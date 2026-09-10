---
schema_version: 1
id: storefront-money-and-hydration
title: Storefront Money and Hydration Test Spec
type: test-spec
status: active
summary: Verifies Shopify MoneyV2 presentment currency, one-time authored-value conversion, canonical pricing operators, and fail-closed PPB hydration.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - storefront
systems:
  - product-hydration
  - pricing-runtime
source_paths:
  - app/routes/api/api.storefront-products.tsx
  - app/assets/widgets/product-page/storefront-client.ts
  - app/assets/widgets/product-page/methods/default-product-methods.ts
  - app/assets/widgets/product-page/methods/product-data-methods.ts
  - app/assets/widgets/shared/currency-manager.ts
  - app/assets/widgets/shared/components/product-card.ts
  - app/assets/widgets/shared/pricing-calculator.ts
related_docs:
  - internal docs/Features/Pricing Pipeline.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - money
keywords:
  - MoneyV2
  - fail closed
---

# Test Spec: Storefront Money and Hydration

**Spec ID:** storefront-money-and-hydration  **Created:** 2026-09-06

## Purpose

Use Shopify's market-contextual product money as authoritative while converting merchant-authored absolute pricing inputs exactly once and refusing stale PPB product snapshots.

## Test Cases

### StorefrontMoneyAndHydration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | MoneyV2 mapping | Shopify variant amount and currency code | DTO preserves both | Direct and proxied clients |
| 2 | Presentment formatting | Presentment cents and currency | `Intl.NumberFormat` output | No symbol table |
| 3 | Authored absolute value | Base-currency cents and presentment rate | Converted once | Amount thresholds and fixed discounts |
| 4 | Canonical operator | `gte`, `gt`, `lte`, `lt`, or `eq` | Deterministic comparison | No alias mapping |
| 5 | Unsupported operator | Legacy or unknown spelling | Rule does not qualify | Fail closed |
| 6 | Missing Storefront runtime | PPB configured products | Hydration failure state and no cached products | Block selection and ATC |
| 7 | Storefront error, incomplete data, or malformed money | Failed or partial Shopify response, non-decimal amount, or invalid currency code | Hydration failure state | Existing error surface; never normalize malformed money to zero |
| 8 | Unavailable inventory | Shopify reports unavailable or zero stock | Product cannot be selected | Existing inventory behavior |
| 9 | SDK currency formatting failure | `Intl.NumberFormat` rejects the hydrated currency | Formatting error propagates | Do not fabricate a USD fallback |
| 10 | Missing canonical step data | Bundle total requested without a steps array | Pricing rejects the incomplete bundle | No legacy paid-gift fallback |
| 11 | Base-market context | Shopify Liquid base and customer currencies are equal | Authored absolute value is unchanged | No exchange-rate conversion |
| 12 | Missing base currency | Shopify currency context is absent | Currency resolution fails closed | Do not assume USD |
| 13 | Direct default hydration fails | Saved default-product price, inventory, and availability exist but Shopify runtime is missing | Saved display and commerce snapshots are discarded, step hydration fails, and ATC remains blocked | Configuration contributes only IDs and required quantity |
| 14 | Direct default hydration succeeds | Saved default-product snapshots disagree with the live Shopify response | Live Shopify price, currency, availability, inventory, title, and image win | Preserve configured variant ID and required quantity |
| 15 | Shared product-card money | Market-contextual cents and a Shopify `MoneyV2.currencyCode` | Product and compare-at prices are formatted through `Intl.NumberFormat` with that currency | Never substitute a dollar-format string |
| 16 | Monetary pricing feedback | Presentment threshold or fixed discount in a locale where the currency follows the amount | Condition, discount, and template variables contain the locale-aware `Intl.NumberFormat` value | Do not concatenate a currency symbol with `toFixed(2)` |
| 17 | FPB product-details modal money | Hydrated variant cents and currency code without an injected widget formatter | Modal price uses `Intl.NumberFormat` with the hydrated currency | No hardcoded dollar fallback |
| 18 | FPB add-on amount eligibility | Base-currency threshold, presentment subtotal, and Shopify presentment rate | Threshold converts once before qualification and the remaining amount is locale-aware money | Do not compare presentment product totals to unconverted authored values |
| 19 | FPB product normalization | Storefront API product variants with price and compare-at currency codes | Grouped cards, individual cards, and modal variants retain both codes | Do not discard `MoneyV2.currencyCode` after transport mapping |
| 20 | Compact shared product-card money | Dollar-family presentment currency with a locale that normally disambiguates the symbol | Every FPB and PPB shared product card uses the locale-aware narrow symbol, while non-card money keeps its existing explicit formatter | Use `Intl.NumberFormat`; no symbol table or string replacement |

## Acceptance Criteria

- [x] Product DTOs preserve `currencyCode`.
- [x] Money rendering, including shared product cards and pricing feedback, uses `Intl.NumberFormat`.
- [x] Shared FPB and PPB product cards use compact native currency symbols without changing bundle summaries, pricing messages, cart totals, or checkout totals.
- [x] SDK display pricing has no hardcoded currency fallback.
- [x] PPB never falls back to embedded price or inventory snapshots, including direct default products.
- [x] Pricing uses only the five canonical operator values.
- [x] Pricing fails closed when canonical step data is missing.
- [x] All listed behavior tests pass.
