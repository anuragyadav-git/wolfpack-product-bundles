---
schema_version: 1
id: fpb-demand-driven-product-hydration
title: FPB Demand-Driven Product Hydration Test Spec
type: test-spec
status: active
summary: Verifies that the Full Page Bundle storefront hydrates only the product data required by the active step.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/responsive-layout-methods.ts
  - app/assets/widgets/full-page/methods/validation-addons-methods.ts
  - app/assets/widgets/full-page/methods/product-grid-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - performance
keywords:
  - demand-driven hydration
  - product loading
---

# Test Spec: FPB Demand-Driven Product Hydration

**Spec ID:** fpb-demand-driven-product-hydration  **Created:** 2026-09-10

## Purpose

Keep FPB product requests coupled to the step the shopper is viewing. Future-step product data must not compete with the active catalog request or fail silently in a background prefetch layer.

## Test Cases

### FullPageBundleProductHydration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial bundle view renders | Three-step bundle with step 0 active | Only step 0 product data is requested | No speculative requests for steps 1 or 2 |
| 2 | Shopper advances to another step | Step 1 becomes active | Only step 1 product data is requested before its grid renders | Existing foreground loading and error handling remain authoritative |

## Acceptance Criteria

- [x] FPB initial rendering hydrates only the active step.
- [x] FPB step navigation hydrates only the destination step.
- [x] The unused all-step prefetch layer is removed.
- [x] Widget builds and focused behavior tests pass.
