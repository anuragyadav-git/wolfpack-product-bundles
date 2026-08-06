---
schema_version: 1
id: ppb-responsive-contract
title: PPB Responsive Contract
type: responsive-contract
status: active
summary: PPB template behavior across required desktop/mobile and modal/in-page modes.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.js
  - app/assets/widgets/product-page/methods/footer-modal-state-methods.js
  - app/assets/widgets/shared/template-design-system.js
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

## Verification requirement

- Confirm all four PPB templates at standard desktop/mobile viewport set in
  `design-system/01-foundations/breakpoints.md`.
