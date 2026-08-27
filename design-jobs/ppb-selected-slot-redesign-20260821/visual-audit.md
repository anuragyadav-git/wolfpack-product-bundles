---
schema_version: 1
id: ppb-selected-slot-redesign-visual-audit
title: PPB Selected Slot Visual Audit
type: design-job-artifact
status: complete
summary: Records live measured EB targets for Revision 4 of PPB Vertical Slots empty and filled rows.
last_audited: 2026-08-24
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - design-jobs/ppb-selected-slot-redesign-20260821/screenshot-inventory.yaml
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - ppb
  - slots
keywords:
  - selected-slot
  - horizontal-slots
  - vertical-slots
---

# Visual Audit

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: complete

## Conditions

- Reference IDs: `EB-VS-DESKTOP-R4`, `EB-VS-MOBILE-R4`, `WPB-VS-MOBILE-001`, `WPB-VS-DESKTOP-001`
- Target viewports and states: live EB at 1280x800 and 390x844; two filled rows, a minimum-rule trailing empty row, and the next-step empty row
- Target runtime: `gbbmix-template-id="SIMPLIFIED"`, `gbbmix-template-type="PDP_MODAL"`
- Fixture discipline: the existing EB fixture moved from Horizontal Slots to Vertical Slots without resetting compatible step/category data; no order or cart mutation occurred
- Comparison limit: exact visual parity applies to the visible row anatomy and measured geometry. Wolfpack retains its own semantic markup, event owners, tokens, and accessible target requirements.

## Observations

| ID | Region | Dimension | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| O-01 | Filled row | Geometry | Wolfpack current compact row | EB row is 64px high at both measured widths, full owner width, with 5px padding and 5px internal gap | Live Chrome computed geometry | High | Yes |
| O-02 | Filled media | Geometry | Wolfpack media treatment differs from target | EB uses a 50x50 leading image inside the 64px row | Live Chrome computed geometry | High | Yes |
| O-03 | Filled identity | Hierarchy | Current Wolfpack selected-row hierarchy | EB shows one bold product-title line only; price and variant are absent from the row | Live Chrome visual and computed typography | High | Yes |
| O-04 | Filled action | Interaction | Existing exact remove behavior | EB places one compact trailing remove icon; Wolfpack must retain a distinct semantic remove target without changing the visible hierarchy | Live Chrome visual + repository contract | High | Yes |
| O-05 | Filled surface | Surface | Current border and radius differ | EB uses white fill, 2px solid black border, 10px radius, and no shadow | Live Chrome computed style | High | Yes |
| O-06 | Empty row | Geometry | Current empty state differs from target | EB uses a 60px row, 2px dashed black border, 10px radius, label at start and plus affordance at end | Live Chrome computed style | High | Yes |
| O-07 | Repeated spacing | Layout | Current slot rhythm differs | EB uses a 14px mobile / 16px desktop gap between rows and 26px between step groups | Live Chrome computed style | High | Yes |
| O-08 | Responsive | Reflow | Existing Vertical one-column behavior | EB retains identical 64px/60px row geometry at 390 and 1280; width fills the containing column and no horizontal overflow occurs | Live Chrome desktop/mobile evidence | High | Yes |
| O-09 | Content stress | Overflow | Long product or localized slot text may collide | Preserve EB one-line visual density using truncation/clamping while keeping the complete accessible name | Live target + accessibility recommendation | High visual / medium accessibility | Yes |
| O-10 | Business behavior | Interaction | Exact replacement/removal and capacity are Wolfpack-owned | Visual parity must not change picker targeting, remove propagation, persistence, rules, or cart behavior | Repository contract | High | Yes |

## Layout, geometry, typography, and surfaces

Revision 4 is Vertical Slots only. The target is deliberately sparse: a compact full-width row, square product media, one bold title, and one remove affordance. Price, compare-at price, variant, badges, quantity, and slot-number embellishments are excluded because they are not present in the live EB row.

The empty and filled states are visually related but intentionally not equal-height: EB uses 60px empty rows and 64px filled rows. Revision 4 therefore supersedes the earlier equal-geometry requirement. Layout stability is evaluated as no unexpected shift outside the deliberate 4px state transition and no sibling overlap.

## Content, interaction, responsive, and accessibility

- Tile or row activation replaces the exact clicked slot.
- Remove never activates replacement and removes only that slot.
- No new merchant-facing copy is introduced; saved slot labels and numbering remain authoritative.
- Price and variant remain in the picker/summary owners and do not render inside the Vertical slot row.
- Long product titles remain one visual line with overflow handling; the complete accessible name remains available to assistive technology.
- Minimum-rule capacity keeps one reachable empty slot; exact-rule capacity exposes no overflow slot.
- Restored unavailable selections remain identifiable and removable without changing persistence behavior.
- Selected and empty outer geometry must not shift siblings in the same orientation.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| G-01 | visual | Match the measured 64px filled-row anatomy | Exact slot replacement/removal | PPB modal-slot renderer and canonical CSS | confirmed |
| G-02 | visual | Match the measured 60px dashed empty row | Existing capacity and picker opening | PPB modal-slot template and canonical CSS | confirmed |
| G-03 | content | Remove price/variant from the Revision 4 slot contract | Product data remains available elsewhere | Existing shared renderer | confirmed |
| G-04 | responsive | Keep one full-width column at all required widths | No layout-mode switch | PPB modal-slot CSS | confirmed |
| G-05 | accessibility | Preserve semantic 44px action ownership behind compact visible icons | Existing data/action hooks | Existing shared renderer | confirmed |
| G-06 | non-regression | Exclude Horizontal Slots and other templates | Shared runtime remains intact | Scoped Vertical selectors | confirmed |
