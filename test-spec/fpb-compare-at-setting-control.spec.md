---
schema_version: 1
id: fpb-compare-at-setting-control
title: "Test Spec: FPB Compare-at Price Visibility"
type: test-spec
status: active
summary: Verifies that FPB always renders available compare-at prices without a merchant visibility setting.
last_audited: 2026-08-12
owners:
  - Wolfpack Product Bundles
domains:
  - admin-configure
systems:
  - full-page-bundle
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSummaryText.tsx
  - app/assets/widgets/full-page/methods/product-card-footer-methods.ts
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - compare-at-price
keywords:
  - compareAtPrice
  - Bundle Settings
---

# Test Spec: FPB Compare-at Price Visibility

**Spec ID:** fpb-compare-at-setting-control  **Created:** 2026-07-22

## Purpose

Keep FPB compare-at visibility product-driven: render it whenever the selected
product or variant supplies a compare-at price, and do not expose or save a
separate FPB visibility setting.

## Test Cases

### FpbCompareAtSettingControl

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | FPB settings surface | Any persisted `showCompareAtPrices` value | No compare-at visibility control renders | Compare-at visibility is not merchant-configurable in FPB |
| 2 | FPB save transport | Submitted `showCompareAtPrices` field | The field is ignored and is not written to the bundle | Removes stale FPB configuration ownership |
| 3 | Storefront flag false | Sale product plus `showProductComparedAtPrice: false` | Card renders the compare-at price | Product data is the only visibility gate |
| 4 | Storefront flag absent | Sale product without a visibility flag | Card renders the compare-at price | No fallback setting contract |
| 5 | Product without compare-at data | Regular product | Card renders only its current price | No fabricated compare-at value |
| 6 | Grouped unavailable variant | Grouped product with two sellable variants and one unavailable variant | Every FPB preset omits the unavailable option | Keeps the surviving variant identities |
| 7 | Variant selector disabled | Grouped product with multiple sellable variants | Every FPB preset renders the configured quick-look action without an inline selector | Matches the source fixture control state |
| 8 | Disabled-selector card action | Shopper activates the grouped product action | Variant selection opens and no default variant is added | Prevents silent default-variant selection |

## Acceptance Criteria

- [x] FPB does not expose or save a compare-at visibility control.
- [x] Storefront cards render valid compare-at data regardless of stale visibility flags.
- [x] Products without compare-at data render only their current price.
- [x] Grouped selectors omit unavailable variants in all four presets.
- [x] Disabled grouped selectors use variant selection instead of adding a default variant.
- [x] Focused behavior tests pass.
