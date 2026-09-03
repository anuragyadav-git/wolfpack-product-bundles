---
schema_version: 1
id: product-page-card-quantity-selector
title: Product Page Card Quantity Selector
type: test-spec
status: active
summary: Verifies PPB selected-card quantity controls and the Product Grid maximum-one action exception.
last_audited: 2026-08-21
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-bundle-widget
source_paths:
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
  - app/assets/widgets/product-page/methods/selection-methods.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - ppb
  - quantity-selector
keywords:
  - Product Grid
  - validateQuantityPerProduct
---

# Test Spec: Product Page Card Quantity Selector
**Spec ID:** product-page-card-quantity-selector  **Created:** 2026-06-12

## Purpose

Verify PPB product cards keep the same selected-card quantity selector behavior as FPB when the product is added from a compact/shared card surface.

## Test Cases

### ProductPageSelectionMethods
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shared PPB card is selected | Shared product card with only an add button, `quantity = 2` | Runtime removes the add button and appends an inline quantity control with the current quantity | Covers Grid/Cascade shared-card surfaces |
| 2 | Shared PPB quantity button is clicked | Click target has `inline-qty-btn qty-increase` classes | Delegated handler treats it as a quantity control | Prevents rendered selector from being inert |
| 3 | Shared PPB card selection changes | Quantity changes from zero to positive, then back to zero | Card `aria-pressed` and selected-state label match the current quantity | Covers partial DOM updates without a full card render |
| 4 | Product Grid maximum-one validation | Validation enabled with maximum `1`, selected quantity `1` | Card shows the quantity-aware selected button and no inline selector | Matches the EB maximum-one exception |
| 5 | Product Grid validation disabled | Validation disabled, selected quantity `1` | Card shows inline decrement, quantity, and increment controls | No configured validation maximum gates the selector |
| 6 | Product Grid maximum above one | Validation enabled with maximum `3`, selected quantity `3` | Card shows inline controls and disables increment at the configured maximum | Uses the shared quantity-validation limit |

## Acceptance Criteria

- [x] Selected PPB product cards render a functional quantity selector without requiring a full re-render.
- [x] Product Grid uses `Added x1` only when enabled per-product quantity validation has maximum `1`.
- [x] Product Grid renders inline quantity controls when validation is disabled or its maximum exceeds `1`.
- [x] Product Grid increment is disabled at an enabled configured maximum above `1`.
- [x] Partial quantity updates keep the card's accessible selected state synchronized.
- [x] The test verifies behavior and state, not visual placement or CSS values.
