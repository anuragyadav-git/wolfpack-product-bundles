---
schema_version: 1
id: fpb-summary-row-skeleton-count
title: FPB Shared Summary Skeleton Count Test Spec
type: test-spec
status: active
summary: Verifies every FPB template keeps a shared responsive summary skeleton baseline when Product Slots is disabled.
last_audited: 2026-08-11
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.ts
  - app/assets/widgets/full-page/methods/mobile-summary-methods.ts
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - summary
  - product-slots
keywords:
  - remaining summary rows
  - Product Slots disabled
---

# Test Spec: FPB Summary Row Skeleton Count

**Spec ID:** fpb-summary-row-skeleton-count  **Created:** 2026-07-23

## Purpose

Keep the Product Slots-disabled summary behavior consistent across Standard,
Classic, Compact, and Horizontal on desktop and mobile. A new bundle without a
quantity rule starts with two skeleton rows, matching the current EB reference.

## Test Cases

### RemainingSummarySkeletonCount

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Any FPB template starts empty | no quantity rule, selected 0, Product Slots off | 2 | Shared desktop/mobile baseline |
| 2 | Any FPB template has one selection | no quantity rule, selected 1, Product Slots off | 1 | Baseline shrinks with selections |
| 3 | Explicit quantity rule | required 4, selected 1, Product Slots off | 3 | Saved rule owns the target when larger than baseline |
| 4 | Product Slots enabled | any supported template | 0 | Slot tiles own the empty state |
| 5 | Required quantity met or exceeded | required 2, selected 3 | 0 | Never produce negative rows |
| 6 | Unsupported template | Product Slots off | 0 | FPB-only behavior |

## Acceptance Criteria

- [ ] Standard, Classic, Compact, and Horizontal use the same skeleton-count calculation.
- [ ] A bundle without a quantity rule starts with two skeleton rows.
- [ ] A larger saved quantity requirement controls the target row count.
- [ ] Product Slots-enabled summaries do not add row skeletons.
- [ ] Desktop and mobile consume the same calculation.
