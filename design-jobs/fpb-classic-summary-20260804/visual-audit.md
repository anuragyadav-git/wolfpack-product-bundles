---
schema_version: 1
id: fpb-classic-summary-visual-audit
title: FPB Classic Summary Visual Audit
type: design-evidence
status: complete
summary: Compares the Agent FPB Classic desktop and mobile summary experience with the Yash-wolfpack EB Classic desktop inspiration.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-classic-summary-20260804/references/current
  - design-jobs/fpb-classic-summary-20260804/references/target
related_docs:
  - .agents/skills/storefront-design-director/references/visual-analysis-rubric.md
tags:
  - fpb
  - classic
  - summary
keywords:
  - visual-audit
  - confidence
---

# Visual Audit

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: complete

## Conditions

- Job ID and revision: fpb-classic-summary-20260804, revision 1.
- Reference IDs: ref-current-desktop-001, ref-current-mobile-001, ref-target-desktop-001.
- Viewports and states: current desktop 1440x900 partially filled with the first two products; current mobile 390x844 in the same state; target desktop 1440x900 in the same state. Browser zoom 100%, DPR 1.
- Comparison limits: the target is inspiration, not an exact geometry contract. Desktop geometry is directly comparable. No target mobile image was requested, so mobile recommendations must preserve current behavior and translate the approved desktop hierarchy rather than imitate unobserved EB behavior.

## Observations

| ID | Region | Dimension | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| VA-001 | Desktop shell | Column ownership | Product region 952.7px plus 408.3px sticky summary inside a 1381px grid with 20px gap. | Product grid 873.9px plus 413.9px sticky summary inside a 1348.8px grid with 15px gap. | Live bounding rectangles at 1440x900 | High | Preserve two-column ownership and sticky summary. |
| VA-002 | Desktop summary | Surface | White 408.3px card, 20px padding, 10px radius, 410.8px tall for two items. | White 413.9px card, 20px padding, 10px radius, 495.8px tall for two items. | Computed style | High | Retain the current token family; increase internal breathing room through structure, not copied height. |
| VA-003 | Summary header | Hierarchy | 25/30px, weight 700; long fixture title wraps to two lines and competes with Clear. | Concise “Your Bundle” at 25/30px, weight 700; subtitle and count form a clean vertical stack. | Screenshot plus computed style | High | Separate merchant title from summary purpose so long names do not dominate the task hierarchy. |
| VA-004 | Clear action | Placement | 87.5x36px at the header edge; visible pink recovery action. | Recovery action is visually quieter but remains at the top right. | Screenshot and bounding rectangle | High | Keep top-right recovery placement and explicit label. |
| VA-005 | Selected rows | Density | Two 337.3x82px bordered rows, 8px padding, 10px internal gap, 8px list gap. Titles truncate in the desktop capture. | Two looser, borderless rows with larger title/price separation and more surrounding whitespace. | Screenshot plus computed style | High | Reduce container chrome and make product identity, price, quantity, and remove action scan as one row. |
| VA-006 | Total and CTA | Composition | Total and 184.2x41px CTA share one compact row; total visually collides with the button at the captured width. | Total is a left block and CTA a larger 187x66px right block after a full-width divider. | Screenshot plus bounding rectangle | High | Introduce a stable action footer with divider, independent total block, and robust CTA minimum width. |
| VA-007 | Product/summary balance | Visual hierarchy | Product cards dominate through larger 223x446px geometry while the summary is dense and short. | Cards are 207x307px; summary occupies more vertical attention and better supports review before completion. | Comparable desktop screenshots | High | Raise summary task prominence without changing grid business behavior. |
| VA-008 | Mobile tray | Collapsed geometry | Sticky 370x68px tray at x10, bottom of 390px viewport; 5px padding; z-index 9999. | No target mobile evidence. | Computed style | High | Preserve a compact collapsed replacement, safe-area padding, and product-page visibility. |
| VA-009 | Mobile tray | Expanded behavior | “Review your bundle” is an expandable button with aria-expanded; expanded tray measured 370x176px for two items and owns vertical overflow. | No target mobile evidence. | Accessibility tree and computed style | High | Keep explicit disclosure semantics, internal scrolling, and a persistent completion action. |
| VA-010 | Add controls | Semantics | Current product actions appear as named buttons (“Add”) in the accessibility tree. | EB product add controls and summary actions are not exposed as buttons in the captured accessibility tree. | Accessibility snapshots | High | Preserve Wolfpack's semantic controls; visual inspiration must not import EB's semantic deficit. |
| VA-011 | Product selection | State visibility | Selected desktop/mobile cards gain a heavy black outline and quantity control; state is highly visible. | Selected cards also use a dark outline and quantity stepper. | Screenshots | High | Preserve non-color selection indication while refining border weight and focus separation. |
| VA-012 | Content stress | Long text | The fixture title wraps; selected product names truncate; mobile product titles wrap to three lines. | Target uses a short summary title and selected product names remain readable. | Screenshots | High | Define wrapping/clamping rules and accessible full names for long merchant and product copy. |

## Layout, geometry, typography, and surfaces

The strongest target lesson is not a pixel value; it is allocation of attention. Both products and summary retain their existing owners, but the target gives the review task a taller, calmer surface. Current Wolfpack already matches the target's 20px summary padding, 10px radius, sticky behavior, 25/30px title hierarchy, and two-column structure. The redesign should therefore adjust anatomy, row density, footer composition, and content hierarchy instead of introducing a new shell or copying a fixed target height.

Current desktop uses a wider product region and taller product cards. That is compatible with the scope. The summary should remain content-driven with intrinsic height and a bounded internal list for long selections. The target's larger apparent summary height is evidence for stronger review presence, not a 495.8px implementation constant.

## Content, interaction, responsive, and accessibility

Selection, quantity, pricing, compare-at display, removal, clear, validation, and cart behavior are invariants. The redesign may reorder their presentation but must not alter the underlying events or state.

On mobile, Wolfpack already provides the correct behavioral model: a compact sticky tray, an expandable review control, selected rows, clear, and a persistent total/CTA. The redesign should improve information order, target sizes, safe-area padding, and long-list scrolling while retaining the named disclosure state. It must not reproduce EB's inaccessible non-button controls.

Loading, empty, disabled, complete, discount-tier, variant, quantity-greater-than-one, and long-list states are not visible in the three reference screenshots. Their geometry must be specified from current semantics and verified later; exact visual claims about those states remain low confidence until state fixtures are exercised.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| GAP-001 | visual | Replace the dense desktop footer row with a divider, stable total block, and larger CTA region. | Pricing and CTA enablement. | Classic preset stylesheet. | direction input |
| GAP-002 | content | Establish “review” as the summary heading and demote long merchant bundle identity. | Merchant-configured copy remains available and accessible. | Shared summary renderer plus Classic presentation owner. | direction input |
| GAP-003 | visual | Simplify selected-row chrome and improve title, price, quantity, and remove alignment. | Selection and remove events. | Classic preset stylesheet; shared row renderer remains semantic owner. | direction input |
| GAP-004 | responsive | Treat mobile as a collapsed/expanded replacement with safe-area and bounded list scroll. | Same selected items, totals, validation, and CTA. | Existing mobile tray renderer and Classic mobile stylesheet. | direction input |
| GAP-005 | accessibility | Retain buttons, accessible names, aria-expanded, focus visibility, and non-color selection state. | Keyboard and touch completion. | Shared renderer/event owner plus focus styles in canonical CSS. | required |
| GAP-006 | ownership | Map exact shared, template, runtime, and token owners before handoff. | No sibling-template regression. | Repository evidence required. | deferred to COMPONENT_ANATOMY |
