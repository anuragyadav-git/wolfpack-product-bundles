---
schema_version: 1
id: ppb-bundle-picker-modal-redesign-visual-qa
title: PPB Bundle Picker Modal Visual QA Report
type: visual-qa-report
status: draft
summary: Preserves revision-4 visual evidence while revision-5 filled-slot wrapping and Remove-action evidence awaits implementation.
last_audited: 2026-08-21
owners:
  - Aditya Awasthi
domains:
  - visual-testing
systems:
  - ppb-product-page-widget
source_paths:
  - app/assets/widgets/product-page-css
related_docs:
  - design-jobs/ppb-bundle-picker-modal-redesign-20260821/browser-test-report.md
tags:
  - ppb
  - visual-qa
keywords:
  - responsive-grid
  - quantity-action-equality
---

# Visual QA Report

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 5
Artifact status: draft

Revision-5 acceptance requires full natural title wrapping, content-driven slot height, a separate outlined icon-and-text Remove action, no overlap, and no horizontal overflow in Horizontal and Vertical Slots at all five required viewports. The table below records predecessor revision-4 results only.

| Region | Expected | Direct Chrome result | Status | Evidence |
|---|---|---|---|---|
| Picker shell | Fixed 85dvh with fixed header/footer and catalog-only scrolling | Exact at all five required viewports | passed | `qa/screenshots/horizontal-*`, `vertical-*` |
| Catalog tracks | 5 / 4 / 2 / 2 / 2 without sparse-row stretching | Exact responsive track counts and zero overflow | passed | responsive matrix screenshots |
| Card hierarchy | Image, title, price, optional native selector, action | Stable across desktop and mobile | passed | Horizontal and Vertical matrices |
| Quantity/action | Equal full-width footprint and control height | 204x44 each at 1440; 143x44 each at 390 | passed | `qa/screenshots/quantity-action-equality-*` |
| Footer summary | Content-sized icon/count/divider/price pill capped within footer | Grows from 122.45-148.75px for fixture content and 157.33-189.19px under long-value stress; aligned and contained | passed | direct Chrome 1440/1280/768/390/360 geometry |
| Product details | Full-width second sheet, constrained content, 88dvh ceiling, internal scroll | Passed desktop and mobile | passed | browser interaction record |
| Validation feedback | Dismissible body toast offset above footer | Visible, operable, and unobscured | passed | browser semantics and geometry |
| Product List/Grid | No visual or behavioral regression | Passed all five viewports | passed | `qa/screenshots/product-list-*`, `product-grid-*` |

No responsive overflow, duplicate action, obscured focus, stretched sparse row, or PPB-owned Lighthouse contrast/semantics failure remains. No visual mask or waiver was used.
