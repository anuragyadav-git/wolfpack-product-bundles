---
schema_version: 1
id: product-card-layout-contract
title: Product Card Layout Contract
type: architecture
status: authoritative
summary: Defines stable and display-safe storefront product-card layout and content boundaries.
last_audited: 2026-08-12
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-widgets
source_paths:
  - app/assets/widgets/full-page
  - app/assets/widgets/full-page-css/shared/responsive-layout.css
  - app/storefront/app-embed.ts
  - app/assets/widgets/product-page
related_docs:
  - Architecture/Bundle Parent Product.md
tags:
  - architecture
  - product-card
keywords:
  - layout stability
  - merchant descriptions
---

# Product Card Layout Contract

For every storefront template (FPB/PPB and all template modes), in any product grid, all cards in the same row must render at the same height, including across selection states.

Hard expectation: all templates share this rule. A product card must never increase in height when moving from unselected to selected (or selected to unselected), and all cards in a row must remain equal height together.

A product should never visually "grow" when transitioning from unselected to selected (or selected to unselected), and row height must remain stable during that transition.

This is a hard requirement for all storefront templates and template modes:

- Applies to FPB and PPB, and every grid variant (including inline, modal, compact, PDP, side-footer, and slot-based layouts).
- Applies to all PPB templates: Product List, Product Grid, Horizontal Slots, and Vertical Slots.

This is a hard requirement:

- A card must not increase row height when changing state, including unselected → selected, selected → unselected, and any hover/focus/active transitions.
- All templates share the same rule: product cards in a given row must always end at the same final pixel height.
- Cards may differ across different rows (row-level height variation is allowed) but not within the same row.
- Uniformity is scoped to each row only: cards in row N must match each other exactly; cards in row N+1 may differ.
- Never let a card height increase when transitioning from unselected → selected (or any other selection-state transition), even briefly.
- This is required for all templates and all grid implementations, including PDP inline, PDP modal, vertical-slot, horizontal-slot, and side-footer/compact variants.
- Different rows may have different heights if content density differs, but any cards sharing a row must be equal height at all times.

## Hard expectation

- For all storefront templates, product cards in the same row must remain visually uniform in height across all interaction states.
- Height must never increase when a product transitions from unselected to selected or from selected to unselected.
- Variation is allowed across rows, but not within a row.

## Implementation rules

- Avoid state transitions that change intrinsic card height (for example by showing additional in-card fields, tall selected chips, or expanding rows inside the card).
- Keep hover/focus feedback non-expanding (outline, border, iconography, color) so cards do not visually overlap neighbors while hovered.
- Keep selection/hover feedback on the existing card frame via overlays, borders, iconography, text color, opacity, and icon badges.
- Replace a product card's Add To Box button with its inline quantity selector immediately; do not animate width, radius, opacity, or geometry during that state swap.
- Prefer fixed row contracts (`min-height`, `height`, flex stretch, consistent padding/line-clamp) so selected/unselected variants stay layout-stable.
- Keep PPB/inpage and PPB/modal states non-expanding on `selected` and hover-expanded transitions.
- Keep merchant product descriptions out of compact FPB and PPB product cards. Preserve `description` and `descriptionHtml` in runtime product data for the product-details modal only.
- In the product-details modal, render descriptions display-safe: sanitize Shopify HTML through the modal contract, escape plain-text fallbacks, and avoid trimming or normalizing merchant copy.
- Product title/description are merchant-owned values; do not normalize case/spacing/punctuation in runtime.
- Render those values with text APIs (`textContent`/`innerText`) rather than HTML assignment to avoid XSS and avoid forcing normalization.
- If new content must appear on selection, render it outside the row-level card height envelope (popover, drawer, footer/action panel, details panel, etc.).
- Current implementation also enforces row stability at CSS-level in full-page/product-card grids by using `grid-auto-rows: minmax(0, 1fr)` across the preset templates instead of `auto`.
- 2026-07-13: Fixed hover-overlap by forcing card containers to stay `height: 100%` in:
  - `app/assets/widgets/full-page-css/base/search-category-product-grid.css`
  - `app/assets/widgets/full-page-css/templates/side-footer-standard.css`
  - `app/assets/widgets/full-page-css/templates/side-footer-classic.css`
  - `app/assets/widgets/full-page-css/templates/side-footer-compact.css`
  - `app/assets/widgets/full-page-css/templates/side-footer-horizontal.css`
  - `app/assets/widgets/product-page-css/base/modal-product-grid.css`
  - `app/assets/widgets/product-page-css/base/bottom-sheet-modal.css`

## FPB responsive ownership

The full-page widget uses its measured container width, not the browser viewport,
to choose its summary surface. Standard, Classic, Compact, and Horizontal use
the shared `data-fpb-summary-mode` contract: widths below `800px` use the sticky
summary tray, while widths of `800px` or more use the sticky sidebar. The
existing `ResizeObserver` propagates mode changes to the widget root, layout,
and tray.

On the mobile path, the shared summary owner renders an edge-to-edge dock with
the summary trigger and primary action. The trigger opens a modal bottom sheet
that grows with its content up to `80dvh`; its header, totals, and action remain
stationary while the selected-products region shows up to three rows and
scrolls from the fourth row onward. Empty capacity is represented by enough
line-item skeletons to maintain three visible rows. Opening the sheet locks background scroll.
Backdrop, Escape, trigger-toggle, and intentional downward-swipe paths all
dismiss it and restore focus. The sheet does not render a separate close
control. Presets may change visual tokens, but must not fork this anatomy or
interaction contract.

The shared FPB shell is the only owner of horizontal gutters. It mirrors the
fluid EB shell contract with three direct rules: the outer shell fills the host
up to `96rem`, uses `0.625rem` padding, and centers each banner, category row,
and sidebar layout at `96%` width. Do not add gutter `clamp()` formulas,
piecewise breakpoints, or duplicate preset-level gutter tokens. The shared
responsive stylesheet is loaded after the active preset stylesheet so
preset-local viewport rules cannot retake structural ownership.

The catalog track is a named inline-size container. Product grids reflow by
catalog width: Standard and Compact cap at three columns, Classic caps at four,
and Horizontal caps at two. Vertical preset media uses one shared fluid bounded
height, while Horizontal preserves its 30/70 media/content split and contained
imagery. Sidebar proportions remain preset-owned: Standard and Classic move
from 59/41 toward 69/31 on wide hosts, Compact uses 60/40, and Horizontal uses
65/35. Only the selected-products region inside the sidebar scrolls.

The Standard desktop summary reserves a three-row product viewport. Each row is
`75px` with a `15px` gap, and the products region begins vertical scrolling when
a fourth line item is present. This capacity rule does not apply to inline slots
or the mobile summary tray.

Discount qualification messages remain on one unbroken line in desktop
sidebars and mobile summary trays. Presets may own their typography, but must
not re-enable wrapping for `.side-panel-discount-message` or its mobile text.

Desktop summary sidebars use a fluid `10dvh` sticky inset, matching EB's
viewport-relative `10%` sticky start. This lets the summary engage before the
product-card row reaches the top of the viewport while preserving bounded
sidebar height.

Preset structural rules use the named FPB shell container rather than viewport
media queries. This keeps a constrained host and a same-width browser viewport
on the same layout path. The shared responsive asset owns shell gutters,
summary tracks, sidebar/tray visibility, catalog column counts, and bounded
vertical-card media. Preset assets own only their visual treatment and
preset-specific card anatomy.

The app embed owns stylesheet loading. Runtime code may set only validated or
measured data values through CSS custom properties; it must not inject static
layout declarations or maintain a second stylesheet-switching path.

### Standard card rows

The Standard FPB card uses one explicit grid for media, title, reserved variant,
price, and action rows. The variant track remains present when a product has no
selector so titles, prices, and actions align across the catalog row. Outer
content transitions use the shared card gap, while the price-to-action gap is a
smaller dedicated token. Media height remains fluid and catalog-container
driven. The action row retains the shared accessible control hit target even
when a measured visual reference uses a smaller button.

## Acceptance

- Any template parity or CSS change touching product cards should preserve equal card height within the row under all shopper states in every template.
- Visual proof should check before/after selection in the same viewport and confirm no row height jump.
