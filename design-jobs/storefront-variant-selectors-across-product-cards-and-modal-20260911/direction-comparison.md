---
schema_version: 1
id: storefront-design-director-direction-comparison-template
title: Direction Comparison Template
type: design-job-template
status: active
summary: Compares behavior-equivalent design directions and records an explicit selection.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/direction-comparison.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/locked-decisions.yaml
tags:
  - template
keywords:
  - direction
  - approval
---

# Direction Comparison

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 4
Artifact status: approved

## Shared functional requirements

- Preserve the existing variant-selection, availability, pricing, inventory, image, quantity, and Add behavior.
- Use the existing category-selected dropdown, pill, color-swatch, or image-swatch mode in both FPB and PPB.
- Use Shopify `ProductOptionValue.swatch` as the only swatch source; missing swatches remain neutral and labeled.
- Show every option value without clipping or page-level overflow. Long values, many values, multiple dimensions, unavailable values, and market-formatted prices must remain readable.
- Keep each selector in a dedicated content region. Same-row cards remain equal height and selection, hover, focus, and unavailable states cannot change geometry.
- Retain native select semantics for dropdowns and named radio groups for non-dropdown modes, with visible focus, disabled semantics, color-independent selection, and 44px targets.
- Preserve each template's product-card shell, sticky actions, FPB product-details modal, and PPB picker-modal ownership.

## Direction A — Adaptive intrinsic matrix

- Artifact and revision: Textual direction A, revision 1.
- Visual thesis: Give every option group a quiet labeled block; let pills and swatches reflow through intrinsic CSS grid tracks that respond to the actual card width, while dropdowns fill the available width. Shared state styling makes the modes recognizable; each template owns only density and alignment.
- Strengths: Uses normal document flow; exposes every value; avoids horizontal scrolling, clipping, absolute positioning, and runtime measurement; accommodates long labels without shrinking targets; works in cards and modals; aligns with responsive storefront CSS rules; requires no new interaction surface.
- Tradeoffs: Products with many values create taller initial cards. A same-row grid must stretch siblings to the tallest card, and compact templates may show more rows than today.
- Responsive and accessibility implications: Short values share rows; long values naturally receive wider or full-row tracks. Narrow cards reduce column count rather than scale controls. Modal surfaces use the same primitives with more columns. Reading and keyboard order remain source order, and no values are hidden behind a disclosure.

## Direction B — Linear choice stack

- Artifact and revision: Textual direction B, revision 1.
- Visual thesis: Present every non-dropdown choice as a full-width row with swatch/image, label, status, and selection mark. Dropdown mode remains full width.
- Strengths: Maximum label readability; unavailable and selected states have generous room; consistent at every width; simplest focus and touch behavior.
- Tradeoffs: Makes cards substantially taller, especially for multiple dimensions or many values; weakens the visual distinction among pills, color swatches, and image swatches; can push price and Add actions far below product identity.
- Responsive and accessibility implications: Excellent at narrow widths and for assistive technology, but inefficient on desktop and likely to overwhelm Compact, Grid, and List cards.

## Direction C — Compact option rail

- Artifact and revision: Textual direction C, revision 1.
- Visual thesis: Keep pills and swatches in a single horizontal rail with overflow cues; dropdowns remain full width. Modals expand the same rail into a wrapped grid.
- Strengths: Preserves compact card height; keeps product actions near the image and price; gives templates a visually light selector.
- Tradeoffs: Requires an internal horizontal scrolling region, risks partially visible values, creates nested gesture/scroll behavior on mobile, and makes keyboard discovery of off-screen values less obvious. It conflicts with the user's no-overflow objective.
- Responsive and accessibility implications: Needs scroll affordances, focus-driven auto-scroll, and careful touch behavior. The card and modal would use materially different spatial models.

## Template expression under Direction A

- FPB Standard and Classic: the selector occupies its own reserved card region between price and quantity/Add controls.
- FPB Compact: the same selector contract uses the compact card's reserved selector region without miniaturizing targets.
- FPB Horizontal: the selector uses its named content-band region on desktop and reflows without moving media, identity, price, or actions on narrow screens.
- Two-dimensional FPB pill/swatch modes keep the primary or canonical visual dimension visible and render each remaining dimension as a labeled native select. Dropdown mode continues to select complete variants.
- PPB Grid: smallest density envelope; grid track count falls with card width and long pills take a full row.
- PPB List: use the wider details region while keeping selector groups independent from price and quantity rows.
- PPB Horizontal Slots and Vertical Slots: card previews retain their current selection trigger; the shared picker modal uses the same mode primitives at relaxed density without creating a second details modal.
- FPB desktop modal and mobile sheet: place groups after price/product identity and before quantity/Add controls in normal flow.

## Recommendation and decision

- Recommended direction and rationale: Direction A. It is the simplest behavior-preserving solution that keeps all values visible, uses responsive CSS instead of JavaScript sizing, preserves semantic source order, and gives each template only the density differences its geometry actually requires.
- Assumptions and stress cases: Initial card rows may become taller for products with many values; that is preferable to hiding, clipping, scrolling, or shrinking options. Test long labels, at least twelve values, two or more option dimensions, unavailable values, missing swatches, selected/unselected cards, and market-formatted prices.
- Selected direction: Direction A — Adaptive intrinsic matrix.
- Approved by and at: User, 2026-09-11T13:23:17Z.
- Evidence IDs: `VA-01` through `VA-12`, `GAP-01` through `GAP-06`, and all six current reference IDs.
- Rejections and reasons: Direction B was not selected because it makes Compact and Grid cards unnecessarily tall. Direction C was not selected because it introduces internal horizontal overflow that conflicts with the request.
