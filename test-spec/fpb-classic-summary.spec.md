---
schema_version: 1
id: fpb-classic-summary-responsive-ownership
title: FPB Classic Summary Responsive Ownership Test Spec
type: test-spec
status: active
summary: Defines behavior tests for Classic summary sidebar and tray ownership across widget-width boundaries.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-testing
systems:
  - fpb-classic-summary
source_paths:
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
  - tests/unit/assets/fpb-classic-summary-responsive.test.ts
related_docs:
  - design-jobs/fpb-classic-summary-20260804/responsive-contract.md
tags:
  - fpb
  - classic
keywords:
  - responsive-ownership
  - summary-tray
---

# Test Spec: FPB Classic Summary Responsive Ownership

**Spec ID:** fpb-classic-summary  **Created:** 2026-08-04

## Purpose

Prove that the Classic footer-side summary chooses one presentation from available widget width without changing sibling-preset behavior, and that the tray remains inside the widget ownership boundary.

## Test Cases

### ClassicSummaryResponsiveOwnership

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Width below boundary | Classic, footer-side, 1023px | `tray` | Covers the approved upper tray boundary. |
| 2 | Width at boundary | Classic, footer-side, 1024px | `sidebar` | Covers the first desktop width. |
| 3 | Constrained host | Classic, footer-side, 600px inside wider viewport | `tray` | Uses component width, not viewport width. |
| 4 | Sibling preset | Standard, footer-side, 600px | no Classic override | Preserves existing sibling behavior. |
| 5 | Different layout | Classic, footer-bottom, 600px | no Classic override | Only the sidebar layout participates. |
| 6 | Apply presentation | Measured Classic root and tray | matching mode attributes | One state controls sidebar/tray exposure. |
| 7 | Tray mount ownership | Widget root and tray element | tray appended inside widget root | Enables component-scoped responsive styling. |
| 8 | Collapsed disclosure semantics | Compact tray details and collapsed state | details are inert and hidden from assistive technology | The persistent action remains outside the hidden details region. |

## Acceptance Criteria

- [ ] Tests fail before the new Classic responsive owner exists.
- [ ] Classic uses tray below 1024px and sidebar at 1024px or wider.
- [ ] A 600px component selects the tray independently of viewport width.
- [ ] Non-Classic presets and non-sidebar layouts receive no Classic override.
- [ ] The applied mode is shared by the widget root, layout root, and tray.
- [ ] The tray mounts within the widget root without changing selection or action behavior.
- [ ] Collapsed tray details cannot receive focus and return to the accessibility tree when expanded.
- [ ] No test asserts CSS, class names, or visual placement.
