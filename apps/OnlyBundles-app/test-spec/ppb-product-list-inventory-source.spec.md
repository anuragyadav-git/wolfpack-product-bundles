---
schema_version: 1
id: ppb-product-list-inventory-source
title: PPB Product List Inventory Source
type: test-spec
status: active
summary: Verifies Product Page Product List hydration preserves Storefront inventory semantics without the removed selling-plan integration payload.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - storefront
systems:
  - product-page-bundle
  - storefront-products-api
source_paths:
  - app/routes/api/api.storefront-products.tsx
  - app/assets/widgets/product-page/methods/product-data-methods.ts
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
tags:
  - ppb
  - inventory
keywords:
  - product list
  - Storefront API
---

# Test Spec: PPB Product List Inventory Source
**Spec ID:** ppb-product-list-inventory-source  **Created:** 2026-07-11

## Purpose

Verify Product Page Bundle Product List product hydration follows EB storefront inventory semantics for true Storefront API unavailability without hiding zero-quantity variants only because their quantity is zero.

## Test Cases

### ProductPageProductDataMethods
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Grouped product with unavailable first variant | First variant has `available=false`; second variant has `available=true` | Product card chooses the available variant and variant selector data excludes the unavailable variant | EB omits true unavailable variants before customer selection. |
| 2 | Individual variants include unavailable and sellable variants | One variant has `available=false`; one has `available=true`, `quantityAvailable=0` | Only the true unavailable variant is omitted; the zero-quantity sellable variant remains in Product List data | Zero quantity alone is not the same as Storefront `availableForSale=false`. |

### Storefront product APIs
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 3 | Sellable zero-quantity direct product variant | `availableForSale=true`, `quantityAvailable=0`, `currentlyNotInStock=false` | API response sets `quantityAvailable=null` and keeps `available=true` | Shopify can return zero quantity for untracked sellable variants. |
| 4 | Sellable zero-quantity collection product variant | `availableForSale=true`, `quantityAvailable=0`, `currentlyNotInStock=false` | API response sets `quantityAvailable=null` and keeps `available=true` | Collection-backed Product List data follows direct-product semantics. |
| 5 | True unavailable zero-quantity variant | `availableForSale=false`, `quantityAvailable=0` | API response keeps `quantityAvailable=0` and `available=false` | True sold-out variants remain unavailable. |
| 6 | Product with multiple variants while obsolete selling-plan scope is present | All-variants Storefront query returns variants `6` and `7`; session still contains `unauthenticated_read_selling_plans` | API response includes both variants and does not request or expose selling-plan allocations | Bundle Settings pre-order/subscription runtime removed 2026-08-13. |

## Acceptance Criteria
- [x] Focused Product Page product-data tests pass.
- [x] Storefront product API tests pass.
- [x] No CSS, class-name, source-order, or visual-placement assertions are added.
