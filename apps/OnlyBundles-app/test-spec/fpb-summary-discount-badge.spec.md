---
schema_version: 1
id: fpb-summary-discount-badge
title: FPB Summary Discount Badge
type: test-spec
status: active
summary: Verifies that FPB summary surfaces use the canonical discount value for their savings badge.
last_audited: 2026-07-29
owners:
  - storefront
domains:
  - bundles
systems:
  - full-page-bundle
source_paths:
  - app/assets/widgets/full-page/shared/summary-discount-badge.js
  - app/assets/widgets/full-page/shared/summary-pricing-display.js
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - scripts/build-widget-bundles.js
  - extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - storefront
keywords:
  - discount-badge
  - summary-sidebar
  - mobile-footer
---

# Test Spec: FPB Summary Discount Badge

**Spec ID:** fpb-summary-discount-badge  **Created:** 2026-07-26

## Purpose

Ensure desktop and mobile FPB summary surfaces display the value produced by the
canonical pricing calculation without legacy field fallbacks.

## Test Cases

### Summary discount badge label

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Qualifying fixed bundle price | `hasDiscount: true`, `discountPercentage: 13.812...` | `14% off` | Uses the canonical calculated percentage |
| 2 | Qualifying fixed amount off | `discountMethod: fixed_amount_off`, formatted amount `$15.00` | `$15.00 off` | Uses the canonical formatted savings amount |
| 3 | No qualifying discount | `hasDiscount: false`, percentage `14` | Empty label | Badge remains hidden |
| 4 | Missing or zero percentage | Qualified discount without a positive percentage | Empty label | No fallback calculation |
| 5 | Full-page widget build | Build the generated storefront asset | Formatter definition appears before summary consumers | Prevents runtime initialization failure |
| 6 | Classic desktop fixed bundle price | Qualified fixed price with original total `$1448.00` and final total `$5.00` | Both original and fixed totals render | Matches current live EB Classic behavior |
| 7 | Classic mobile fixed bundle price | Qualified fixed price with final total `$5.00` | Add-to-cart action uses `$5.00` | Keeps the shared mobile summary contract |
| 8 | Qualified discount with step tier labels | Saved success message plus separate tier title/subtitle | Success surface uses the success message; progress surface keeps tier labels | Matches EB step-based BOGO behavior |
| 9 | Qualified BOGO summary state | `qualifiesForDiscount: true` with `hasDiscount: false` | Desktop and mobile summaries render the saved success message | BOGO qualification is not suppressed by percentage-discount flags |
| 10 | FPB standard desktop pricing layout | Qualified discount on desktop summary | Strike out price, final price, and discount badge render in order inside `.side-panel-total-prices` with left alignment | Left-aligned under Total heading |

## Acceptance Criteria

- [ ] A positive canonical discount percentage produces a rounded badge label.
- [ ] A qualifying fixed amount discount produces a formatted savings-amount badge label.
- [ ] Missing, zero, or unqualified discount data does not produce a badge.
- [ ] Desktop summary totals and the mobile summary discount block reuse the same formatter.
- [ ] Classic desktop and mobile summaries display the qualified fixed bundle price.
- [ ] Qualified success copy is not replaced by step-tier labels.
- [ ] Qualified BOGO success copy renders in desktop and mobile summaries.
- [ ] Generated full-page widget includes the formatter before summary modules execute.
- [ ] FPB standard desktop summary aligns strike out price, final price, and discount percentage badge to the left in that order.
