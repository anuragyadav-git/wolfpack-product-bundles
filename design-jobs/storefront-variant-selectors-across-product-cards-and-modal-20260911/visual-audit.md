---
schema_version: 1
id: storefront-design-director-visual-audit-template
title: Visual Audit Template
type: design-job-template
status: active
summary: Records confidence-labeled current, target, and gap observations for a storefront component.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/visual-audit.md
related_docs:
  - .agents/skills/storefront-design-director/references/visual-analysis-rubric.md
tags:
  - template
keywords:
  - visual-audit
  - confidence
---

# Visual Audit

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 2
Artifact status: complete

## Conditions

- Job ID and revision: `storefront-variant-selectors-across-product-cards-and-modal-20260911`, revision 2.
- Reference IDs: all six `current-*` records in `screenshot-inventory.yaml`.
- Viewports and states: FPB Standard card and product-details modal at 1280x800 and 580x844; PPB Grid card at 1280x800 and 580x844; single-variant, unselected card states only.
- Comparison limits: the captures are structural references, not exact selector or target references. No selector is rendered because the persisted products are single-variant. Chrome enforced a 580px inner-width minimum when 390x844 was requested. No target screenshot was supplied.

## Observations

| ID | Region | Dimension | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| VA-01 | All cards | Hierarchy | Image, product identity, price, and Add controls already compete for card space. | Variant controls occupy their own labeled block and never share the product-title, price, quantity, or Add-control row. | User requirement plus all card captures | High | Yes |
| VA-02 | FPB Standard card | Narrow geometry | At 580px viewport width the card itself remains compact while the sticky summary consumes the viewport bottom. | Selectors stay inside the card width, use intrinsic tracks, and do not overlap or push into the sticky summary. | `current-fpb-standard-card-single-variant-narrow-r1` | High | Yes |
| VA-03 | FPB product modal | Desktop composition | The dialog has a media column and a wider information/action column with clear vertical space between price and quantity. | Variant groups appear in the information column after product identity and before quantity, without changing the two-column shell. | `current-fpb-product-modal-single-variant-desktop-r1` | High | Yes |
| VA-04 | FPB product modal | Narrow composition | The modal becomes a single-column bottom sheet; image, title, price, description, and action stack vertically. | Variant groups join the normal document flow; no absolute positioning, clipped tray, or second horizontal scroller is introduced. | `current-fpb-product-modal-single-variant-narrow-r1` | Medium | Yes |
| VA-05 | PPB Grid card | Density | The desktop card is materially narrower than the FPB Standard card and already truncates a long product title. | Selector modes must adapt to the available card width without shrinking controls below a usable target or borrowing width from sibling cards. | `current-ppb-grid-card-single-variant-desktop-r1` | High | Yes |
| VA-06 | PPB Grid card | Narrow behavior | The narrow capture shows one card plus sticky cart actions; the card and footer are independent layout regions. | Selector height is content-driven at initial render, while selection/focus/hover state changes preserve its footprint and do not displace sticky actions. | `current-ppb-grid-card-single-variant-narrow-r1` plus repository card-height contract | High | Yes |
| VA-07 | Selector state | Current geometry | No captured card or modal exposes dropdown, pill, color-swatch, or image-swatch geometry. | Exact dimensions, wrapping thresholds, and state styling must be recommendations until a multi-variant fixture is captured. | Inventory validation | High | Yes |
| VA-08 | Visual language | Target styling | No approved target visual exists. | Reuse the existing merchant design tokens and product-card visual language; do not introduce an unrelated branded control system. | Missing target evidence plus scope | High | Yes |
| VA-09 | PPB modes | Behavior | Four merchant-selected modes already exist and share one variant-selection contract. | Dropdown, pill, color-swatch, and image-swatch remain behavior-equivalent presentations; Shopify swatch fields remain authoritative. | Repository-observed behavior and validated Shopify contract | High | Yes |
| VA-10 | All same-row cards | Geometry stability | Equal-height cards and state-stable dimensions are existing invariants. | The tallest initial card content determines the row height; selected, unavailable, hover, and focus styles do not alter borders or dimensions. | Product Card Layout Contract | High | Yes |
| VA-11 | Non-dropdown modes | Accessibility | Selected and unavailable states cannot be assessed visually from current captures. | Each option remains a named radio choice with visible text or persistent selected label, disabled semantics, color-independent state, and a 44px target. | Component brief and repository behavior | High | Yes |
| VA-12 | Long and many values | Content stress | No stress fixture is currently rendered. | Values wrap through content-driven layout without page overflow, clipping, source-order changes, or hidden options. | User requirement and responsive storefront rule | Medium | Yes |

## Layout, geometry, typography, and surfaces

- Preserve each template's product-card shell. The selector is a dedicated content block between product identity/price and quantity or Add actions, rather than an overlay or a control squeezed into another row.
- Dropdown mode should consume the available inline width and keep native select behavior. It must use the card's existing typography, border, radius, and focus tokens.
- Pill and swatch modes need intrinsic, content-driven tracks. Short values may share a row; long values receive more width or a full row. No fixed pixel card width, runtime DOM style injection, absolute positioning, or selector-specific card transform is appropriate.
- Image swatches preserve their media aspect and label relationship. Color swatches include a persistent selected-value label; missing Shopify swatch media uses the existing neutral labeled presentation.
- Initial card height may grow to accommodate the configured product's actual option content, and same-row cards must stretch to the same height. Interaction states must not change that computed footprint.
- Modal surfaces use the same selector semantics and state language at a more relaxed density. Desktop retains the current media/details columns; narrow sheets use a single normal-flow stack.

## Content, interaction, responsive, and accessibility

- Keep option group labels visible. Multiple option dimensions appear as separate groups in Shopify option order.
- Variant selection continues to update the existing active variant, product media, market price, availability, and inventory feedback through delegated handlers. The redesign owns presentation only.
- Unavailable values remain visible but disabled. Selection is communicated by more than color and never depends on hover-only information.
- All modes remain keyboard completable. Dropdowns retain native semantics; pills and swatches retain one named radio group per option and visible focus.
- Responsive behavior is reflow, not scaling: card selectors wrap into intrinsic rows, modal selectors use the wider available region, and no viewport receives a miniaturized desktop control.
- Final acceptance must cover long labels, many values, multiple option dimensions, missing swatches, unavailable values, selected/unselected cards, market-formatted prices, and adjacent quantity/Add controls.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| GAP-01 | Data | Persist multi-variant FPB and PPB fixtures, including canonical Shopify swatches. | Shopify product, variant, and availability data remain authoritative. | Existing configure save flow and storefront hydration owners | Open fixture blocker |
| GAP-02 | Visual | Establish one shared state hierarchy for dropdowns, pills, color swatches, and image swatches. | Merchant-selected PPB mode and existing FPB mode selection remain unchanged. | Existing shared FPB and PPB selector owners plus template CSS | Direction needed |
| GAP-03 | Responsive | Replace congested/fixed selector sizing with intrinsic wrapping appropriate to each card and modal. | Product-card shells and sticky actions remain owned by their templates. | Existing raw template CSS files | Direction needed |
| GAP-04 | Accessibility | Prove labels, radio/select semantics, disabled states, persistent selected labels, targets, and focus. | Existing selection events and cart behavior remain unchanged. | Existing selector renderers | QA required |
| GAP-05 | Ownership | Keep common state presentation shared while allowing card-density tokens to be template-owned. | No generic cross-widget runtime or new compatibility layer. | Existing shared selector files and current template CSS boundaries | Direction needed |
| GAP-06 | Evidence | Capture all modes/templates and an actual 390x844 viewport after implementation. | Direct Chrome DevTools, Agent store, cache-bypassed signed previews only. | Design-job browser plan | Open QA blocker |
