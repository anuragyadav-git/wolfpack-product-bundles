---
schema_version: 1
id: ppb-selected-slot-responsive-contract
title: PPB Selected Slot Responsive Contract
type: design-job-artifact
status: complete
summary: Defines content-driven selected-slot transformations across required PPB viewport and container widths.
last_audited: 2026-08-21
owners:
  - wolfpack
domains:
  - responsive-design
systems:
  - product-page-bundle
source_paths:
  - app/assets/widgets/product-page-css/templates/modal-slots.css
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/state-matrix.md
tags:
  - ppb
  - responsive
keywords:
  - horizontal-slots
  - vertical-slots
---

# Responsive Contract

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 2
Artifact status: approved

## Required viewports and container widths

| ID | Width | Height | Placement width | Purpose | Required states |
|---|---:|---:|---|---|---|
| VP-320 | 320 | 700 | Actual widget owner after theme gutters | Narrow mobile stress | empty, filled, long identity, compare-at, missing image |
| VP-390 | 390 | 844 | Actual widget owner after theme gutters | Primary mobile | empty, filled, replacement, removal, minimum/exact capacity |
| VP-767 | 767 | 900 | Actual product-information column | Final mobile overlay boundary | filled, picker round trip, focus return |
| VP-768 | 768 | 900 | Actual product-information column | First desktop overlay boundary | filled, picker round trip, focus return |
| VP-1280 | 1280 | 800 | Theme product-information column, not full viewport | Desktop | empty, multi-filled, long identity, compare-at, unavailable restored |

Container widths are authoritative. Viewport width alone must not set Horizontal column count.

## Region transformations

| Region | Range | Size | Layout | Order | Visibility or replacement | Scroll | Sticky or fixed | Text and image | Controls and spacing | Safe area | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| SS-GRID Horizontal | All | 100% of owner; columns use auto-fit with a semantic minimum-tile token and flexible remainder | Equal-height tile grid | DOM order | No replacement | None | None | N/A | Fluid gap token | N/A | Fewer columns before content collision; never horizontal scroll |
| SS-GRID Vertical | All | 100% of owner | One full-width row per instance | DOM order | No replacement | None | None | N/A | Fluid row gap | N/A | No horizontal scroll |
| SS-FILLED Horizontal | All | Fill grid track; selected and empty share responsive minimum block size and equal auto-row behavior | Media over identity/price | media, identity, price; remove overlays media corner | No hidden identity replacement | None | None | Square media; title max two lines; variant max one; prices stay inside owner | Fluid internal spacing; 44px action target | N/A | Content clamps; card may grow only when accessibility zoom requires it |
| SS-FILLED Vertical | All | Full width; content-driven block size with shared minimum equal to empty row | Leading media, flexible identity/price, trailing remove | media, identity, price, remove | No replacement | None | None | Square thumbnail; title max two lines; variant/price wrap within text track | Fluid padding/gap; 44px trailing target | N/A | Text track uses minmax(0,1fr); action never shrinks |
| SS-EMPTY | All | Same outer track and minimum geometry as filled counterpart | Existing visual and saved label | Existing order | No new copy | None | None | Configured media fits without distortion | Same outer padding scale as filled | N/A | No overflow |
| SS-PRICE | All | Intrinsic inside identity owner | Payable then compare-at | Logical reading order | Compare-at omitted only when data is absent or not greater | None | None | Currency may wrap as a group only when required by zoom | Compact inline gap | N/A | Never overlaps remove |
| SS-REMOVE | All | 44px interactive box around compact visible icon | Media-corner Horizontal; trailing Vertical | After replacement target in focus order | Hidden only for non-removable states | None | None | N/A | Fixed hit-target primitive; visible icon may be smaller | N/A | Must remain inside slot and not clip focus |

## Width-specific outcomes

- At VP-320, Horizontal resolves to the greatest viable column count that preserves the approved identity and price regions; reducing columns is preferred over shrinking text or actions.
- At VP-390, Horizontal is expected to support two readable tiles for the measured theme owner. This is a recommendation to validate in Chrome, not a screenshot fact.
- At VP-767 and VP-768, the slot anatomy and orientation do not change. Only the existing picker presentation boundary changes.
- At VP-1280, the product-information column remains the containing block. The grid must not infer that the full viewport is available.
- Vertical remains one column at every required width.

## Critical boundaries

Test 767px, 768px, and the actual container width immediately before and after Horizontal adds or removes a column. Column transitions must produce:

- no same-row height delta between empty and filled slots;
- no focus loss or replacement-target change;
- no horizontal overflow;
- no orphaned price or action;
- no unexpected title re-expansion.

## Orientation, high zoom, and opposite-viewport non-regression

- Portrait/landscape rotation recomputes intrinsic columns without changing selection state.
- At 200% and 400% zoom, cards may grow vertically; content and controls must not overlap or become unreachable.
- Reduced motion removes decorative transitions without changing feedback.
- Horizontal never becomes the Vertical row component, and Vertical never becomes a tile grid.
- FPB and PPB Product List/Grid presentation remain outside this selector and ownership boundary.
- Safe-area padding remains owned by the surrounding picker/footer, not individual slots.
