---
schema_version: 1
id: fpb-standard-mobile-variant-drawer
title: FPB Standard Mobile Variant Drawer Test Spec
type: test-spec
status: active
summary: Verifies the FPB Standard mobile variant drawer data and dismissal-control contract.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-widgets
source_paths:
  - app/assets/widgets/shared/variant-selector.ts
  - tests/unit/assets/fpb-standard-mobile-variant-drawer.test.ts
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - fpb
  - mobile-drawer
keywords:
  - variant drawer
  - close control
---

# Test Spec: FPB Standard Mobile Variant Drawer
**Spec ID:** fpb-standard-mobile-variant-drawer  **Created:** 2026-06-30

## Purpose
Verify that FPB Standard renders mobile variant choices through a drawer payload that preserves variant data, formatted prices, availability, and selection state.

## Test Cases
### VariantSelectorComponent
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render mobile drawer for multi-variant product | Product title, image, selected variant, multiple variants, price formatter | Drawer HTML includes product title, selected price, selectable option rows, disabled unavailable row, no Close control, and no undefined copy | Behavior/data only |

## Acceptance Criteria
- [x] All listed test cases pass
