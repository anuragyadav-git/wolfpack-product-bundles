---
schema_version: 1
id: foundation-z-index-and-overlays
title: Z-Index and Overlay Foundations
type: design-foundation
status: active
summary: Shared stacking and overlay policy for widget popovers, trays, and toast states.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/shared/template-design-system.js
related_docs:
  - design-system/01-foundations/modal.md
  - design-system/01-foundations/spacing-and-density.md
tags:
  - z-index
  - overlay
  - modal
keywords:
  - stacking
  - tray
  - backdrop
---

# Z-Index and Overlay Foundation

## Principles

- Shared overlays and modals are resolved through a consistent stacking model.
- Do not use arbitrary integer values per template.
- Preserve source-order semantics when possible.

## Overlay Layers (Planned)

- base
- sticky controls
- tray / side panel
- toast and alerts
- modal backdrop
- modal content
- loading veil

## Validation

- Confirm no overlay interaction breaks clickability or focus under cross-template variants.
