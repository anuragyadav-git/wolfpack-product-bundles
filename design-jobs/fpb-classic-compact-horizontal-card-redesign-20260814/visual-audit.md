---
schema_version: 1
id: fpb-three-preset-card-visual-audit
title: FPB Four-Template Storefront Alignment Visual Audit
type: design-job-artifact
status: complete
summary: Records measured Wolfpack placement defects across all four FPB templates, with priority on price and action stability.
last_audited: 2026-09-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page-css/templates/classic
  - app/assets/widgets/full-page-css/templates/standard/overrides.css
  - app/assets/widgets/full-page-css/templates/compact/overrides.css
  - app/assets/widgets/full-page-css/templates/horizontal/overrides.css
related_docs:
  - screenshot-inventory.yaml
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - product-card
keywords:
  - Classic
  - Compact
  - Horizontal
---

# Visual Audit

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 4
Artifact status: complete

## Conditions

- Reference IDs: `REF-EB-*` and `REF-WPB-*` in `screenshot-inventory.yaml`.
- Viewports: comparable desktop `1440x900` and mobile `390x844`; Horizontal computed stress geometry at `1280x800`, `768x1024`, and `360x800`.
- States: current fixture directly showed default, selected quantity, and sale-price cards. C01-C15 remains the behavioral ledger for long title, mixed media, variant, unavailable, disabled, hover/focus, and quantity boundaries.
- Comparison limits: EB and Wolfpack stores have equivalent products but not identical selected state or currency. Screenshots are inspiration/structural evidence, not pixel-diff baselines. Chrome rendered every image, but its file-path policy rejected persistence.

## Revision 4 alignment findings

- The Wolfpack Product Card Layout Contract is the primary baseline. Prior competitor captures are used only where the contract leaves a visual choice ambiguous.
- Current Standard desktop evidence at 1280x800 shows the price/action columns changing from `203.25px 35px` to `126.25px 112px` after selection. At the Chrome host's narrowest real window (`500px` inner width), the same tracks change from `144.109px 35px` to `91.1094px 88px`.
- The Standard outer card, media, and body rectangles remain stable. The defect owner is therefore the icon-CTA price/action grid and its state-dependent second track, not the card shell.
- Classic and Compact use an `auto-fit` price/action grid whose available track count changes with the action's intrinsic width. This is the same state-instability mechanism and should be replaced by explicit price plus action tracks owned by each preset.
- Horizontal already declares an explicit action track. Its selected-only content-wrapper layout remains a separate measured remediation candidate and must not be changed unless the refreshed matrix reproduces vertical movement.
- No shared summary, timeline, navigation, modal, or mobile-tray change is justified by current evidence. Those surfaces remain in the audit matrix but are not implementation targets without a measured failure.

## Observations

| ID | Region | Dimension | Current Wolfpack | EB reference | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| VA-CL-01 | Classic grid | Desktop columns and gap | 4 columns, 12px observed gap | 4 columns, 15px observed gap | computed geometry | high | Preserve 4-column archetype with token-owned gap |
| VA-CL-02 | Classic card | Desktop height | 389px first row | about 311px | computed geometry | high | Remove excess body slack without fixing a captured height |
| VA-CL-03 | Classic card | Mobile height | 344px at 390 | 263px at 390 | computed geometry | high | Compact the body while preserving 44px Wolfpack controls |
| VA-CL-04 | Classic grid | Mobile columns | 2 | 2 | computed geometry | high | Preserve |
| VA-CO-01 | Compact grid | Desktop columns | 3 | 3 | computed geometry | high | Preserve |
| VA-CO-02 | Compact card | Desktop density | 309px card with 191px media | 349px card with square 238px media | computed geometry | high | Keep Compact dense; modestly strengthen media presence and card grouping |
| VA-CO-03 | Compact card | Mobile height | 278px | 263px | computed geometry | high | Small density correction only |
| VA-CO-04 | Compact surface | Hierarchy | Borderless, centered mobile copy, floating circular action | Outlined surface, left-readable copy, action integrated with price | screenshot observation | high | Improve grouping and alignment without cloning |
| VA-HO-01 | Horizontal grid | Desktop columns | 2 | 2 | computed geometry | high | Preserve |
| VA-HO-02 | Horizontal card | Desktop height | 180px | 156px | computed geometry | high | Reduce slack while retaining accessible controls |
| VA-HO-03 | Horizontal grid | 768 columns | 2 | 1 | computed geometry | high | Use the one-column row-card treatment below the shared 800px summary boundary |
| VA-HO-04 | Horizontal card | Mobile height | 164px | 136px | computed geometry | high | Compress toward content while retaining 44px hit targets |
| VA-HO-05 | Horizontal surface | Grouping | Borderless rows with a long internal divider | Outlined row cards | screenshot observation | high | Add a restrained card frame and remove the disconnected-row feeling |
| VA-ALL-01 | All grids | Overflow | None at captured widths | None at captured widths | computed geometry | high | Must remain false at all five widths |
| VA-ALL-02 | All states | Row stability | Repository contract requires equal row height and non-growing state swaps | Selected EB cards stayed inside row geometry | repository plus screenshot | high | Hard invariant |
| VA-ALL-03 | Shared surfaces | Summary/modal/timeline | Existing shared owners active | In broader audit scope | repository observation | high | Change only for a measured placement defect |
| VA-ST-STATE-04 | Standard price/action row | Default to selected state | Tracks change by 77px desktop and 53px at the narrow host width | Wolfpack contract requires non-growing state swaps | computed geometry | high | Make the action track invariant |
| VA-CL-STATE-05 | Classic price/action row | Default to selected state | `auto-fit` track count depends on intrinsic action width | Wolfpack contract requires non-growing state swaps | CSS ownership plus prior QA | high | Use explicit preset-owned tracks |
| VA-CO-STATE-06 | Compact price/action row | Default to selected state | `auto-fit` track count depends on intrinsic action width | Wolfpack contract requires non-growing state swaps | CSS ownership plus prior QA | high | Use explicit preset-owned tracks |

## Layout, geometry, typography, and surfaces

Classic has the correct roomy image-first identity, but Wolfpack allocates too much vertical body space and visually separates price/action from the title. Compact is already close to the desired density; its main weakness is weak card grouping and oversized floating circular actions on mobile, not overall height. Horizontal keeps the right 30/70 orientation but reads like disconnected media, title, and action fragments because the card frame is visually absent.

Across the three presets, the safest shared visual language is: neutral card surface, one restrained frame, consistent token-owned radius and padding, strong product title, compact price/action baseline, and existing merchant colors. Captured pixel measurements remain evidence; responsive CSS must use existing tokens, intrinsic sizing, fractional tracks, and the named `fpb-shell` container.

## Content, interaction, responsive, and accessibility

- C01-C15 remain authoritative for hierarchy, long content, sale price, mixed media, variants, availability, quantity, and keyboard behavior.
- Hover, focus, selected, and quantity states may change outline, color, or iconography but not geometry.
- Controls retain the existing accessible hit-target tokens even where EB uses a smaller control.
- Classic and Compact remain image-first with four/three desktop caps and two mobile columns. Horizontal remains two columns on desktop and becomes one row-card column below the shared 800px summary-mode boundary.
- The shared summary sidebar, mobile bottom sheet, product details modal/drawer, timeline, selection, pricing, variants, validation, and cart flow are invariant.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| GAP-CL-DENSITY | visual/responsive | Compact Classic title/price/action tracks and media/body relationship | C01-C15 and equal row heights | Classic preset CSS only | decision-ready |
| GAP-CO-GROUPING | visual | Add restrained grouping, align content, normalize action treatment | Compact 3/2 grid and interactions | Compact preset CSS only | decision-ready |
| GAP-HO-GROUPING | visual/responsive | Restore row-card frame, compact vertical rhythm, use one column below 800px | 30/70 anatomy and interactions | Horizontal preset CSS only | decision-ready |
| GAP-STATE-STABILITY | accessibility/behavior | Visible non-expanding focus/selected treatment | Existing DOM and event paths | Each active preset CSS | decision-ready |
| GAP-ST-PRICE-ACTION | visual/state | Hold one invariant quantity-width action track in icon mode | Price and action stay in the same columns | Standard preset CSS | implementation-ready |
| GAP-CL-PRICE-ACTION | visual/state | Replace state-sensitive auto-fit with explicit tracks | Classic identity and card heights | Classic preset CSS | implementation-ready |
| GAP-CO-PRICE-ACTION | visual/state | Replace state-sensitive auto-fit with explicit tracks | Compact identity and card heights | Compact preset CSS | implementation-ready |
| GAP-HO-STATE-VERIFY | visual/state | Recheck selected-only vertical reflow before editing | Horizontal identity and explicit action track | Horizontal preset CSS | evidence-pending |
| GAP-SHARED-AUDIT | ownership | Inspect all shared widget surfaces | No speculative styling changes | Existing narrowest raw CSS owner | evidence-pending |
