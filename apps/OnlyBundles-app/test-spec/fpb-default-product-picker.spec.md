---
schema_version: 1
id: fpb-default-product-picker
title: FPB Default Product Picker
type: test-spec
status: active
summary: Verifies that canonical App Bridge picker identifiers persist valid FPB default products.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb-configure
source_paths:
  - app/lib/bundle-config/default-products.ts
  - app/assets/widgets/full-page/methods/product-processing-methods.js
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - defaults
keywords:
  - resource-picker
  - default-products
---

# Test Spec: FPB Default Product Picker

**Spec ID:** fpb-default-product-picker  **Created:** 2026-07-30

## Purpose

Ensure products selected through the current App Bridge resource picker persist in the direct FPB contract and initialize once on the storefront.

## Test Cases

### DefaultProductPickerContract

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Canonical picker identifiers | Product and variant expose `id` GIDs | Direct default-product shape contains numeric and GraphQL IDs | Prevents selected defaults from being silently discarded |
| 2 | Existing normalized identifiers | Product exposes `graphqlId` and variant exposes `variantGraphqlId` | Existing direct default-product shape remains stable | Preserves persisted direct data |
| 3 | Picker quantity default | Picker omits a quantity | Persisted direct default uses `requiredQuantity: 1` | Matches the EB direct contract |
| 4 | Storefront direct identifiers | Runtime product uses `graphqlId` and variant uses `variantGraphqlId` | Storefront normalizes the canonical variant and selects it once | Rejects obsolete picker-only identifier assumptions |

## Acceptance Criteria

- [x] Canonical `id` picker output is normalized.
- [x] Existing direct-identifier normalization still passes.
- [x] Missing picker quantity normalizes to one.
- [x] Canonical direct defaults initialize in all four FPB presets.
