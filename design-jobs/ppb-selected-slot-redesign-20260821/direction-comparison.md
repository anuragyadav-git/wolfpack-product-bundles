---
schema_version: 1
id: ppb-selected-slot-redesign-direction-comparison
title: PPB Selected Slot Direction Comparison
type: design-job-artifact
status: draft
summary: Records the user-directed Revision 4 EB-parity direction for PPB Vertical Slots.
last_audited: 2026-08-24
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - design-jobs/ppb-selected-slot-redesign-20260821/visual-audit.md
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - ppb
  - design-direction
keywords:
  - selected-slot
  - direction-approval
---

# Direction Comparison

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: approved

## Shared functional requirements

- Revision 4 changes Vertical Slots only; Horizontal Slots and all other templates are non-regression surfaces.
- Vertical Slots continues to use the existing selection, replacement, removal, capacity, persistence, and cart runtime.
- The whole slot owns exact replacement; one separate semantic remove control owns removal.
- The visible filled-row content is limited to media, one product-title line, and remove. Price and variant are not added.
- Empty and filled rows intentionally match EB's measured 60px and 64px heights.
- Fixed values are permitted here because the same compact primitives were measured at both target viewports; owner width remains fluid.
- No new storefront copy, configuration, runtime styling, `!important`, or competitor identifiers.

## Revision 4 direction — Live EB Vertical Row

- Visual thesis: Copy the live EB Vertical Slots row rather than reinterpret it as a richer product summary.
- Filled anatomy: 64px full-width white row; 5px internal padding; 50px square media; one bold single-line product title; compact trailing remove affordance; 2px solid dark border; 10px radius; no shadow.
- Empty anatomy: 60px full-width white row; saved label at start; plus affordance at end; 2px dashed dark border; 10px radius.
- Repetition: one column; 14px mobile and 16px desktop row gap; 26px between step groups.
- Responsive behavior: the containing width is fluid while row heights and primitives remain stable at 390px and 1280px.
- Accessibility translation: visible icons may match EB's compact scale, while Wolfpack preserves distinct semantic controls, complete accessible names, visible focus, and at least 44px interactive ownership where required.

No alternate direction is produced for Revision 4 because the user requested one controlled revision copied from EB. Earlier Directions A-C remain historical Revision 1 evidence and are superseded for the Vertical Slots component boundary only.

## Recommendation and decision

- Selected direction: **Live EB Vertical Row**
- Approved by and at: user instruction, 2026-08-24
- Evidence IDs: `EB-VS-DESKTOP-R4`, `EB-VS-MOBILE-R4`, `WPB-VS-DESKTOP-001`, `WPB-VS-MOBILE-001`
- Superseded Revision 2 requirement: Horizontal Slots participation, equal empty/filled height, variant output, and price output.
