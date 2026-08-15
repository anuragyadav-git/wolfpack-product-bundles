---
schema_version: 1
id: fpb-three-preset-responsive-contract
title: FPB Classic Compact Horizontal Responsive Contract
type: design-job-artifact
status: complete
summary: Defines intrinsic grid behavior and the approved Horizontal transition at the shared FPB summary boundary.
last_audited: 2026-08-14
owners:
  - Aditya Awasthi
domains:
  - responsive-design
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page-css/templates/classic
  - app/assets/widgets/full-page-css/templates/compact/overrides.css
  - app/assets/widgets/full-page-css/templates/horizontal/overrides.css
related_docs:
  - visual-audit.md
  - component-anatomy.md
tags:
  - fpb
  - responsive
keywords:
  - container query
  - grid columns
---

# Responsive Contract

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 1
Artifact status: complete

## Required viewports and container widths

| ID | Width | Height | Placement width | Purpose | Required states |
|---|---:|---:|---|---|---|
| `primary-desktop` | 1440 | 900 | Record live catalog width | Primary four/three/two-column evidence | All nine states across the three loops |
| `desktop-stress` | 1280 | 800 | Record live catalog width | Narrow desktop/sidebar stress | Default, selected-quantity, long-title, variant |
| `tablet-portrait` | 768 | 1024 | Record live catalog width | Shared tray mode and Horizontal one-column proof | Default, focus, selected-quantity, long-title |
| `primary-mobile` | 390 | 844 | Record live catalog width | Primary two/two/one-column evidence | All nine states across the three loops |
| `narrow-mobile` | 360 | 800 | Record live catalog width | Minimum required width stress | Default, selected-quantity, sale-price, long-title |

## Region transformations

| Region | Range | Size | Layout | Order | Visibility or replacement | Scroll | Sticky or fixed | Text and image | Controls and spacing | Safe area | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Shared shell/summary | Container `<800px` | Shared shell width | Catalog above sticky tray | Existing DOM order | Desktop sidebar hidden; shared tray/drawer shown | Page and drawer rules unchanged | Shared bottom tray | Preset cards only reflow | Existing 44px targets | Shared tray owns safe area | No horizontal overflow or tray overlap |
| Shared shell/summary | Container `>=800px` | Shared shell width | Catalog beside sticky sidebar | Existing DOM order | Shared sidebar shown; tray hidden | Only selected-products region scrolls | Existing 10dvh sidebar inset | Preset cards only reflow | Existing 44px targets | N/A | No sidebar/card overlap |
| Classic grid | All widths | `100%` of catalog | Intrinsic responsive grid capped at 4 columns; two columns at 390/360 | Source order | No replacement | Page scroll | None | Vertical contained media; readable two-line title reserve | Token gap/padding; no fixed captured card width | Inherited | No clipped focus or card content |
| Compact grid | All widths | `100%` of catalog | Intrinsic responsive grid capped at 3 columns; two columns at 390/360 | Source order | No replacement | Page scroll | None | Vertical contained media; dense two-line title reserve | Token gap/padding; contained action | Inherited | No clipped focus or action |
| Horizontal grid | `<800px` | `100%` of catalog | Exactly 1 column | Source order | No replacement | Page scroll | None | Existing 30/70 card split; contained media; title/variant above price/action | Token gap/padding; 44px action | Shared tray safe area | Final action remains clear of tray |
| Horizontal grid | `>=800px` | `100%` of catalog | Intrinsic grid capped at 2 columns | Source order | No replacement | Page scroll | None | Existing 30/70 card split | Token gap/padding; 44px action | N/A | No content collision at narrow desktop |
| Card state tracks | All widths | Stretch to grid row | Stable grid tracks | Existing DOM order | Add swaps to quantity in place | None | None | Long text wraps inside reserved tracks; images use contain | State changes do not alter outer geometry | Inherited | No wrap-induced horizontal overflow |

## Critical boundaries

- Verify the shared shell and Horizontal grid at container widths 799px, 800px, and 801px.
- At 799px, Horizontal is one column and the shared mobile tray is the only summary surface.
- At 800px and 801px, Horizontal may use up to two intrinsic columns and the shared sidebar is the only summary surface.
- Classic and Compact column changes remain content-driven by the existing catalog container; do not add viewport-only breakpoints or captured fixed card widths.

## Orientation, high zoom, and opposite-viewport non-regression

- Rotate/reflow without changing source order, available controls, or selection state.
- At 200% zoom, controls remain reachable and text can wrap without horizontal scrolling at the page level.
- At every required width, card rows remain stable through hover, focus, selection, quantity, and variant changes.
- Shared summary sidebar, tray/drawer, product modal/drawer, category tabs, and timeline retain their current geometry and behavior.
- Exact reference measurements are evidence only; implementation uses existing semantic tokens, intrinsic sizing, `minmax()`, fractional tracks, percentages, and the documented 800px container boundary.
