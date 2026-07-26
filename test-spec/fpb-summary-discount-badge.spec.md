---
schema_version: 1
id: fpb-summary-discount-badge
title: FPB Summary Discount Badge
type: test-spec
status: active
summary: Verifies that FPB summary surfaces use the canonical calculated discount percentage for their savings badge.
last_audited: 2026-07-26
owners:
  - storefront
domains:
  - bundles
systems:
  - full-page-bundle
source_paths:
  - app/assets/widgets/full-page/shared/summary-discount-badge.js
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
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

Ensure desktop and mobile FPB summary surfaces display the percentage produced by
the canonical pricing calculation without legacy field fallbacks.

## Test Cases

### Summary discount badge label

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Qualifying fixed bundle price | `hasDiscount: true`, `discountPercentage: 13.812...` | `14% off` | Uses the canonical calculated percentage |
| 2 | No qualifying discount | `hasDiscount: false`, percentage `14` | Empty label | Badge remains hidden |
| 3 | Missing or zero percentage | Qualified discount without a positive percentage | Empty label | No fallback calculation |

## Acceptance Criteria

- [ ] A positive canonical discount percentage produces a rounded badge label.
- [ ] Missing, zero, or unqualified discount data does not produce a badge.
- [ ] Desktop summary totals and the mobile summary discount block reuse the same formatter.
