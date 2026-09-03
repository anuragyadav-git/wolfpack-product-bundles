---
schema_version: 1
id: ppb-configuration-matrix
title: PPB Configuration Matrix
type: configuration-matrix
status: active
summary: PPB template and preset settings by contract source and runtime behavior.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - design-system/00-inventory/configuration-registry.yaml
  - design-system/00-inventory/template-registry.yaml
  - app/lib/bundle-config/template-selection.ts
  - app/assets/widgets/shared/template-design-system.js
related_docs:
  - app/assets/widgets/product-page/templates/registry.js
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.js
tags:
  - ppb
  - config
keywords:
  - PDP_INPAGE
  - PDP_MODAL
  - HORIZONTAL_SLOTS
  - VERTICAL_SLOTS
---

# PPB Configuration Matrix

## Required axis

- `bundleDesignTemplate`: `PDP_INPAGE | PDP_MODAL`
- `bundleDesignPresetId`: `LIST | GRID | HORIZONTAL_SLOTS | VERTICAL_SLOTS`

## Template mapping

- `PDP_INPAGE + LIST` uses `ppb.contracts.LIST`
- `PDP_INPAGE + GRID` uses `ppb.contracts.GRID`
- `PDP_MODAL + HORIZONTAL_SLOTS` uses `ppb.contracts.HORIZONTAL_SLOTS`
- `PDP_MODAL + VERTICAL_SLOTS` uses `ppb.contracts.VERTICAL_SLOTS`

## Notes

- `templateId` and `template-type` resolution should remain contract-driven.
