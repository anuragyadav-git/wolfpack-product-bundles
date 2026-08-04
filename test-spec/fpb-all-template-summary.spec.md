---
schema_version: 1
id: fpb-all-template-summary
title: FPB All-Template Summary
type: test-spec
status: active
summary: Defines behavior coverage for shared responsive summary ownership across all FPB presets.
last_audited: 2026-08-05
owners:
  - Aditya Awasthi
domains:
  - storefront
systems:
  - fpb-summary
source_paths:
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
related_docs:
  - design-jobs/fpb-all-template-summary-20260804/state-matrix.md
tags:
  - fpb
  - tdd
keywords:
  - summary
  - responsive ownership
---

# Test Spec: FPB All-Template Summary

**Spec ID:** fpb-all-template-summary  **Created:** 2026-08-05

## Purpose

Verify the behavior that supports one coherent summary system without asserting CSS, class names, or visual placement.

## Test Cases

### SharedSummaryPresentationMode

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Supported preset below boundary | Each FPB preset, footer-side layout, width 1023 | `tray` | Width is measured from the widget container. |
| 2 | Supported preset at boundary | Each FPB preset, footer-side layout, width 1024 | `sidebar` | Boundary is inclusive for desktop. |
| 3 | Unsupported layout | Any FPB preset, footer-bottom layout | `null` | Do not override non-sidebar layouts. |
| 4 | Unknown preset | Unknown preset, footer-side layout | `null` | Fail closed. |
| 5 | Mode propagation | Widget, layout, and tray owners | Same mode attribute on each owner | Behavior assertion uses attributes, not styling. |

### SharedMobileDisclosure

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Collapsed disclosure | Expanded false | Content inert and hidden | Prevent hidden focus targets. |
| 2 | Expanded disclosure | Expanded true | Content interactive and exposed | Page remains scrollable. |
| 3 | Any preset expanded | Standard, Classic, Compact, Horizontal | Body scroll lock remains off | Tray is non-modal for every preset. |
| 4 | Fluid shared footer | Any FPB preset | Shared footer branch enabled | All presets use the same responsive anatomy. |

## Acceptance Criteria

- [ ] All listed behavior tests pass.
- [ ] Existing removal, slot, discount, quantity, navigation, and cart tests remain green.
- [ ] No unit test asserts CSS, class names, or screen placement.
- [ ] Browser QA proves visual and responsive contracts separately.
