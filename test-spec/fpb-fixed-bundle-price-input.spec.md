---
schema_version: 1
id: fpb-fixed-bundle-price-input
title: FPB Fixed Bundle Price Input
type: test-spec
status: active
summary: Verifies that the FPB fixed bundle price field converts display currency to canonical cents exactly once.
last_audited: 2026-07-26
owners:
  - Wolfpack Product Bundles
domains:
  - bundle-configuration
systems:
  - full-page-bundle-admin
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingRules.tsx
  - tests/unit/routes/fpb-fixed-bundle-price-input.test.ts
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - discount
  - fixed-bundle-price
keywords:
  - currency input
  - canonical cents
  - fixed bundle price
---

# Test Spec: FPB Fixed Bundle Price Input

**Spec ID:** fpb-fixed-bundle-price-input
**Created:** 2026-07-26

## Purpose

Ensure the merchant-entered fixed bundle price crosses the Admin input boundary
once and is stored in canonical cents without a controlled-input feedback loop.

## Test Cases

### FixedBundlePriceInput

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Whole currency amount | `"1000"` | `100000` | Converts once to cents |
| 2 | Decimal currency amount | `"1000.25"` | `100025` | Preserves currency precision |
| 3 | Empty input | `""` | `0` | Keeps the canonical empty numeric state |

## Acceptance Criteria

- [ ] Currency input is converted to cents exactly once.
- [ ] Opening the Discount & Pricing panel does not mutate the saved value.
- [ ] The fixed-price field commits merchant edits without a render feedback loop.
