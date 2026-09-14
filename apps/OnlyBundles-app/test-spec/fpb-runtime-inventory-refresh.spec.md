---
schema_version: 1
id: fpb-runtime-inventory-refresh
title: FPB Runtime Inventory Refresh Test Spec
type: test-spec
status: active
summary: Verifies canonical FPB runtime products refresh Shopify inventory without accepting legacy StepProduct widget input.
last_audited: 2026-09-08
owners:
  - engineering
domains:
  - storefront
systems:
  - full-page-widget
source_paths:
  - app/assets/widgets/full-page/methods/product-processing-methods.ts
  - app/lib/bundle-formatter.server.ts
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - inventory
keywords:
  - StepProduct
  - runtime hydration
---

# Test Spec: FPB Runtime Inventory Refresh

**Spec ID:** fpb-runtime-inventory-refresh  **Created:** 2026-07-06

## Purpose
Verify full-page storefront product loading refreshes runtime inventory for enriched saved products when inventory tracking is enabled.

## Test Cases
### FullPageProductProcessingMethods
| # | Scenario | Input | Expected Output | Notes |
| 1 | Enriched canonical runtime product has stale availability while Storefront API reports tracked zero stock | `trackInventoryOnAddToCart=true`, formatted `steps[].products` entry, API variant `quantityAvailable=0`, `currentlyNotInStock=false` | Product is omitted from `stepProductData` and API is called | Prevents blocked-OOS products rendering as addable |
| 2 | Saved category product has stale availability while Storefront API reports tracked zero stock | `trackInventoryOnAddToCart=true`, category product ID, API variant `quantityAvailable=0`, `currentlyNotInStock=false` | Product is omitted from `stepProductData` and API is called | Matches the Classic same-shape fixture |
| 3 | Product grid expands variant cards after loading | `trackInventoryOnAddToCart=true`, grouped product with one tracked zero-stock variant and one backorderable zero-stock variant | Hard-OOS variant is omitted; backorderable variant remains with inventory metadata | Prevents category render from reintroducing blocked variants |
| 4 | Runtime inventory was fetched but stale category card lacks inventory fields | Variant card has only `id` and `available=true`; runtime inventory map says `quantityAvailable=0`, `currentlyNotInStock=false` | Variant is treated as not selectable | Covers live category DTO fallback |
| 5 | Legacy-only widget product input | Step has `StepProduct` but no canonical `products` or categories | No product request is issued and no product is rendered | Server owners must normalize persistence relations before the widget boundary |

## Acceptance Criteria

- [x] Canonical runtime products refresh inventory when tracking is enabled.
- [x] Legacy-only `StepProduct` widget input is ignored.
- [x] Focused Jest test passes.
