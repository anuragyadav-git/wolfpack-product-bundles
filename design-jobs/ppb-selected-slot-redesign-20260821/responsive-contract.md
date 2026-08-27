---
schema_version: 1
id: ppb-selected-slot-responsive-contract
title: PPB Vertical Slot Responsive Contract
type: design-job-artifact
status: complete
summary: Defines Revision 4 one-column EB-parity behavior across PPB Vertical Slots viewports.
last_audited: 2026-08-24
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
  - vertical-slots
  - responsive-row
---

# Responsive Contract

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: complete

## Required viewports and container widths

| ID | Viewport | Purpose | Required states |
|---|---|---|---|
| VP-320 | 320x700 | narrow mobile stress | empty, filled, long title, remove |
| VP-390 | 390x844 | exact live EB mobile target | empty, two filled, capacity, no overflow |
| VP-767 | 767x900 | final mobile picker boundary | picker round trip and focus return |
| VP-768 | 768x900 | first desktop picker boundary | picker round trip and focus return |
| VP-1280 | 1280x800 | exact live EB desktop target | empty, two filled, capacity, no overflow |

The actual product-information container width is authoritative. The Vertical list always fills that owner and never infers full viewport width.

## Region transformations

| Region | Width | Height | Internal layout | Spacing | Overflow |
|---|---|---|---|---|---|
| Step list | 100% | content-driven | one column | 26px between step groups | none |
| Filled-row list | 100% | content-driven | one column | 14px at mobile target; 16px at desktop target | none |
| Filled row | 100% | 64px target; may grow for high zoom | 50px media, flexible title, trailing action | 5px padding and 5px internal gap | title truncates; action does not shrink |
| Empty row | 100% | 60px target; may grow for high zoom/localization | label at start, plus at end | balanced inline padding | label truncates/wraps only when accessibility requires |
| Media | 50px square | 50px | existing product-image fit policy | none | no distortion |
| Remove/add action | compact visible icon inside semantic target | semantic target at least 44px where current markup permits | trailing alignment | no overlap | focus ring remains visible |

## Responsive invariants

- At 390 and 1280, measured target geometry remains 64px filled and 60px empty.
- At 320, the title track shrinks before media or the semantic action target; one-line visual truncation is allowed.
- At 767 and 768, only the existing picker presentation boundary changes. Slot anatomy does not.
- At 200% and 400% zoom, rows may grow vertically instead of clipping text or focus.
- `document.scrollWidth === document.clientWidth` at every required viewport.
- Horizontal Slots, Product Grid, Product List, FPB, and picker product cards remain unchanged.
