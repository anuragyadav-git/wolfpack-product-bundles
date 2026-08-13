---
schema_version: 1
id: ppb-responsive-contract
title: PPB Responsive Contract
type: responsive-contract
status: active
summary: PPB template behavior across required desktop/mobile and modal/in-page modes.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.ts
  - app/assets/widgets/product-page/methods/footer-modal-state-methods.ts
  - app/assets/widgets/shared/template-design-system.ts
  - app/assets/widgets/product-page-css/base/inpage-shared-footer.css
related_docs:
  - design-system/01-foundations/breakpoints.md
  - design-system/08-qa/visual-comparison-rubric.md
tags:
  - ppb
  - responsive
keywords:
  - PDP_INPAGE
  - PDP_MODAL
  - breakpoints
---

# PPB Responsive Contract

## Core contract

- In-page templates keep category/product flow on desktop and mobile using shared component shell.
- Modal templates use slot orientation and drawer/footer constraints and are tuned for mobile-first usage.
- In-page mobile footers remain in document flow so product rows and controls are
  never covered by the bundle summary actions.
- Product actions and quantity controls retain the shared 44px minimum target at
  every viewport.

## Verification requirement

- Confirm all four PPB templates at standard desktop/mobile viewport set in
  `design-system/01-foundations/breakpoints.md`.
