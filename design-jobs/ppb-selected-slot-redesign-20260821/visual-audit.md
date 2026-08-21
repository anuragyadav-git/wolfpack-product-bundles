---
schema_version: 1
id: ppb-selected-slot-redesign-visual-audit
title: PPB Selected Slot Visual Audit
type: design-job-artifact
status: complete
summary: Records measured current-state gaps and EB-inspired structural targets for PPB selected slots.
last_audited: 2026-08-21
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
Artifact revision: 2
Artifact status: complete

## Conditions

- Reference IDs: `EB-DOC-HS-001`, `EB-DOC-VS-001`, `WPB-HS-MOBILE-001`, `WPB-HS-DESKTOP-001`, `WPB-VS-MOBILE-001`, `WPB-VS-DESKTOP-001`
- Current viewports and states: 390x844 and 1280x800; one restored filled selection and one empty next-step slot
- Served asset: `window.__BUNDLE_WIDGET_VERSION__ === "12.1.1"`
- Fixture discipline: Product Grid → Horizontal Slots → Vertical Slots → Product Grid; compatible selection state carried forward
- Comparison limit: EB evidence establishes hierarchy, density, and orientation behavior. It is not a current pixel baseline.

## Observations

| ID | Region | Dimension | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| O-01 | Horizontal filled slot | Geometry | Three equal columns; selected tile measured about 109x200 at 390 and 113x200 at 1280 | Responsive equal-height tile whose content remains legible at every viable column width | Chrome computed geometry + EB structural archive | High current / medium target | Yes |
| O-02 | Horizontal identity | Hierarchy | Image dominates; title is isolated in a short footer and truncates to `14k Dan...`; variant and price are absent | Media, two-line identity, optional variant, and price form one product-led stack | Chrome visual + EB hierarchy | High | Yes |
| O-03 | Horizontal actions | Interaction | Whole card is the replacement target; remove is a separate circular control over media | Preserve exact replacement target and one independent semantic remove action | Accessibility tree + repository contract | High | Yes |
| O-04 | Vertical filled slot | Geometry | Full-width 64px row at both measured widths; 52px media track, flexible text, trailing action | Retain compact full-width row and improve breathing room through responsive spacing, not a fixed copied height | Chrome computed geometry + EB structural archive | High | Yes |
| O-05 | Vertical identity | Hierarchy | Image → one-line title → remove; no variant or price | Image → title/variant stack → price when available → remove, with bounded wrapping | Chrome visual + EB hierarchy | High | Yes |
| O-06 | State continuity | Layout stability | Empty and selected slot geometry is orientation-specific; current Horizontal preserves height but sacrifices identity | Empty, loading, unavailable-restored, and selected states reserve identical outer geometry within each orientation | Repository architecture contract | High | Yes |
| O-07 | Selection treatment | Surface | Saturated blue 2px outline is the dominant selected signal | Quiet neutral hairline surface; merchant color reserved for focus/selected confirmation and not the only signal | Current computed style + design goal | Medium | Yes |
| O-08 | Narrow widths | Responsive | Horizontal tile remains three columns at 390, compressing text | Use intrinsic responsive tracks and allow fewer columns only when content cannot remain legible | Current geometry + required viewport contract | High | Yes |
| O-09 | Accessibility | Targets and naming | Filled slot exposes replacement target and nested semantic remove button | Keep 44px target ownership, visible focus, exact accessible names, and no action overlap | Accessibility tree + user contract | High | Yes |
| O-10 | Overflow | Page shell | No horizontal overflow at measured Vertical mobile; Horizontal grid fits its owner | `document.scrollWidth === document.clientWidth` at every required viewport | Chrome geometry + acceptance contract | High | Yes |

## Layout, geometry, typography, and surfaces

The strongest reusable pattern is the orientation logic. Horizontal Slots should remain an at-a-glance tile grid, while Vertical Slots should remain a compact full-width list. Both need the same information priority and action semantics.

Horizontal currently allocates nearly all usable height to media and a one-line title footer. That makes the selected state recognizable by image but weak for long-title, variant, and price verification. The redesign should rebalance the existing tile rather than add badges or extra controls: a stable media region, a bounded identity stack, and one remove primitive.

Vertical already has the correct structural base. Its redesign should be restrained: preserve the compact row, add a bounded secondary line for variant or price, refine neutral borders, and keep the remove action visually separate from the replacement surface.

## Content, interaction, responsive, and accessibility

- Tile or row activation replaces the exact clicked slot.
- Remove never activates replacement and removes only that slot.
- No new merchant-facing copy is introduced; saved slot labels and numbering remain authoritative.
- Price is shown when the existing slot data supplies it. Compare-at price follows the product-driven display rule and is not gated by a separate PPB setting.
- Long title and variant content clamp inside the identity region; actions never shrink below their target contract.
- Minimum-rule capacity keeps one reachable empty slot; exact-rule capacity exposes no overflow slot.
- Restored unavailable selections remain identifiable and removable without changing persistence behavior.
- Selected and empty outer geometry must not shift siblings in the same orientation.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| G-01 | visual | Rebalance Horizontal media and identity hierarchy | Exact slot replacement/removal | PPB product-page source CSS | confirmed |
| G-02 | responsive | Replace compressed fixed three-column outcome with intrinsic viable columns | Horizontal orientation remains tile-based | PPB product-page source CSS | confirmed |
| G-03 | content | Reserve title, variant, price, and compare-at capacity | Existing data and localization only | Existing shared slot renderer + CSS | confirmed |
| G-04 | visual | Refine Vertical row spacing and surface treatment | Compact full-width row | PPB product-page source CSS | confirmed |
| G-05 | accessibility | Protect action hit targets, focus, and nested action separation | Current data/action hooks | Existing shared slot renderer | confirmed |
| G-06 | ownership | Keep both orientations on one runtime with presentation-only variants | Shared picker and persistence | Shared PPB slots runtime | confirmed |
