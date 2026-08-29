---
schema_version: 1
id: fpb-ppb-step-title-component-anatomy
title: FPB and PPB Step Title Component Anatomy
type: design-contract
status: complete
summary: Defines canonical rendering, semantic, state, style, and preview ownership for the active Step Title across FPB and PPB.
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
  - app/assets/widgets/product-page/methods/dom-methods.ts
  - app/assets/widgets/product-page-css/base/layout-steps-summary.css
  - app/assets/widgets/product-page-css/base/bottom-sheet-modal.css
  - app/routes/app/app.settings/storefront-preview-fixtures.ts
  - app/routes/root/settings-design-preview-frame/route.tsx
related_docs:
  - .agents/skills/storefront-design-director/references/code-ownership-and-handoff.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - anatomy
  - ownership
  - preview-parity
---

# Component Anatomy

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

## Component tree

~~~text
Storefront bundle renderer
├── FPB full-page root
│   ├── Step navigation [Step Name]
│   ├── Active catalog region
│   │   ├── Step content heading [Step Title]
│   │   ├── Categories / banner / search
│   │   └── Product grid
│   └── Summary sidebar or mobile tray
├── PPB in-page root (Product List / Product Grid)
│   ├── Step navigation [Step Name]
│   └── Active selection section
│       ├── Step content heading [Step Title]
│       ├── Categories
│       └── Product list or grid
└── PPB slot root (Horizontal / Vertical Slots)
    ├── Slot-group identity [Step Name]
    └── Product picker dialog for active step
        ├── Dialog navigation/header [Step Name]
        └── Dialog body
            ├── Step content heading [Step Title]
            └── Product grid

Settings Design preview frame
└── Deterministic fixture [distinct Step Name + Step Title]
    └── Exact production renderer tree above
~~~

## Region ownership

| Region ID | Responsibility | Semantic element | State owner | Event owner | Style owner | Token owner | Responsive replacement |
|---|---|---|---|---|---|---|---|
| FPB-NAV | Compact step identity and navigation | Existing buttons/list semantics | FPB current step and accessibility rules | Existing timeline handlers | Existing timeline CSS | Existing navigation tokens | Existing mobile timeline behavior |
| FPB-TITLE | Present the configured title once for the active catalog | Contextual heading, implemented as `h2` within the widget | Active FPB step `pageTitle` | None; updates on existing step render | Full-page Step-header base CSS; content-column spacing owners | Existing bundle primary text color; new geometry is component-owned | Same semantic node reflows and wraps inside mobile catalog padding |
| PPB-NAV | Compact step identity in Grid/Cascade and picker navigation | Existing buttons/tabs | Active PPB step and completion state | Existing step-flow handlers | Existing Grid/Cascade/modal navigation CSS | Existing navigation tokens | Existing responsive navigation behavior |
| PPB-SLOT-LABEL | Identify each slot group before opening a picker | Existing group label | Step `name` | Existing slot triggers | Modal-slot template CSS | Existing primary text color | Existing slot orientation behavior |
| PPB-TITLE | Present configured title once in active in-page body or picker body | Contextual heading, implemented as `h2` | Active PPB step `pageTitle` | None; updated by existing step render or picker product render | Shared PPB Step-content heading rule plus template/body spacing owners | Existing bundle primary text color; component-owned responsive geometry | Same semantic node reflows and wraps; picker body uses grid-aligned inset |
| PREVIEW-FIXTURE | Exercise label/title separation deterministically | Data only | Template fixture builder | Preview protocol initialization | None | None | Same fixture rendered at 1280 x 1136 and 390 x 844 |
| PREVIEW-RENDERER | Display exact production bundle UI | Production nodes above | Production controllers | Existing preview protocol and surface focus | Production CSS manifests only | Production token runtime | Existing preview scale/device wrapper; no separate Step Title replacement |

## Repeated, conditional, feedback, and overlay elements

- Step Title is conditional on a non-empty trimmed `pageTitle`; no fallback to Step Name is allowed in the content-heading role.
- Step Name falls back only to the existing generated `Step N` identity when the configured name is absent.
- FPB renders one title for the active catalog.
- PPB in-page templates render one title for the active step body.
- PPB slot templates retain repeated Step Name group labels, while Step Title appears once inside the active product-picker body.
- Empty Step Title removes the semantic node and spacing rather than hiding an empty box.

## Scroll, sticky, and fixed regions

- The heading belongs inside the existing scroll owner of its product content; it does not become sticky or fixed.
- FPB summary sidebar/mobile tray behavior is unchanged.
- PPB picker body remains the scroll owner; the Step Title scrolls naturally with the product grid and is not duplicated in the fixed dialog header.
- Settings Design canvas scrolling, fitting, and general-store context remain unchanged.

## Repository evidence and canonical conflict resolution

- `renderFullPageLayout` currently inserts the title before the two-column wrapper. The canonical fix moves the title and its directly related category tabs into the catalog section so content owns alignment.
- `_createGridStepHeader` and `_createCascadeStepFlowHeader` currently resolve `pageTitle || name`; this conflicts with locked decision D-002. They must resolve Step Name only.
- `_createInpageStepSection` currently suppresses the body title during multi-step flow and falls back to Step Name. It must render a non-empty Step Title independently from navigation chrome.
- `_createModalSlotStepSection` currently uses Step Title as a repeated slot-group label. It must use Step Name; the picker body becomes the Step Title owner.
- The Settings Design frame already imports production controllers and stylesheet manifests. Adding preview-only title markup or CSS is prohibited. Only deterministic fixture copy may remain preview-specific.
- Impact analysis: the FPB renderer touches the `bundle-widget-full-page.js Widget Source` god node and the full-page widget community. PPB changes touch the product-page layout/template community. Fixture changes touch the `settings-design-preview-frame/route.tsx` community. Downstream risk is limited to step navigation labels, active content headings, template spacing, and built widget assets.
