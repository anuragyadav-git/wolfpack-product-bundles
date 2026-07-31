---
schema_version: 1
id: fpb-classic-product-slots-disabled
title: FPB Classic Product Slots Disabled
type: test-spec
status: active
summary: Verifies that Classic desktop uses selected-product rows instead of slot tiles when Product Slots is disabled.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - classic
  - product-slots
keywords:
  - Product Slots disabled
  - Classic desktop summary
---

# Test Spec: FPB Classic Product Slots Disabled

**Spec ID:** fpb-classic-product-slots-disabled  **Created:** 2026-07-30

## Purpose

Keep Classic desktop on the selected-product row branch when Product Slots is
disabled, matching the current EB storefront behavior.

## Test Cases

### ClassicDesktopSummarySlotMode

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Product Slots enabled | Classic desktop sidebar and enabled toggle | Slot-tile mode is selected | Preserves enabled behavior |
| 2 | Product Slots disabled | Classic desktop sidebar and disabled toggle | Slot-tile mode is not selected | Uses selected-product rows |
| 3 | Non-Classic context | Non-Classic sidebar and enabled toggle | Classic slot-tile mode is not selected | Keeps ownership isolated |

## Acceptance Criteria

- [x] Focused regression tests pass.
- [x] Widget bundle builds successfully.
- [x] Live Classic desktop renders selected-product rows with no slot tiles when Product Slots is disabled.
