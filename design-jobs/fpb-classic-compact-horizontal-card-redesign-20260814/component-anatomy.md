---
schema_version: 1
id: fpb-three-preset-component-anatomy
title: FPB Classic Compact Horizontal Component Anatomy
type: design-job-artifact
status: complete
summary: Maps the existing FPB product-card DOM and its shared behavior versus preset-owned presentation boundaries.
last_audited: 2026-08-14
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/shared/components/product-card.js
  - app/assets/widgets/full-page-css/templates/classic
  - app/assets/widgets/full-page-css/templates/compact/overrides.css
  - app/assets/widgets/full-page-css/templates/horizontal/overrides.css
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
  - locked-decisions.yaml
tags:
  - fpb
  - product-card
keywords:
  - component anatomy
  - ownership
---

# Component Anatomy

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 1
Artifact status: complete

## Component tree

~~~text
.bundle-widget-full-page[data-fpb-design-preset]
└── .layout-sidebar
    ├── shared category/timeline regions (frozen)
    ├── .sidebar-content (catalog region)
    │   └── .full-page-product-grid
    │       └── .product-card.bw-product-card
    │           ├── .product-image.bw-product-card__media
    │           │   ├── .bw-product-card__image
    │           │   ├── optional discount badge
    │           │   └── hover-only image overlay/magnifier
    │           └── .product-content-wrapper.bw-product-card__body
    │               ├── .product-text-container.bw-product-card__text
    │               │   ├── .product-title.bw-product-card__title
    │               │   └── optional .product-variant-row
    │               └── .product-card-price-action
    │                   ├── optional .vs-wrapper--standard
    │                   ├── .product-price-row
    │                   │   ├── .product-price
    │                   │   └── optional .product-price-strike
    │                   └── .product-card-action
    │                       ├── .product-add-btn, or
    │                       └── .inline-quantity-controls
    └── shared desktop summary or mobile tray/drawer (frozen)
~~~

## Region ownership

| Region ID | Responsibility | Semantic element | State owner | Event owner | Style owner | Token owner | Responsive replacement |
|---|---|---|---|---|---|---|---|
| `card-grid` | Arrange cards and equal-height rows | Existing list/grid container | Shared product-grid runtime | Shared grid methods | Active preset stylesheet, limited to preset-specific card arrangement | Existing grid gap and card spacing tokens | Classic 4-cap, Compact 3-cap, Horizontal 2-cap; shared shell owns summary mode |
| `card-root` | Bound one product and expose selected/unavailable state | Existing product-card element | Shared product-card renderer | Shared selection methods | Active preset stylesheet | Existing card background, radius, border, padding tokens | Same element at all widths |
| `media` | Display product image and details affordance | Existing image/link/button semantics | Shared product-card renderer | Shared details-modal flow | Active preset stylesheet | Existing media radius and card tokens | Classic/Compact vertical; Horizontal 30/70 row |
| `copy` | Product title and optional variant label | Existing text and selector markup | Shared product data and variant selector | Shared variant selector | Active preset stylesheet for wrapping and tracks | Merchant typography/color tokens | Same content; wrapping changes intrinsically |
| `price` | Current and compare-at prices | Existing price markup | Shared pricing methods | None | Active preset stylesheet for alignment only | Merchant price typography/color tokens | Same content and order |
| `action` | Add or adjust quantity | Existing native buttons | Shared selection state | Shared add/remove/quantity handlers | Active preset stylesheet for stable geometry only | Existing control-hit-target/action tokens | Same controls; no replacement |
| `variant-popover` | Choose an available variant | Existing shared selector | Shared variant state | Shared selector module | Existing preset selector rules only where already owned | Existing variant tokens | Existing mobile/desktop behavior unchanged |
| `summary-surfaces` | Display selection, validation, total, and cart action | Existing shared sidebar/tray/drawer | Shared summary state | Shared summary methods | Frozen shared styles | Shared summary tokens | Sidebar at container width >=800px; tray/drawer below 800px |

## Preset anatomy contracts

- Classic: vertical image-first card. A calm outer frame contains media, a two-line title track, optional variant track, and a stable price/action row. Four-column cap on desktop and two columns on phone remain recognizable.
- Compact: vertical image-first card with denser internal rhythm. A subtle frame replaces the loose borderless composition. Three-column cap on desktop and two columns on phone remain recognizable.
- Horizontal: one bounded row using the existing 30/70 media/content split. Title and variant occupy the upper content track; price and action share the lower track. Two-column cap applies only at and above the shared 800px shell boundary.

## Repeated, conditional, feedback, and overlay elements

- Repeated: each grid card uses the same media, copy, price, and action envelope.
- Conditional: compare-at price, discount badge, variant selector, unavailable treatment, and inline quantity controls reuse existing markup and logic.
- Feedback: hover, focus-visible, selected, unavailable, and disabled styling must stay within the existing card envelope and must not add layout height.
- Overlay: the existing desktop pointer magnifier remains hover-only. Product details modal/drawer and variant overlays are frozen shared interactions.

## Scroll, sticky, and fixed regions

The card grid itself does not become an internal scroll region. Shared desktop summary stickiness, mobile tray docking, drawer scroll-lock, safe-area padding, and selected-products scrolling remain untouched. Preset CSS must not restate these algorithms.

## Repository evidence and canonical conflict resolution

`internal docs/Architecture/Product Card Layout Contract.md` is authoritative for row stability, the 800px summary boundary, intrinsic catalog reflow, and stylesheet ownership. Existing renderer and event modules remain canonical for semantics and behavior. If the approved appearance cannot be produced by selectors already present in the preset stylesheet, stop and return to design scope; do not alter DOM or JavaScript.
