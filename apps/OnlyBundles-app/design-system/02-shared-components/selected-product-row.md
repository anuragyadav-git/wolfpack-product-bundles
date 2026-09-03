---
schema_version: 1
id: shared-component-selected-product-row
title: Shared Component - Selected Product Row
type: component-contract
status: active
summary: Shared row contract for selected products, quantities, and inline actions.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/components/selected-product-row.js
  - app/assets/widgets/full-page/methods/footer-selection-methods.js
  - app/assets/widgets/full-page/methods/selection-navigation-methods.js
  - app/assets/widgets/product-page/methods/selection-methods.js
related_docs:
  - design-system/02-shared-components/quantity-control.md
  - design-system/02-shared-components/price-group.md
  - design-system/02-shared-components/buttons.md
tags:
  - component
  - summary
  - selected
keywords:
  - row
  - quantity
  - remove
---

# Selected Product Row

## Required Behaviors

- Render selected item with deterministic ordering
- Show quantity and actions
- Reflect real-time pricing and availability
- Support deletion and quantity adjustments with shared business methods

## Contract

- Core behavior must remain shared across FPB and PPB.
- Template-level differences are limited to density and spacing.
