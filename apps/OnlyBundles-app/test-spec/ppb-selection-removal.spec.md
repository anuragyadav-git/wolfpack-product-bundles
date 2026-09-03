---
schema_version: 1
id: ppb-selection-removal
title: PPB Selection Removal
type: test-spec
status: active
summary: Verifies that removing a PPB selection clears canonical quantity and category ownership state.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/product-page/methods/selection-data-methods.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - ppb
  - selection
  - removal
keywords:
  - selectedProducts
  - selectedProductCategoryIndexes
---

# Test Spec: PPB Selection Removal

**Spec ID:** ppb-selection-removal  **Created:** 2026-08-10

## Purpose

Ensure every PPB removal surface clears the canonical selected-product quantity
and its category ownership before session persistence.

## Test Cases

### ProductPageSelectionDataMethods

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Remove final selected unit | Canonical variant GID with quantity `0` | Selection key and category ownership are deleted, then state persists | Covers filled modal-slot removal and all callers of `setSelectedQuantity` |

## Acceptance Criteria

- [x] Zero quantity removes the normalized key from `selectedProducts`.
- [x] Zero quantity removes the normalized key from `selectedProductCategoryIndexes`.
- [x] The corrected state is persisted once.
