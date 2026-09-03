---
schema_version: 1
id: ppb-state-matrix
title: PPB State Matrix
type: state-matrix
status: active
summary: Required PPB storefront state model across in-page and modal variants.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - design-system/04-ppb/family-contract.md
  - design-system/00-inventory/state-registry.yaml
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.js
  - app/assets/widgets/product-page/templates/registry.js
related_docs:
  - design-system/00-inventory/state-coverage.csv
  - design-system/08-qa/accessibility-matrix.md
tags:
  - ppb
  - states
keywords:
  - template type
  - slots
  - list
  - grid
---

# PPB State Matrix

## Core PPB States

- `template resolution`
- `in-page vs modal mode`
- `slot orientation`
- `selection drawer/open state`
- `footer messaging`
- `error feedback`

## Template coverage

- All PPB states are resolved via shared contract (`TemplateDesignSystem.ppb`) and
  the product-page methods that set `data-ppb-template-type` / `data-ppb-design-preset`.

## Evidence references

- `app/assets/widgets/product-page/methods/config-lifecycle-methods.js`
- `app/assets/widgets/product-page/templates/registry.js`
- `app/assets/widgets/product-page/methods/footer-modal-state-methods.js`
