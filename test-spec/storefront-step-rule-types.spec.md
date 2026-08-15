---
schema_version: 1
id: storefront-step-rule-types
title: Storefront Step Rule Types Test Spec
type: test-spec
status: active
summary: Verifies Quantity, Amount, and Weight step-rule enforcement and storefront toast messaging.
last_audited: 2026-08-13
owners:
  - storefront
domains:
  - storefront
systems:
  - condition-validator
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/condition-validator.ts
  - app/assets/widgets/full-page/methods/selection-navigation-methods.ts
  - app/assets/widgets/product-page/methods/modal-state-methods.ts
  - app/assets/widgets/product-page/methods/product-data-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - step-rules
keywords:
  - amount rule
  - weight rule
  - condition toast
---

# Test Spec: Storefront Step Rule Types

**Spec ID:** storefront-step-rule-types  **Created:** 2026-08-13

## Purpose

Apply the same storefront rule enforcement contract to Quantity, Amount, and
Weight while preserving the correct metric and merchant-configured toast copy.

## Test Cases

### Metric enforcement and messaging

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Non-default variant amount exceeds a maximum | Variant price above Amount rule | Selection rejected | Uses variant price, not card default |
| 2 | Non-default variant weight exceeds a maximum | Variant grams above Weight rule | Selection rejected | Uses normalized variant weight |
| 3 | Amount or Weight navigation fails | Unsatisfied rule | Metric-specific toast | Uses active language override |
| 4 | Product Page weight hydration | Variant weight in Shopify units | Weight stored in grams | Supports validation math |

## Acceptance Criteria

- [x] Amount and Weight totals include nested selected variants.
- [x] Upper-bound violations are rejected before selection state changes.
- [x] Quantity, Amount, and Weight use their matching configurable toast copy.
- [x] Product Page product data preserves normalized variant weight.
