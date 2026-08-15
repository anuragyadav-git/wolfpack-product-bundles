---
schema_version: 1
id: shared-component-quantity-control
title: Shared Component - Quantity Control
type: component-contract
status: active
summary: Shared quantity increment/decrement control contract for selected products.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/components/quantity-control.js
  - app/assets/widgets/shared/engine/create-bundle-state.js
related_docs:
  - design-system/01-foundations/spacing-and-density.md
  - design-system/01-foundations/accessibility-foundations.md
tags:
  - component
  - quantity
  - input
keywords:
  - increment
  - decrement
  - min-max
---

# Quantity Control

## Required Behaviors

- Increment and decrement with guard rails
- Enforce min/max bounds
- Integrate with cart payload semantics
- Preserve controlled component state when asynchronous updates occur

## Accessibility

- Buttons need labels.
- Touch target size and spacing follow shared density tokens.
