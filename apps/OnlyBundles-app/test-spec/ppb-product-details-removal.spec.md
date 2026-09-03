---
schema_version: 1
id: ppb-product-details-removal
title: Test Spec: PPB Product Details Removal
type: test-spec
status: active
summary: Verifies that product details remain available only in FPB while PPB retains its picker and explicit selection controls.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-widgets
source_paths:
  - app/assets/widgets/shared/components/product-card.ts
  - app/assets/widgets/product-page
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - ppb
keywords:
  - product details
---

# Test Spec: PPB Product Details Removal

**Spec ID:** ppb-product-details-removal  **Created:** 2026-08-28

## Purpose

Keep the image-activated product-details modal and magnifying affordance in FPB
only. PPB product images are informational while the PPB bundle picker, Add,
quantity, variant, replacement, and removal behavior remains available.

## Test Cases

### ProductDetailsOwnership

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB card image activation | Click or keyboard activation on a PPB product image | No product-details modal opens and no selection mutates | Applies to all PPB templates |
| 2 | PPB card semantics | Render a PPB shared product card | Image and title are not exposed as product-details controls | Add, quantity, and variant controls remain interactive |
| 3 | PPB slot picker | Activate an empty Horizontal or Vertical Slot | The existing bundle picker opens | The picker is not the removed details modal |
| 4 | FPB product details | Activate an FPB product image or existing title trigger | Existing product-details modal opens | Carousel, variants, quantity, and read-only behavior remain unchanged |

## Acceptance Criteria

- [ ] PPB does not construct or open the shared Bundle Product Modal.
- [ ] PPB product images expose no magnifying-glass affordance.
- [ ] Horizontal and Vertical Slots retain their bundle-picker flow.
- [ ] FPB product-details behavior remains unchanged.
- [ ] Tests assert behavior and accessibility semantics, not CSS placement.
