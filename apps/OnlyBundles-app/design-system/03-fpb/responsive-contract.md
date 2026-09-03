---
schema_version: 1
id: fpb-responsive-contract
title: FPB Responsive Contract
type: responsive-contract
status: active
summary: FPB template behavior across viewport and presentation breakpoints.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
source_paths:
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
  - app/assets/widgets/shared/template-design-system.js
related_docs:
  - design-system/01-foundations/breakpoints.md
  - design-system/08-qa/visual-comparison-rubric.md
tags:
  - fpb
  - responsive
keywords:
  - desktop
  - mobile
  - summary mode
---

# FPB Responsive Contract

## Core contract

- Desktop: side-panel summary for supported widths.
- Mobile: tray summary for compact/mobile states.
- Contracted state (`summary.mode`) controls rendering behavior per preset.

## Verification requirement

- Confirm each preset renders correctly at breakpoints defined in
  `design-system/01-foundations/breakpoints.md`.
