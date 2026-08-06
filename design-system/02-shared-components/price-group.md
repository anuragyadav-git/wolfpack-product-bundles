---
schema_version: 1
id: shared-component-price-group
title: Shared Component - Price Group
type: component-contract
status: active
summary: Shared original/discount price presentation and formatting behavior.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.js
  - app/assets/widgets/shared/pricing-calculator.js
  - app/assets/widgets/full-page/shared/summary-pricing-display.js
related_docs:
  - design-system/01-foundations/typography.md
  - design-system/05-copy/fallback-rules.md
tags:
  - component
  - pricing
  - discount
keywords:
  - price
  - original
  - savings
---

# Price Group

## Required Behaviors

- Show list price and sale price when discount applies.
- Show savings (percent/amount) in a contract-stable manner.
- Preserve locale-aware formatting.
- Handle unavailable pricing states deterministically.

## Contract

- This component is shared across FPB and PPB.
- Template adapters can place and align price groups; they must not alter discount arithmetic.
