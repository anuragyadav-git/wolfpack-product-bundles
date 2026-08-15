---
schema_version: 1
id: ppb-family-contract
title: PPB Family Contract
type: family-contract
status: active
summary: Defines PPB contract-resolved behavior across in-page and modal entrypoints.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.js
  - app/assets/widgets/product-page/templates/registry.js
  - app/assets/widgets/product-page/templates/modal-slot-template.js
  - app/assets/widgets/product-page/templates/cascade-template.js
related_docs:
  - design-system/README.md
  - test-spec/product-page-bundle-template-design-verification.spec.md
tags:
  - ppb
  - family-contract
  - templates
keywords:
  - product page bundle
  - ppp
  - in-page
  - modal
---

# PPB Family Contract

- Source: shared template contract under `TemplateDesignSystem.ppb`.
- Canonical templates: `GRID`, `LIST`, `HORIZONTAL_SLOTS`, `VERTICAL_SLOTS`.
- Resolver: `TemplateDesignSystem.ppb.resolveByRuntimeContext` (`resolvePpbTemplate`).
