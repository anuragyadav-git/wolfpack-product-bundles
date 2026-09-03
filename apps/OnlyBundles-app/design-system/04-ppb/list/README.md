---
schema_version: 1
id: ppb-list-template
title: PPB List Adapter
type: template-contract
status: active
summary: PPB List template contract.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.ts
  - app/assets/widgets/product-page/templates/cascade-template.ts
  - app/assets/widgets/product-page-css/templates/inpage-cascade.css
  - app/assets/widgets/product-page-css/base/inpage-shared-footer.css
related_docs: []
tags:
  - ppb
  - list
  - template
keywords:
  - LIST
---

# PPB List

- Contract source: `TemplateDesignSystem.ppb.contracts.LIST`.
- Uses compact product rows with a 44px minimum add/quantity action target.
- Keeps its mobile selected-items and cart footer in normal document flow so the
  footer cannot cover product rows inside narrow Shopify product columns.
- Must render without horizontal overflow at `390x844` and `1440x900`.
