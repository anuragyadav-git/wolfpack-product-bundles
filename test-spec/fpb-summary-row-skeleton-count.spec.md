---
schema_version: 1
id: fpb-summary-row-skeleton-count
title: FPB Summary Row Skeleton Count Test Spec
type: test-spec
status: active
summary: Verifies Compact and Horizontal keep EB-style remaining summary rows when Product Slots is disabled.
last_audited: 2026-07-23
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
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

Keep the Product Slots-disabled partial-summary behavior aligned with current EB Compact and Horizontal desktop/mobile evidence without changing Standard or Classic.

## Test Cases

### RemainingSummarySkeletonCount

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Compact partial summary | required 2, selected 1, Product Slots off | 1 | Shared by desktop and mobile |
| 2 | Horizontal partial summary | required 2, selected 1, Product Slots off | 1 | Shared by desktop and mobile |
| 3 | Product Slots enabled | required 2, selected 1 | 0 | Slot tiles own the empty state |
| 4 | Standard or Classic | Product Slots off | 0 | Preserve existing proven branches |
| 5 | Required quantity met or exceeded | required 2, selected 3 | 0 | Never produce negative rows |

## Acceptance Criteria

- [ ] Compact and Horizontal calculate remaining skeleton rows from saved required quantity and selected quantity.
- [ ] Product Slots-enabled summaries do not add row skeletons.
- [ ] Standard and Classic behavior is unchanged.
- [ ] Desktop and mobile consume the same calculation.
