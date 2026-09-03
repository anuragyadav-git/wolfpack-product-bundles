---
schema_version: 1
id: ppb-copy-matrix
title: PPB Copy Matrix
type: copy-matrix
status: active
summary: PPB copy surfaces and contract ownership across in-page and modal templates.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - design-system/00-inventory/copy-registry.yaml
  - app/assets/widgets/product-page/templates/cascade-template.js
  - app/assets/widgets/product-page/methods/selection-methods.js
related_docs:
  - design-system/05-copy/placeholder-contract.md
  - design-system/05-copy/fallback-rules.md
tags:
  - ppb
  - copy
keywords:
  - summary title
  - labels
  - locale
---

# PPB Copy Matrix

## Canonical PPB copy surfaces

- Summary title and related bundle copy resolved in runtime methods.
- In-page/modal variants share the copy contract and resolution.

## Controls

- Copy must map to registry entries in `design-system/00-inventory/copy-registry.yaml`.
- New template-specific strings should be introduced only with registry updates.
