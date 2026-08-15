---
schema_version: 1
id: design-system-ownership-map
title: Design System Ownership Map
type: design-system
status: active
summary: Maps template-contract ownership between shared contracts, registry, and runtime renderers.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb
  - ppb
source_paths:
  - app/assets/widgets/shared/template-design-system.js
  - app/assets/widgets/full-page/templates/registry.js
  - app/assets/widgets/product-page/templates/registry.js
related_docs:
  - design-system/README.md
  - design-system/design-system-manifest.yaml
tags:
  - ownership
keywords:
  - contract ownership
  - template registry
---

# Design System Ownership Map

- Shared contract source: `app/assets/widgets/shared/template-design-system.js`
- Shared preset marker: `app/assets/widgets/shared/full-page-preset.js`
- FPB runtime resolution: `app/assets/widgets/full-page/methods/runtime-cart-settings-methods.js`
- FPB responsive + summary behavior: `app/assets/widgets/full-page/methods/responsive-layout-methods.js`, `mobile-summary-methods.js`, `side-panel-methods.js`
- PPB template resolution: `app/assets/widgets/product-page/templates/registry.js`
