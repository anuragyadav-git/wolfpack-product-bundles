---
schema_version: 1
id: ppb-category-selection-id
title: PPB Category Selection ID Hydration
type: test-spec
status: active
summary: Verifies that Product Page category filtering consumes canonical selection IDs for configured products and variants.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/product-page/methods/layout-shell-methods.ts
  - tests/unit/assets/ppb-product-list-category-filter.test.ts
  - tests/unit/assets/ppb-category-scoped-variants.test.ts
  - tests/unit/assets/ppb-product-list-category-variant-display.test.ts
related_docs:
  - internal docs/Architecture/Diagrams/Storefront Frontend Architecture.md
tags:
  - ppb
  - category-filtering
  - hydration
keywords:
  - selectionId
  - category-products
  - category-variants
---

# Test Spec: PPB Category Selection ID Hydration
**Spec ID:** ppb-category-selection-id  **Created:** 2026-08-10

## Purpose
Ensure Product Page templates match hydrated Storefront API products and variants against the canonical `selectionId` values in bundle runtime configuration.

## Test Cases
### ProductPageLayoutShellMethods
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Active category product filtering | Category products use product `selectionId` | Only products configured for the active category remain | Covers Product List and Product Grid |
| 2 | Explicit variant subset | Category product variants use variant `selectionId` | Only configured variants remain and the card uses the selected variant | Preserves semantic variant identity |
| 3 | Empty manual category | Category has no products or collections | No products render | Distinguishes empty configuration from hydration failure |
| 4 | Collection-backed category | Category has a collection | Hydrated collection products remain | Keeps the single canonical collection path |

## Acceptance Criteria
- [x] Configured category products are matched by `selectionId`.
- [x] Configured category variants are matched by `selectionId`.
- [x] Obsolete configured-reference key fallbacks are removed.
- [x] Product List hydrates configured products in live Chrome.
