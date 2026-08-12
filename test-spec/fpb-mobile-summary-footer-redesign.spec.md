---
schema_version: 1
id: fpb-mobile-summary-footer-redesign
title: FPB Mobile Summary Footer Redesign Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for the shared docked FPB mobile summary footer and modal review sheet.
last_audited: 2026-08-12
owners:
  - Aditya Awasthi
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/full-page/methods/mobile-summary-methods.ts
  - app/assets/widgets/full-page/methods/responsive-layout-methods.ts
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - fpb
  - mobile-summary
keywords:
  - bottom-sheet
  - swipe-dismissal
---

# Test Spec: FPB Mobile Summary Footer Redesign

**Spec ID:** fpb-mobile-summary-footer-redesign  **Created:** 2026-08-12

## Purpose

Verify the shared FPB mobile footer opens an accessible modal review sheet,
preserves existing bundle actions, and dismisses predictably by explicit and
gesture-driven paths across every FPB preset.

## Test Cases

### MobileSummaryFooter

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Open review sheet | Collapsed footer trigger | Dialog opens, page scrolling locks, and expanded state is exposed | Shared by all presets |
| 2 | Explicit dismissal | Backdrop, Escape, or trigger | Dialog closes, scroll lock clears, and focus returns to trigger | No separate close control is rendered |
| 3 | Swipe dismissal | Downward drag above distance threshold or velocity threshold | Dialog closes | Gesture starts from handle only |
| 4 | Cancelled gesture | Short, slow, or primarily horizontal drag | Dialog remains open | Sheet returns to rest position |
| 5 | Responsive cleanup | Open sheet changes to sidebar mode | Dialog closes and scroll lock clears | Desktop sidebar remains authoritative |
| 6 | Static offer state | Eligible and locked add-on tiers coexist | Stable offer status is returned without timers | No temporary count replacement |
| 7 | Selection update | Sheet is open and products change | Open state and product-list scroll position are restored | Shell stays connected |
| 8 | Existing actions | Next, add to cart, clear, remove, BQO, slots | Existing validation and action paths remain unchanged | No duplicate submissions |

## Acceptance Criteria

- [ ] All listed behavior tests pass.
- [ ] No tests assert CSS, class names, or visual placement.
- [ ] All four FPB presets use the shared disclosure behavior.
- [ ] Reduced motion does not delay access to the final state.
