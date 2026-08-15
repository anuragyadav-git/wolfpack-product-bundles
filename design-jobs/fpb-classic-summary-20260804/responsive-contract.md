---
schema_version: 1
id: fpb-classic-summary-responsive-contract
title: FPB Classic Summary Responsive Contract
type: design-contract
status: approved
summary: Defines the desktop-sidebar to mobile-tray transformation, including the current 768–1023px ownership gap.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - responsive-design
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page-css/templates/side-footer-classic.css
  - app/assets/widgets/full-page-css/templates/classic/desktop-sidebar.css
  - app/assets/widgets/full-page-css/templates/classic/mobile.css
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
related_docs:
  - .agents/skills/storefront-design-director/references/responsive-design-contract.md
tags:
  - fpb
  - classic
  - responsive
keywords:
  - breakpoint
  - safe-area
---

# Responsive Contract

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: approved

## Required viewports and container widths

| ID | Width | Height | Placement width | Purpose | Required states |
|---|---|---|---|---|---|
| vp-320 | 320 | 720 | full widget width | Narrow mobile stress | collapsed empty/partial, expanded long list, disabled/enabled CTA, long copy |
| vp-360 | 360 | 800 | full widget width | Baseline mobile | collapsed/expanded partial, quantity, variant |
| vp-390 | 390 | 844 | full widget width | Primary mobile | empty, partial, complete, expanded, safe area, loading |
| vp-414 | 414 | 896 | full widget width | Wide mobile | complete, discounted total, long translated copy |
| vp-768 | 768 | 1024 | full widget width and 600px constrained host | Tablet portrait and boundary stress | tray empty/partial/complete, long list, no overflow |
| vp-1024 | 1024 | 768 | full widget width | First desktop/sidebar composition | empty, partial, enabled/disabled, long list |
| vp-1280 | 1280 | 800 | full widget width | Desktop | one selected, tiers, variant, quantity, long list |
| vp-1440 | 1440 | 900 | full widget width | Primary desktop | reference partial plus every approval-critical state |
| vp-1536 | 1536 | 960 | full widget width | Wide desktop | complete, discounted total, long content |

## Region transformations

| Region | Range | Size | Layout | Order | Visibility or replacement | Scroll | Sticky or fixed | Text and image | Controls and spacing | Safe area | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| component switch | available widget width below 64rem | Full inline width minus content gutters. | Product content plus sticky summary tray. | Product content first; tray remains at visual viewport bottom. | Desktop sidebar hidden; one mobile/tablet tray exposed. | Page remains scrollable; expanded selected list owns overflow only when needed. | Tray sticky, never page-fixed. | Summary copy appears only in expanded view; collapsed bar uses concise status. | Minimum 44px actions; content-driven gaps. | Bottom action padding is max(design spacing, safe-area inset). | No horizontal overflow or duplicated semantic tree. |
| component switch | available widget width 64rem and above | Two-column shell using intrinsic grid tracks; sidebar minimum is its content-safe width and product region receives remaining space. | Product region plus sticky Calm Review Panel. | Product selection then review. | Mobile tray hidden; desktop sidebar exposed. | Selected list alone scrolls under constrained height. | Sidebar sticky with theme-safe top offset. | Long titles wrap within their column; images keep configured fit. | Footer can reflow total and CTA rather than overlap. | Not applicable beyond ordinary viewport insets. | Shell may reflow at the component boundary; never force page horizontal scroll. |
| desktop header | 64rem+ | Intrinsic height; full sidebar width. | Two-column copy/action header. | Review purpose, merchant copy, Clear. | Always present; Clear only when meaningful. | None. | In sticky shell, outside list scroll. | Merchant title may wrap; recovery never overlays it. | Clear remains at least 44px target even when visual button is compact. | N/A. | Copy wraps; no clipping. |
| desktop selected list | 64rem+ | Flexible block between header/feedback and footer; bounded by available dynamic viewport height. | One-column rows or configured slot grid. | Count, then rows/slots. | State-driven. | Internal vertical scroll for long list; overscroll contained. | Not independently sticky. | Titles and variants wrap/clamp predictably; images use configured object fit. | Row actions do not shrink below target requirements. | N/A. | Horizontal overflow hidden only after content is allowed to wrap. |
| desktop action footer | 64rem+ | Intrinsic height; full sidebar width. | Divider, total block, primary action; reflow to stacked layout when content cannot fit side by side. | Total before action in DOM and reading order. | Persistent within sidebar. | None. | Outside selected-list scroll. | Wide currency and translated action labels wrap safely. | CTA minimum block size 44px; spacing uses semantic tokens. | N/A. | No total/CTA collision. |
| collapsed tray | below 64rem | Inline gutter to inline gutter; intrinsic height. | Disclosure/count/status plus total/action row. | Disclosure precedes primary action in DOM. | Expanded content hidden but not duplicated. | None. | Sticky to bottom. | Merchant title omitted from collapsed bar; totals do not truncate semantic value. | One disclosure control and one primary action; 44px targets. | Required on bottom edge. | No horizontal overflow at 320px or 200% zoom. |
| expanded tray | below 64rem | Same inline width; maximum constrained by dynamic viewport. | Header/feedback, selected list, persistent action row. | Logical task order matches visual order. | Replaces collapsed interior while preserving same tray and toggle state. | Selected list scrolls; page scroll remains enabled. | Sticky tray; not modal or fixed overlay. | Long product and variant copy wrap; images remain bounded. | Clear, remove, collapse, and CTA remain reachable. | Bottom action clears device inset. | No body lock, clipped focus, or nested horizontal scroll. |
| empty/loading feedback | all | Intrinsic content area with minimum reservation sufficient to avoid action jump. | State replaces rows, not shell. | Feedback before footer. | Visible only for its state. | No scroll until content requires it. | In owning shell. | Skeleton is decorative; status copy wraps. | Busy action retains name and size. | Tray reservation includes safe area. | Hydration cannot create page-width overflow. |

## Critical boundaries

- Primary component transformation: test available widget widths 1023px, 1024px, and 1025px.
- Existing legacy boundary regression: test viewport widths 767px, 768px, and 769px to prove there is no duplicate sidebar/tray and no unstyled gap.
- Narrow stress: test 319px and 320px; 320px is the supported minimum and 319px may degrade only through additional wrapping, never inaccessible controls.
- Height stress: at 720px and 768px heights, verify header/action persistence and list-only scrolling.
- Container constraint: at a 600px widget container inside a wider viewport, use the tray replacement; component width, not an unrelated viewport assumption, governs viability.

## Orientation, high zoom, and opposite-viewport non-regression

- Portrait and landscape use the same available-width contract. Rotation must preserve selections, expanded state when safe, totals, and focused control identity.
- At 200% zoom, the layout must behave like a narrower available width and select the tray replacement when the sidebar can no longer satisfy its content-safe minimum.
- Reduced motion shortens or removes tray/chevron transitions while state changes remain immediate and perceivable.
- Opening the virtual keyboard must not permanently obscure the action or trap the tray; focused controls scroll into the visual viewport.
- Classic changes must not alter Standard, Compact, or Horizontal layout, selected-row behavior, mobile disclosure, or merchant tokens.
- Screenshot fact: current Classic mobile at 390x844 is a sticky tray and current desktop at 1440x900 is a sticky sidebar. Approved contract: extend the tray replacement through constrained/tablet widths below 64rem to remove the current 768–1023px ownership gap. Approved by Aditya Awasthi at 2026-08-04T09:42:38Z.
