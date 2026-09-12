---
schema_version: 1
id: product-card-layout-contract
title: Product Card Layout Contract
type: architecture
status: authoritative
summary: Defines stable and display-safe storefront product-card layout and content boundaries.
last_audited: 2026-09-12
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-widgets
source_paths:
  - app/assets/widgets/full-page
  - app/assets/widgets/full-page/methods/side-panel-methods.ts
  - app/assets/widgets/full-page-css/shared/responsive-layout.css
  - app/assets/widgets/full-page-css/templates/standard/overrides.css
  - app/assets/widgets/full-page-css/base/product-modal-shell.css
  - app/assets/widgets/shared/variant-selector.ts
  - app/assets/widgets/product-page/variant-selector-modes.ts
  - app/assets/bundle-modal-component.ts
  - app/storefront/app-embed.ts
  - app/assets/widgets/product-page
  - app/assets/widgets/product-page-css/base/mobile-drawers.css
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
- On pointer-capable desktop FPB viewports, hovering the product image reveals a
  circular magnifying-glass affordance at the image's top-right corner. Render
  the icon with CSS geometry so it does not depend on a theme-root asset URL;
  touch/mobile cards and all PPB cards do not show this affordance. PPB product
  images and titles are informational; selection remains on explicit Add,
  quantity, and variant controls.
- Replace a product card's Add To Box button with its inline quantity selector immediately; do not animate width, radius, opacity, or geometry during that state swap.
- Product Grid is the sole PPB exception when per-product quantity validation is enabled with a maximum of one: its selected action remains the compact quantity-aware button. When validation is disabled or its maximum exceeds one, Product Grid uses the shared inline selector and disables increment at the configured maximum.
- Standard FPB cards use the same card, media, title, selector, price, and sizing rules in text and icon CTA modes. Icon mode may override only the compact action geometry; it must not move the action ahead of the selector.
- Every FPB card owns independent media, identity, price, selector, and action regions. When any card in an FPB product-grid row renders a configured selector, sibling cards reserve the same selector region so a no-variant card beside a two-dimensional card keeps its title, price, and action positions.
- Product cards use one canonical content hierarchy in both rendered DOM and visual layout: identity, variant selectors, price, then the Add or quantity action. Pricing and primary actions never precede variant selection because the shopper must understand or choose the purchasable variant before evaluating and committing to its price.
- Standard, Classic, and Compact use one shared vertical-card track contract for those mixed rows: a bounded two-line identity track, followed by selector, pricing, and action tracks. Horizontal keeps its native media/content split but uses the same stable region ownership and ordering inside the content track.
- Variant selectors use the Direction A adaptive intrinsic matrix contract. Every Shopify option value remains directly present in source order; inline groups wrap in normal flow and never hide values behind `+N`, use a horizontal rail, or own a nested scroller.
- Every dimension presented as a non-dropdown control is a separately labeled native radio group. Repeated cards, details surfaces, and picker copies receive instance-scoped control IDs and group names so selecting one copy cannot affect another.
- Unavailable values remain visible with native disabled semantics and unchanged target geometry. They are not filtered to make a card fit, and they cannot invoke the existing variant-change owner.
- Selector targets retain a minimum `2.75rem` interaction size. Long labels wrap within their intrinsic control, while dropdowns fill the available details width. Selection, focus, and unavailable treatments may not change control geometry.
- FPB and PPB use the same persisted category modes: Dropdown, Pills, Color swatches, and Image swatches. In a two-dimensional FPB pill or swatch mode, the primary or canonically mapped dimension remains a visible radio group and every additional dimension uses a labeled native select. Dropdown mode remains one complete-variant selector. This bounds selector height without hiding Shopify values or adding another state engine.
- Across all FPB templates, each configured option dimension owns a separate full-width row. Pill dimensions distribute their controls across that row and wrap only when the card can no longer preserve the minimum interaction target; a secondary select must never compete with the primary pill or swatch group in a parallel column.
- On mobile FPB cards, every option group fills the shared selector region and begins at the same inline edge. Compact secondary selects must not add an indent relative to the primary pill or swatch group.
- A configured selector spans the card's complete price/action grid before pricing begins. Do not size it as a percentage of the first price column; let CSS Grid stretch the spanning region so option values receive all available card width.
- FPB product-card actions use the merchant-owned button background and text tokens at every viewport. Template and breakpoint CSS may alter action geometry, but must not replace those colors with template-specific constants.
- The FPB bundle-level primary action uses the merchant-owned sidebar button background and text tokens in both the desktop summary and mobile tray. Responsive CSS changes its geometry and placement only; it does not introduce a second mobile color.
- PPB retains Dropdown, Pills, Color swatches, and Image swatches. Multi-option products render one labeled group per Shopify option dimension; choosing a value resolves the available variant that best preserves the other current option values, then delegates the one existing variant update. Dropdown mode keeps one native select per dimension. For Pills, Color swatches, and Image swatches, the compactest eligible dimension retains the configured visual controls while every additional dimension uses a labeled native select. The groups share an intrinsic row when the card can accommodate them and collapse only when their minimum usable widths no longer fit. This bounds Size × Color card height without hiding choices, guessing swatches, substituting variant images, or changing the PPB template shell.
- PPB in-page Product Grid and Product List cards rebuild through their canonical step renderer after each option change. This is required because the delegated update replaces the product grid; retaining selector listeners from the replaced grid leaves a sibling dimension bound to stale option state and can revert the preceding choice. Every rebuild must preserve the exact combined variant, selected option defaults, image, price, and accessible selected state.
- PPB card tracks remain stable whether or not a product has selectors. Variant selectors own the region immediately before price and action; sibling cards reserve the same price and action baselines. In modal cards, narrow content may collapse the intrinsic selector row, but selector growth must consume only its reserved region and must not move price or the primary action relative to adjacent cards.
- Prefer fixed row contracts (`min-height`, `height`, flex stretch, consistent padding/line-clamp) so selected/unselected variants stay layout-stable.
- Keep PPB/inpage and PPB/modal states non-expanding on `selected` and hover-expanded transitions.
- Keep merchant product descriptions out of compact FPB and PPB product cards. Preserve `description` and `descriptionHtml` in runtime product data for the FPB product-details modal and existing product payload consumers.
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
line-item skeletons to maintain three visible rows. Opening the sheet locks
background scroll. Each mobile skeleton uses one row: its image and text group
share the same vertical bounds rather than creating nested product rows. Mobile
summary skeletons remain static and do not pulse or shimmer.
Backdrop, Escape, trigger-toggle, and intentional downward-swipe paths all
dismiss it and restore focus. The sheet does not render a separate close
control. Presets may change visual tokens, but must not fork this anatomy or
interaction contract.

## PPB drawer and slot ownership

Product List and Product Grid share one widget-bounded mobile summary owner.
The footer is sticky inside `#bundle-builder-app`, so its disclosure expands
upward without becoming a viewport modal, adding a backdrop, or locking page
scroll. Selection rerenders preserve its open state while products remain; the
last removal collapses it and leaves the zero-count summary trigger available.

Horizontal Slots and Vertical Slots share the same bottom-sheet picker runtime.
Orientation changes only slot presentation: horizontal slots use responsive
equal-height tiles, while vertical slots use equal-height full-width rows. A
selected and empty slot reserve the same row geometry, and a filled slot keeps
its exact replacement target through picker selection.

PPB modal surfaces declare their owner with `data-ppb-drawer-surface`. The
bundle picker and variant selector participate in one layer stack; only its top
layer handles Escape or backdrop dismissal. The first
modal layer locks document scrolling, the final close restores the previous
scroll styles, and every layer restores focus to its exact trigger. The
selected-summary disclosure is intentionally outside this modal stack.

The PPB mobile variant selector omits a cross and dismisses from its backdrop or
after a variant choice. PPB does not construct a product-details drawer at any
viewport.

Mobile add-to-cart actions show the active discount label badge beside the
merchant-authored action label and do not repeat the bundle price. Price remains
owned by the collapsed summary row and the sheet totals. Across collapsed and
expanded mobile states, the add-to-cart action is the sole discount-badge owner;
the progress message and Total row do not repeat it.

When Clear is triggered from the expanded mobile summary, confirmation uses a
second native modal dialog above the summary. The summary remains open but inert
until Go Back restores it; Clear All resets selections and collapses the mobile
summary. Desktop Clear retains the existing centered confirmation dialog.

The shared FPB shell is the only owner of horizontal gutters. It mirrors the
fluid EB shell contract with three direct rules: the outer shell fills the host
up to `96rem`, uses `0.625rem` padding, and centers each banner, category row,
and sidebar layout at `96%` width. Do not add gutter `clamp()` formulas,
piecewise breakpoints, or duplicate preset-level gutter tokens. The app embed
composes storefront stylesheets in one fixed order: base widget, mobile-summary
component, responsive shell/sidebar component, then the active preset
entrypoint. Shared components define the default structural contract once,
while the final preset layer may override visual treatment or an explicitly
documented design exception. Preset entrypoints must not reimplement the shared
gutter, sticky/scroll, summary-mode, or mobile-sheet algorithms.

The four preset entrypoints are intentionally thin:

- `templates/side-footer-standard.css` imports Standard timeline and visual overrides.
- `templates/side-footer-classic.css` imports Classic visual component files.
- `templates/side-footer-compact.css` imports Compact visual overrides.
- `templates/side-footer-horizontal.css` imports Horizontal visual overrides.

The app embed is the importer for `shared/mobile-summary-footer.css` and
`shared/responsive-layout.css`. They remain separate generated Shopify assets
instead of being expanded into all four preset files, which avoids duplicate
downloads and keeps every generated asset below Shopify's 100,000-byte limit.

The catalog track is a named inline-size container. Product grids reflow by
catalog width: Standard and Compact cap at three columns, Classic caps at four,
and Horizontal caps at two. Vertical preset media uses one shared fluid bounded
height, while Horizontal preserves its 30/70 media/content split and contained
imagery. Sidebar proportions remain preset-owned: Standard and Classic move
from 59/41 toward 69/31 on wide hosts, Compact uses 60/40, and Horizontal uses
65/35. Only the selected-products region inside the sidebar scrolls.

Every FPB desktop summary reserves the same three-row product viewport. Each row
is `4.6875rem` with a `0.9375rem` gap, and the products region begins vertical
scrolling when a fourth line item is present. This capacity rule does not apply
to inline slots or the mobile summary tray.

When Product Slots is disabled, Standard, Classic, Compact, and Horizontal route
desktop selected-product line items through the same shared row renderer. Preset
styles must not replace that row anatomy. Product-slot tiles and the mobile
summary keep their existing dedicated render paths.

Discount qualification messages remain on one unbroken line in desktop
sidebars and mobile summary trays. Presets may own their typography, but must
not re-enable wrapping for `.side-panel-discount-message` or its mobile text.

Desktop summary sidebars use a fluid `10dvh` sticky inset, matching EB's
viewport-relative `10%` sticky start. This lets the summary engage before the
product-card row reaches the top of the viewport while preserving bounded
sidebar height.

The desktop summary header uses two explicit rows: bundle title and Clear share
the first row at the same visual height, while the bundle description spans the
second. Its action area keeps the total group beside the primary action; within
that group, the label and price are stacked in two equal-height rows.

When Bundle Quantity Options are enabled, the shared box selector follows the
description as the next desktop summary row for every FPB preset. Its renderer
and responsive presentation belong to the shared side-panel method and base
sidebar CSS; preset styles must not restate or override this component.

The active Bundle Quantity Option advances to the next configured rule as soon
as the shopper's paid-product quantity exceeds the current rule quantity. The
desktop summary sidebar and expanded mobile footer must both pass the same live
paid-product quantity into the shared selector so their active rule, slot target,
and exact-quantity validation cannot drift apart.

Uploaded step-timeline icons occupy 80% of their circular icon container. The
timeline container, connector geometry, and completed-state indicator retain
their existing dimensions.

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
