---
schema_version: 1
id: fpb-product-quantity-limit-controls
title: FPB Product Quantity Limit Controls Test Spec
type: test-spec
status: active
summary: Verifies that FPB product selection and increment controls enforce the configured per-product quantity limit.
last_audited: 2026-08-21
owners:
  - wolfpack
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/shared/condition-validator.js
  - app/assets/widgets/full-page/methods/product-card-footer-methods.js
  - app/assets/widgets/full-page/methods/selection-navigation-methods.js
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - quantity
  - parity
keywords:
  - validateQuantityPerProduct
  - increment disabled
---

# Test Spec: FPB Product Quantity Limit Controls

**Spec ID:** fpb-product-quantity-limit-controls  **Created:** 2026-07-21

## Purpose

Ensure every FPB preset disables its product-card increment control when the merchant-configured per-product quantity limit is reached, and re-enables it when quantity falls below that limit.

## Test Cases

### FpbProductQuantityLimitControls

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Quantity reaches a configured limit greater than one | Limit `3`, quantity `3` | Increment button is disabled and exposes `aria-disabled="true"` | Prevents fixture-specific limit handling. |
| 2 | Quantity drops below the limit | Limit `2`, quantity changes from `2` to `1` | Increment button is enabled and stale ARIA state is removed | Covers live selection updates. |
| 3 | Per-product validation is disabled | Disabled rule, quantity `9` | Increment button stays enabled | Preserves unrestricted quantity behavior. |
| 4 | Enabled validation rejects a mutation above the maximum | Limit `1`, current quantity `1`, requested quantity `2` | Stored selection and downstream UI updates remain unchanged | Prevents callers from bypassing a disabled increment control. |
| 5 | Enabled validation permits a mutation at the maximum | Limit `3`, current quantity `2`, requested quantity `3` | Stored selection becomes `3` and normal FPB updates run | Confirms limits greater than one remain usable. |
| 6 | Disabled validation permits quantities above the saved maximum | Disabled rule with saved limit `1`, current quantity `1`, requested quantity `2` | Stored selection becomes `2` | The enable flag owns enforcement. |

## Acceptance Criteria

- [x] All listed test cases pass.
- [x] Initial selected-card render and live quantity changes use the same configured rule.
- [x] The FPB selection mutation rejects increases above an enabled maximum.
- [x] Enabled maxima greater than one and disabled validation preserve normal quantity updates.
- [x] No quantity clamping or fixture-specific limit is introduced.
- [x] Agent Store desktop and mobile behavior matches the source fixture after a hard reload.
