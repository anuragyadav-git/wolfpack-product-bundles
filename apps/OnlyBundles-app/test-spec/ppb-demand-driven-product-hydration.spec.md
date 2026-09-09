---
schema_version: 1
id: ppb-demand-driven-product-hydration
title: PPB Demand-Driven Product Hydration
type: test-spec
status: active
summary: Verify that Product Page Bundle interactions hydrate only the Shopify product data required by the active step.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - storefront
systems:
  - ppb-widget
  - storefront-api
source_paths:
  - app/assets/widgets/product-page/methods/modal-state-methods.ts
  - app/assets/widgets/product-page/methods/selection-methods.ts
  - app/assets/widgets/product-page/methods/widget-misc-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - ppb
  - hydration
keywords:
  - Storefront API
  - demand-driven
---

# Test Spec: PPB Demand-Driven Product Hydration

**Spec ID:** ppb-demand-driven-product-hydration  **Created:** 2026-09-09

## Purpose

Keep Shopify Storefront API product hydration aligned with the shopper's active
PPB step. Opening, navigating, or auto-advancing the picker must fetch the
destination step without speculatively fetching another step.

## Test Cases

### ProductPageStepHydration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Open picker | Open step 0 in a multi-step bundle | Only step 0 is requested | No speculative next-step request |
| 2 | Navigate forward | Move from step 0 to step 1 | Only step 1 is requested | Current validation behavior is unchanged |
| 3 | Auto-advance | Complete step 0 and advance to step 1 | Only step 1 is requested | Deferred transition remains unchanged |

## Acceptance Criteria

- [x] PPB product requests are demand-driven by the active step.
- [x] Existing loading, failure, validation, and navigation behavior remains intact.
- [x] The widget source and generated deploy asset contain no `preloadNextStep` layer.
