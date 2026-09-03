---
schema_version: 1
id: canonical-selection-zero-quantity-defaults
title: Canonical Selection IDs and Zero Quantity Defaults
type: test-spec
status: active
summary: Verifies canonical storefront selection IDs and preserves merchant-configured zero quantity requirements.
last_audited: 2026-07-26
owners:
  - storefront
domains:
  - bundles
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/
  - app/lib/bundle-config/
  - prisma/schema.prisma
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - storefront
  - selection-id
  - quantity
keywords:
  - selectionId
  - defaultRequiredQuantity
  - minQuantity
---

# Test Spec: Canonical Selection IDs and Zero Quantity Defaults

**Spec ID:** canonical-selection-zero-quantity-defaults
**Created:** 2026-07-26

## Purpose

Verify that storefront selections use the normalized `selectionId` contract and that missing or
explicitly zero merchant quantity requirements remain zero instead of becoming one.

## Test Cases

### Storefront quantity and selection contracts

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Missing step minimum | Step without a configured minimum | Required quantity is `0` | The shopper may proceed without selecting a product |
| 2 | Zero direct-default quantity | Direct default product with required quantity `0` | Product is not preselected | Zero is preserved through normalization |
| 3 | Canonical selection lookup | Normalized product and variant records | Runtime reads and writes only `selectionId` | Legacy ID aliases are not consulted |
| 4 | Summary capacity | Steps with zero and positive requirements | Slot capacity equals configured requirements | No implicit one-item slot is added |

## Acceptance Criteria

- [ ] Focused behavior tests pass.
- [ ] Raw widget sources pass `node --check`.
- [ ] Modified source files pass ESLint with zero errors.
- [ ] Generated widget bundles are rebuilt from source.
