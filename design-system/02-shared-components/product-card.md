---
schema_version: 1
id: shared-component-product-card
title: Shared Component - Product Card
type: component-contract
status: active
summary: Shared product card behavior and shared state dependencies.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/components/product-card.js
  - app/assets/widgets/full-page/methods/product-card-footer-methods.js
  - app/assets/widgets/product-page/methods/selection-methods.js
related_docs:
  - design-system/README.md
tags:
  - component
  - product-card
  - shared
keywords:
  - product card
  - cta
  - quantity
---

# Product Card

- Shared rendering source: `app/assets/widgets/shared/components/product-card.js`
- Runtime states:
  - icon CTA mode
  - text CTA mode
  - disabled
  - selected
