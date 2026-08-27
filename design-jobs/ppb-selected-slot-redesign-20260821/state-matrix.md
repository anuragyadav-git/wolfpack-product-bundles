---
schema_version: 1
id: ppb-selected-slot-state-matrix
title: PPB Vertical Slot State Matrix
type: design-job-artifact
status: complete
summary: Defines Revision 4 behavior and visual states for PPB Vertical Slots rows.
last_audited: 2026-08-24
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/component-anatomy.md
tags:
  - ppb
  - states
keywords:
  - vertical-slots
  - selected-slot
---

# State Matrix

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: complete

| State ID | Trigger | Visible result | Interaction and accessibility | Desktop and mobile contract | Approval |
|---|---|---|---|---|---|
| ST-01 | Capacity exposes an empty instance | 60px white row, 2px dashed dark border, 10px radius, saved label at start, plus affordance at end | Opens picker without replacement target; complete accessible name and visible focus | Full containing width at every required viewport | approved R4 |
| ST-02 | Valid selection fills a slot | 64px white row, 2px solid dark border, 10px radius, 50px media, one bold title line, trailing remove | Row opens exact replacement; remove affects only exact instance | Identical anatomy at 390 and 1280 | approved R4 |
| ST-03 | Pointer hover | No geometry change; only restrained affordance feedback | Hover is never required to discover or use an action | Pointer-capable viewports only | approved R4 |
| ST-04 | Keyboard focus | Visible focus on the replacement or remove owner without clipping | Enter/Space activates only the focused action | Hardware-keyboard behavior remains valid at all widths | approved R4 |
| ST-05 | Long title | Title stays one visual line and truncates within the flexible track | Complete product name remains the accessible name | Remove target and media never shrink or overlap | approved R4 |
| ST-06 | Missing or loading image | Existing fallback occupies the same 50px media track | Row remains identifiable and operable; loading does not retarget | No row-width or sibling shift | approved R4 |
| ST-07 | Restored unavailable selection | Existing unavailable treatment remains, using the same compact row shell | Remove and allowed replacement remain reachable; state is not color-only | Stable after hard reload | existing behavior |
| ST-08 | Minimum reached with additional capacity | Filled rows followed by one reachable empty row | Empty row opens picker; logical order follows slot order | 14px mobile / 16px desktop row rhythm | existing behavior |
| ST-09 | Exact capacity reached | Filled rows only; no overflow empty row | No hidden focusable extra slot | One-column list remains stable | existing behavior |
| ST-10 | Remove activated | Exact filled row disappears and capacity-derived empty row recomputes | Remove does not open picker; focus returns to same-index recovery owner when available | No unrelated selection changes | existing behavior |
| ST-11 | Non-removable included product | Same filled-row shell with existing included status; remove absent | Non-interactive state is not falsely focusable | Same row geometry unless existing status content requires accessible growth | existing behavior |
| ST-12 | Reduced motion or 200%+ zoom | No required motion; row may grow only when text reflow is needed for accessibility | All controls remain reachable in logical order | No horizontal overflow at required widths | approved R4 |

## Explicit exclusions

- No price, compare-at price, variant, quantity control, badge, or new merchant copy inside the Vertical slot row.
- No Horizontal Slots changes.
- No drag reorder, slot-owned scrolling, or new error surface.

## Coverage

- Required applicable states: 12
- Covered: 12
- Missing: 0
- Status: complete
