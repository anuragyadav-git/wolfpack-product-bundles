---
schema_version: 1
id: fpb-ppb-step-title-visual-audit
title: FPB and PPB Step Title Visual Audit
type: design-audit
status: complete
summary: Records the measured placement, hierarchy, and ownership gaps affecting merchant-configured Step Titles across FPB and PPB storefronts.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page/methods/mobile-summary-methods.ts
  - app/assets/widgets/full-page/methods/responsive-layout-methods.ts
  - app/assets/widgets/full-page-css/base/steps-header-banners.css
  - app/assets/widgets/full-page-css/shared/responsive-layout.css
  - app/assets/widgets/product-page/methods/layout-shell-methods.ts
  - app/assets/widgets/product-page/templates/modal-slot-template.ts
  - app/assets/widgets/product-page-css/templates/modal-slots.css
  - app/assets/widgets/product-page-css/templates/inpage-grid.css
  - app/assets/widgets/product-page-css/templates/inpage-cascade.css
related_docs:
  - .agents/skills/storefront-design-director/references/visual-analysis-rubric.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - visual-audit
  - pageTitle
  - storefront-heading
---

# Visual Audit

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

## Conditions

- Job ID and revision: fpb-step-title-redesign-20260827, revision 2
- Reference IDs: CUR-FPB-DESKTOP-001, CUR-FPB-MOBILE-001, CUR-PPB-DESKTOP-001, CUR-PPB-MOBILE-001, CUR-DCP-FPB-DESKTOP-001, CUR-DCP-PPB-DESKTOP-001
- Viewports and states: 1280 x 800 desktop and 390 x 844 mobile; active first-step selection state with representative merchant Step Title copy.
- Comparison limits: Current-state structural evidence only. No external target exists, so proposed target values remain recommendations until direction approval. PPB Grid and Cascade ownership is source-observed rather than screenshot-measured.

## Observations

| ID | Region | Dimension | Current | Target | Evidence type | Confidence | Required |
|---|---|---|---|---|---|---|---|
| O-01 | FPB desktop content heading | Horizontal alignment | Title starts at x=10 while the product-content track starts near x=35; title is about 25 px left of its content owner. | Align the title edge exactly with the active product-content track. | Direct Chrome geometry | High | Yes |
| O-02 | FPB desktop content heading | Width ownership | Header width is about 737 px while the product-content track is about 811 px. It is sized independently from the content column. | Let the content region own title width; use intrinsic width with a readable text measure rather than a separate shell percentage. | Direct Chrome geometry and source | High | Yes |
| O-03 | FPB mobile content heading | Alignment and whitespace | The title is centered across a 370 px band and visually detached above a 355 px product card region. | Left-align inside the same mobile content padding as cards, tabs, banners, and filters; keep a close downstream spacing relationship. | Direct Chrome screenshot and geometry | High | Yes |
| O-04 | FPB title typography | Hierarchy | 14 px medium-weight text reads as helper copy rather than the heading for the active task. | Promote to a responsive heading scale with strong weight and compact line height. | Computed style | High | Yes |
| O-05 | PPB Vertical Slots | Hierarchy | Each slot section repeats a 14 px bold label. Long Step Title copy reads like a slot caption and multiple titles compete simultaneously. | Render the active Step Title once as the heading for the active selection region; retain Step Name for compact step identity. | Direct Chrome screenshot, computed style, and approved semantic decision | High | Yes |
| O-06 | PPB Grid and Cascade navigation | Content role | `pageTitle || name` is reused in progress controls, so long configured copy can crowd navigation. | Navigation uses Step Name; the active body owns one Step Title. | Repository source and approved semantic decision | High | Yes |
| O-07 | PPB modal picker | Content role | Modal header and body owners can both expose title-like text without a stable semantic distinction. | Modal progress/header identifies the Step Name; body heading presents the configured Step Title once. | Repository source | Medium | Yes |
| O-08 | All templates | Wrapping | Current title styles have no explicit readable measure or stress contract. | Allow natural two-line wrapping, no truncation, no fixed height, and overflow-safe long-word handling. | Source observation and responsive requirement | Medium | Yes |
| O-09 | All templates | Surface treatment | Current headings have no containing surface, divider, or accent. | Prefer typography and spatial grouping as the primary hierarchy; decorative treatment must remain subordinate and optional by direction. | Design recommendation | Medium | Yes |
| O-10 | Settings Design preview | Renderer parity | Hard-reloaded FPB preview reproduces the small helper-style title; PPB Product List uses `pageTitle` in the progress controls and has no separate content heading. | Inherit Direction A from the production renderers and shared CSS with no preview-only Step Title override. | Direct Chrome and repository architecture | High | Yes |
|---|---|---|---|---|---|---|---|

## Layout, geometry, typography, and surfaces

- The Step Title should be a child of the active product-selection region, not a sibling of the entire FPB two-column shell and not a repeated PPB slot caption.
- Its leading edge should align with the content that the title introduces. On FPB this is the catalog track; on PPB it is the active slot/product-grid body.
- Recommended heading scale for exploration: `clamp(1.125rem, responsive container expression, 1.5rem)`, weight 700, line height 1.2 to 1.3. Exact tokens remain open until direction approval.
- The title should inherit the existing merchant/theme primary text color. No new hardcoded color or theme-compatibility alias is justified.
- The heading block should size to content, permit natural wrapping, and use a readable max measure without constraining the product region.
- Vertical spacing should bind the title more closely to its downstream controls/products than to preceding navigation or theme content.

## Content, interaction, responsive, and accessibility

- Step Name remains the short label in progress/navigation controls. Step Title appears once for the active step and does not become an interactive control.
- When Step Title is empty, no decorative shell or empty vertical gap should remain. The existing Step Name navigation remains sufficient identity.
- Desktop and mobile both use left alignment. Mobile should not introduce a centered detached band.
- Long titles may wrap to two or more lines without clipping, overlap, fixed-height truncation, or horizontal scrolling. Unbroken strings require overflow wrapping.
- The title should use a semantic heading level consistent with the surrounding storefront document outline; implementation must not assume a globally fixed `h2` if the widget host requires contextual selection.
- Step changes must update the title with the active content without adding motion. Existing focus and validation behavior remain unchanged.

## Gap classification

| Gap ID | Type | Expected change | Invariant behavior | Canonical owner hypothesis | Status |
|---|---|---|---|---|---|
| G-01 | Ownership and visual | Move FPB Step Title into the catalog/content owner and align it with product content. | Bundle shell, summary mode, selection, and navigation remain unchanged. | `responsive-layout-methods.ts` placement plus shared full-page Step-header CSS | Confirmed |
| G-02 | Visual and responsive | Promote FPB title typography and replace centered mobile detachment with content-aligned spacing. | Merchant title content and color token inheritance remain unchanged. | `steps-header-banners.css` and `responsive-layout.css` | Confirmed |
| G-03 | Content role and visual | Stop using PPB Step Title as a replacement for Step Name in progress controls; show it once in the active body. | Step accessibility, completion, navigation, and validation remain unchanged. | `layout-shell-methods.ts`, modal state owner, and template renderers | Confirmed |
| G-04 | Visual and responsive | Give PPB modal slots, Grid, and Cascade a shared heading hierarchy with family-specific placement. | Each template retains its existing grid/slot geometry and controls. | Template-specific PPB CSS owners with one shared semantic class/token owner | Confirmed |
| G-05 | Accessibility | Preserve document hierarchy, natural text wrapping, and no empty heading gap. | No new control or focus target is introduced. | Shared render helper plus family CSS owners | Confirmed |
| G-06 | Preview ownership | Make Settings Design fixtures expose distinct Step Name and Step Title content while production renderers own markup and CSS. | Preview transport, neutral store context, fitting, interactions, and side-effect blocking remain unchanged. | `storefront-preview-fixtures.ts` plus production FPB/PPB owners; no preview-only stylesheet | Confirmed |
