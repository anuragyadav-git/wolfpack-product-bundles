---
schema_version: 1
id: grand-headbands-order-incident
title: Grand Headbands bundle order incident
type: test-spec
status: active
summary: Verifies native bundle grouping while keeping signed runtime data off ordinary FPB order component lines and preserving market-correct pricing.
last_audited: 2026-09-14
owners:
  - engineering
domains:
  - storefront
  - orders
systems:
  - cart-transform
  - bundle-widget
source_paths:
  - apps/OnlyBundles-app/app/routes/api/api.cart-bundle-details.tsx
  - apps/OnlyBundles-app/app/assets/widgets/full-page/methods/step-footer-methods.ts
  - apps/OnlyBundles-app/extensions/bundle-cart-transform-rs
related_docs:
  - internal docs/Architecture/Cart Transform Function.md
  - internal docs/Features/Pricing Pipeline.md
tags:
  - incident
  - fpb
keywords:
  - Grand Headbands
  - bundle order metadata
---

# Test Spec: Grand Headbands Bundle Order Incident

**Spec ID:** grand-headbands-order-incident  **Created:** 2026-09-14

## Purpose

Keep Shopify's native bundle line-item group intact while preventing large runtime and display payloads from being persisted on ordinary FPB component order lines. Confirm that FPB product prices come from Shopify's market-contextual Storefront response.

## Test Cases

### Cart metafield authorization

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Signed runtime data is synchronized before cart add | Valid cart token, bundle key, display properties, runtime token | App-reserved `bundle_details` cart metafield contains both display properties and runtime token | Cart Transform reads trusted data without component-line leakage |
| 2 | Storefront mutation uses Shopify's cart metafield input | Valid synchronized entry | `cartMetafieldsSet` receives `CartMetafieldsSetInput` | Prevents the live GraphQL failure |
| 3 | Missing runtime authorization | Display metadata without runtime token | Request is rejected before cart add | Ordinary FPB merge stays fail-closed |

### Component order metadata

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Ordinary FPB component submission | Paid component lines and a valid cart-metafield runtime token | Lines retain the short offer grouping key but omit `_wolfpack_bundle_runtime` and `_bundle_display_properties` | Shopify can still form its native line-item group |
| 2 | Subscription or add-on authorization | A line that must be evaluated directly by the Discount Function | Runtime token remains on only the lines that require it | Preserves current discount security boundary |
| 3 | Cart Transform merge | Two authorized components and cart-level runtime entry | One native merged bundle operation with the expected parent and component quantities | No product loss or synthetic order lines |

### Market pricing

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Complete cached AUD product viewed in INR market | Cached 20.00 AUD product and Storefront hydration returning 1400.00 INR | Product and selected-summary price are 140000 minor units with currency `INR` | Product amounts are not multiplied by the presentment rate twice |

## Acceptance Criteria

- [x] Native Shopify line-item grouping remains active.
- [x] Ordinary FPB component lines contain no signed runtime token or display JSON.
- [x] Cart metafield synchronization succeeds with Shopify's canonical mutation input.
- [x] Market-contextual product prices use the Storefront API amount exactly once.
- [x] Focused Jest and Rust Function tests pass.
- [x] Widget and Function builds pass.
