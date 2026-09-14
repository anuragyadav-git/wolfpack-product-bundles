---
schema_version: 1
id: admin-percentage-discount-validation
title: Admin Percentage Discount Validation
type: test-spec
status: active
summary: Verifies that FPB and PPB percentage discounts are whole numbers from zero through one hundred before save.
last_audited: 2026-09-12
owners:
  - engineering
domains:
  - admin
  - pricing
systems:
  - bundle-configure
source_paths:
  - apps/OnlyBundles-app/app/lib/bundle-config/configure-validation.ts
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingRules.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FpbBxyDiscountRuleFields.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonTierEditor.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountRulesPanel.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbMainSections.tsx
related_docs:
  - internal docs/Features/Pricing Pipeline.md
tags:
  - percentage
  - validation
keywords:
  - s-number-field
  - percentage off
  - discount rules
---

# Test Spec: Admin Percentage Discount Validation

**Spec ID:** admin-percentage-discount-validation  **Created:** 2026-09-12

## Purpose

Ensure FPB and PPB preserve the merchant-entered percentage, reject invalid values rather than silently clamping them, and never persist a value outside Shopify's percentage range.

## Test Cases

### ConfigurePercentageDiscountValidation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Lower boundary | Percentage Off `0` | Accepted | Shopify Discount Function lower bound |
| 2 | Upper boundary | Percentage Off `100` | Accepted | Shopify Discount Function upper bound |
| 3 | Below lower boundary | Percentage Off `-1` | Rejected with field error | No silent clamp |
| 4 | Above upper boundary | Percentage Off `101` | Rejected with field error | No silent clamp |
| 5 | Fractional value | Percentage Off `12.5` | Rejected with field error | Product requirement is whole percentages |
| 6 | Buy X Get Y percentage | Reward percentage at each boundary and outside it | Same whole-number range is enforced | Fixed-amount reward remains unchanged |
| 7 | Configure parity | Each case submitted as FPB and PPB | Identical validation result | Both save handlers use the shared validator |
| 8 | Validation presentation | Invalid percentage submitted from either configure flow | One error remains attached to the invalid field | No duplicated section-level summary |

## Acceptance Criteria

- [x] FPB and PPB accept whole percentage values from `0` through `100`, inclusive.
- [x] FPB and PPB reject negative, over-100, non-finite, and fractional percentages.
- [x] Percentage-mode Buy X Get Y follows the same contract.
- [x] Admin number fields advertise `min=0`, `max=100`, `step=1`, and a numeric input mode.
- [x] Invalid merchant input is retained for correction and is not silently clamped.
- [x] Fixed-amount and fixed-price discount entry behavior is unchanged.
- [x] Validation is rendered only by the affected Polaris field; no configure-level duplicate is inserted above the section.
