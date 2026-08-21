---
schema_version: 1
id: storefront-design-director-component-anatomy-template
title: Component Anatomy Template
type: design-job-template
status: active
summary: Defines named regions and semantic, state, style, event, and responsive ownership.
last_audited: 2026-08-21
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/component-anatomy.md
related_docs:
  - .agents/skills/storefront-design-director/references/code-ownership-and-handoff.md
tags:
  - template
keywords:
  - anatomy
  - ownership
---

# Component Anatomy

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 6
Artifact status: complete

## Component tree

~~~text
Bundle picker dialog
├── backdrop
└── 85dvh sheet
    ├── header: handle, title, step rail, categories, close
    ├── catalog scroll region: loading/error/empty/product grid
    │   └── compact card: image-details trigger, title, price, native variant selector, action
    ├── filled slot: image, bounded identity area, price, overlaid cross-badge Remove action
    └── footer: selection summary, previous/next, validation feedback

Product details dialog (stacked above picker)
├── topmost backdrop
└── full-width sheet, max 88dvh
    └── constrained scrolling content: gallery, title, price, description, native variant selector, quantity, Add/Update
~~~

## Region ownership

| Region ID | Responsibility | Semantic element | State owner | Event owner | Style owner | Token owner | Responsive replacement |
|---|---|---|---|---|---|---|---|
| picker | Top-layer selection task | `div[role=dialog]` labelled by current title | modal-state-methods.ts | widget-misc-methods.ts | bottom-sheet-modal.css | existing PPB merchant variables | Same dialog; bottom sheet at every width |
| header | Context, navigation, close | heading, tabs, buttons | modal-methods.ts | modal-methods.ts | modal-shell-tabs.css | existing type/color variables | Mobile current-step title replaces desktop rail |
| catalog | Products and transient feedback | list/grid of product controls | modal-methods.ts | modal-methods.ts | modal-product-grid.css | product-card tokens | Two columns through tablet; intrinsic 4-5 desktop |
| footer | Selection summary and progression | buttons and status | modal-state-methods.ts | modal-state-methods.ts | modal-footer-empty-toast.css | existing button variables | Centered 270px mobile, 300px desktop |
| card media | Only product-details trigger plus gallery affordance | labelled button-like media region | modal-methods.ts | modal-methods.ts | modal-product-grid.css | shared product-card tokens | Hover/focus magnifier; persistent touch badge |
| native variant | Change active card context without selection mutation | labelled native `select` | modal-methods.ts | modal-methods.ts | modal-product-grid.css | form-control tokens | Visible label desktop; visually hidden label mobile |
| card action | Add, quantity, or maximum-reached remove-all | button or quantity group | pure card-presentation helper plus selection methods | modal-methods.ts | modal-product-grid.css | button/quantity tokens | Same semantics at every width |
| filled-slot remove | Remove one selected slot product | product-specific labelled native button over the slot | selection methods | inpage-render-methods.ts | modal-slots.css | existing action/icon/surface tokens | Compact cross badge in the slot corner with a 44px minimum pointer target at every width |
| details | Editable quick-shop for originating slot | labelled modal dialog | BundleProductModal PPB mode | BundleProductModal | bottom-sheet-modal.css and mobile-drawers.css | existing modal/product tokens | Same bottom sheet at every width; constrained inner column |

## Repeated, conditional, feedback, and overlay elements

Product cards repeat from existing data and preserve variant, quantity, inventory, subscription, compare-at-price, and selected states. Filled slots use a responsive maximum height and an overlaid cross badge that removes the selected product without activating slot replacement. Product names wrap normally and visually clamp only when they reach the cap; the complete name remains in the control's accessible name and product-details surface. Loading, empty, fetch-error, and validation feedback reuse existing copy and behavior. Only product details nests above the picker. Horizontal/Vertical no longer open a PPB mobile variant drawer because the native selector stays in-card.

## Scroll, sticky, and fixed regions

Both sheets are fixed to the viewport bottom. Picker header/footer remain non-scrolling and only its catalog scrolls. Details owns its own internal vertical scroll. The document remains locked until both layers close; the topmost sheet alone contains focus.

## Repository evidence and canonical conflict resolution

`dom-methods.ts` owns the shared PPB picker DOM; `modal-state-methods.ts` owns picker lifecycle/focus; `modal-methods.ts` owns modal cards, native variant context, and event delegation; `BundleProductModal` owns editable details; `drawer-layer-manager.ts` owns stacked dismissal/scroll lifetime; raw product-page CSS owns presentation. The shared product-card magnifier markup is reused, but FPB presentation is not changed. No template fork, runtime-injected layout style, or in-page behavior change is permitted.
