---
schema_version: 1
id: ppb-selected-slot-accessibility-checklist
title: PPB Selected Slot Accessibility Checklist
type: design-job-artifact
status: complete
summary: Defines Revision 4 accessibility requirements for PPB Vertical Slots empty and filled rows.
last_audited: 2026-08-24
owners:
  - wolfpack
domains:
  - accessibility
systems:
  - product-page-bundle
source_paths:
  - design-jobs/ppb-selected-slot-redesign-20260821/interaction-contract.md
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/responsive-contract.md
tags:
  - ppb
  - accessibility
keywords:
  - keyboard
  - focus
---

# Accessibility Checklist

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: complete

- [x] Replacement, removal, and empty-slot activation have distinct semantic owners and accessible names.
- [x] Selected, included, unavailable, disabled, busy, and locked states are defined without color-only reliance.
- [x] Keyboard-only replacement and removal are defined in logical slot order.
- [x] Focus-visible treatment is required to remain visible and unclipped on every surface.
- [x] Picker focus returns to the exact invoking slot.
- [x] Remove focus recovery is deterministic after DOM updates.
- [x] Product identity remains available to assistive technology when visual text clamps.
- [x] Price and variant remain outside the Vertical row, matching the target without removing them from their existing owners.
- [x] Image alternative text remains product-derived; decorative placeholder decoration is not redundantly announced.
- [x] Every interactive target has a minimum 44px hit area.
- [x] High zoom permits vertical growth rather than overlap or horizontal scrolling.
- [x] Reduced motion removes decorative transitions without hiding state feedback.
- [x] Nested controls are not implemented as invalid button-inside-button semantics.
- [ ] Fresh accessibility-tree snapshots confirm names, roles, and state after implementation.
- [ ] Keyboard-only Chrome pass confirms replacement, removal, picker dismissal, and focus return.
- [ ] Automated accessibility findings are manually triaged after implementation.

## Known risks, browser evidence, and validation status

- Current filled slots use a focusable wrapper with an independent nested remove button. Implementation must preserve valid non-nested interactive semantics.
- A visually clamped title must not become the only accessible name source if it is truncated.
- Unavailable restored state needs a perceivable status supplied by existing product data; do not infer merchant-facing copy.
- The compact visible remove icon must not reduce its semantic target or focus visibility.
- Design status: complete for Revision 4.
- Browser validation status: pending implementation at 320x700, 390x844, 767x900, 768x900, and 1280x800.
