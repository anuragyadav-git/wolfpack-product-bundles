---
schema_version: 1
id: ppb-grid-template
title: PPB Grid Adapter
type: template-contract
status: active
summary: PPB Grid template contract.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.ts
  - app/assets/widgets/product-page/templates/grid-template.ts
  - app/assets/widgets/product-page-css/templates/inpage-grid.css
related_docs:
  - design-system/02-shared-components/buttons.md
  - design-system/04-ppb/responsive-contract.md
tags:
  - ppb
  - grid
  - template
keywords:
  - GRID
---

# PPB Grid

- Contract source: `TemplateDesignSystem.ppb.contracts.GRID`.
- Runtime selection: `PDP_INPAGE + GRID`.
- Uses a three-column in-page product grid on wider containers and a two-column
  grid at mobile widths.
- Product media remains square while titles are clamped to two lines so cards
  sharing a row keep equal heights before and after selection.
- Product add actions, selected quantity controls, the selected-items toggle,
  and the primary bundle CTA retain the shared 44px minimum interaction target.
- Mobile removes the internal grid scroller and lets the product grid remain in
  document flow without horizontal overflow.
- The selected-items drawer is shared with Product List and remains outside the
  product-card height envelope.
