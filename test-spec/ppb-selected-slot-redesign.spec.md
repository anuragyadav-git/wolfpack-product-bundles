---
schema_version: 1
id: ppb-selected-slot-redesign
title: PPB Selected Slot Redesign Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for selected-slot identity, pricing, exact actions, and focus recovery.
last_audited: 2026-08-21
owners:
  - wolfpack
domains:
  - storefront
systems:
  - product-page-bundle
source_paths:
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/implementation-handoff.md
tags:
  - ppb
  - tdd
keywords:
  - selected-slot
  - compare-at-price
---

# Test Spec: PPB Selected Slot Redesign

**Spec ID:** ppb-selected-slot-redesign  **Created:** 2026-08-21

## Purpose

Verify that selected PPB slots expose complete product identity and product-driven pricing while preserving exact replacement, removal, and focus behavior.

## Test Cases

### SelectedSlotContent

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Expanded variant identity | Parent title, variant title, expanded card title | Parent title and separate variant | No visual/source assertions |
| 2 | Default variant | Default Title variant | Variant output omitted | Product title remains full |
| 3 | Compare-at available | Compare-at greater than payable | Both formatted prices | No PPB configuration gate |
| 4 | Compare-at unavailable | Missing, equal, or lower compare-at | Payable only | Prevent redundant strike price |
| 5 | Horizontal long title | Title longer than 25 characters | Full title returned | CSS owns visual clamping |

### SelectedSlotActions

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Exact replacement | Activate filled instance | Existing replacement target and picker flow | Other slots unchanged |
| 2 | Exact removal | Activate remove | Only targeted selection changes | Remove never opens picker |
| 3 | Removal focus recovery | Remove and rerender same step | Same-index recovery control receives focus | Falls back within the step |
| 4 | Keyboard replacement | Enter and Space | Picker opens once | Existing helper contract |

## Acceptance Criteria

- [x] All listed test cases pass.
- [x] Tests assert behavior and returned content, not CSS, class names, source order, or visual placement.
- [x] Existing PPB slot replacement and keyboard tests remain green.
