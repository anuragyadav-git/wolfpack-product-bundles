---
schema_version: 1
id: fpb-ppb-step-title-responsive-contract
title: FPB and PPB Step Title Responsive Contract
type: design-contract
status: complete
summary: Defines content-aligned Step Title sizing, wrapping, spacing, and preview parity from narrow mobile through wide desktop.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - responsive-design
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/state-matrix.md
  - app/assets/widgets/full-page-css/base/steps-header-banners.css
  - app/assets/widgets/full-page-css/shared/responsive-layout.css
  - app/assets/widgets/product-page-css/base/layout-steps-summary.css
  - app/assets/widgets/product-page-css/base/bottom-sheet-modal.css
related_docs:
  - .agents/skills/storefront-design-director/references/responsive-design-contract.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - breakpoint
  - safe-area
  - preview-parity
---

# Responsive Contract

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

## Required viewports and container widths

| ID | Width | Height | Placement width | Purpose | Required states |
|---|---|---|---|---|---|
| V-01 | 320 | 720 | Full available content track | Narrow wrapping and overflow stress | Populated, empty, long content |
| V-02 | 390 | 844 | Settings Design primary mobile logical viewport | Primary mobile storefront and preview parity | Populated, active-step change, PPB picker |
| V-03 | 768 | 1024 | Tablet/narrow drawer boundary | PPB modal boundary and FPB tray layout | Populated, long content, picker |
| V-04 | 799 / 800 / 801 | Flexible bundle container | FPB summary tray/sidebar transformation | Populated, active-step change |
| V-05 | 1280 | 800 or 1136 | Desktop storefront or Settings Design logical canvas | Primary desktop alignment and preview parity | All ordinary states |
| V-06 | 1440 | 900 | Wide desktop | Maximum heading scale and readable measure | Populated, long content |

## Region transformations

| Region | Range | Size | Layout | Order | Visibility or replacement | Scroll | Sticky or fixed | Text and image | Controls and spacing | Safe area | Overflow |
|---|---|---|---|---|---|---|---|---|---|---|---|
| FPB-TITLE | All widths | Intrinsic block width within catalog; responsive 18–24 px type | Block inside active catalog | After step navigation; before categories, banner, search, and products | Present only for non-empty Step Title; no replacement | Existing catalog scroll owner | Neither | Left aligned; weight 700; line-height 1.25; natural wrapping; readable measure without constraining catalog | Uses catalog inline padding; downstream gap approximately 12–16 px and smaller than upstream navigation separation | Existing catalog safe-area behavior | `overflow-wrap:anywhere`; no clamp, fixed height, or horizontal scroll |
| FPB categories with title | All widths | Existing category control size | Existing wrap/scroll behavior inside catalog | Immediately after title | Unchanged controls | Existing | Neither | Existing labels | Remove redundant top margin when directly following title; retain downstream margin | Existing | Existing category overflow behavior |
| PPB in-page title | All widths | Intrinsic section width; responsive 18–24 px type | Block inside active section | After Step Name navigation; before category controls and products | Present only for non-empty Step Title | Existing page/section owner | Neither | Left aligned; weight 700; line-height 1.25; natural wrapping | Existing section gap owns separation | Existing | `overflow-wrap:anywhere`; no clamp or fixed height |
| PPB picker title | Up to 767 px | Width equals picker product-grid content inset; responsive minimum type | First block in scrollable dialog body | After fixed/header navigation; before product grid | Present only for non-empty Step Title | Scrolls with dialog body | Neither | Left aligned; natural wrapping | 20 px inline inset matching mobile grid; compact top and bottom spacing | Existing dialog bottom safe area unchanged | No horizontal overflow |
| PPB picker title | 768 px and above | Width equals picker product-grid content inset; responsive type up to 24 px | First block in dialog body | Same | Same | Scrolls with body | Neither | Same | Inline inset uses the same responsive `clamp(20px, 5vw, 65px)` as product grid | Not applicable | No horizontal overflow |
| PREVIEW-RENDERER | 390 mobile / 1280 desktop logical canvases | Exact production geometry before outer scaling | No replacement tree | Same production order | Same production conditional visibility | Existing frame/root scroll | No new sticky/fixed behavior | Same production font size and wrapping | Same production spacing | Device wrapper remains outside iframe | Outer scaling must not alter logical wrapping or alignment |

## Critical boundaries

- FPB summary transformation: verify bundle container 799, 800, and 801 px. Heading stays in the catalog owner when sidebar becomes tray or vice versa.
- PPB drawer boundary: verify 767, 768, and 769 px. Body heading inset continues to match the product grid.
- Narrow content stress: verify 320 px and a long unbroken title without horizontal overflow.

## Orientation, high zoom, and opposite-viewport non-regression

- Portrait and landscape use the same heading node; only existing layout owners reflow.
- At 200% zoom the title grows with rem-based type, wraps naturally, and does not cause two-dimensional page scrolling.
- Desktop sidebar alignment must remain correct after mobile changes; mobile content alignment must remain correct after desktop changes.
- Settings Design outer canvas scaling is not a responsive breakpoint input. Assertions use the iframe's logical 1280 x 1136 or 390 x 844 viewport.
