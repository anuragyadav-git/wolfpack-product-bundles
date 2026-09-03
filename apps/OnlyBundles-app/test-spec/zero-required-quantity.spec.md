---
schema_version: 1
id: zero-required-quantity
title: Zero Required Quantity
type: test-spec
status: active
summary: Verifies that missing or explicitly zero step requirements do not force shoppers to select one product.
last_audited: 2026-07-26
owners:
  - storefront
domains:
  - bundles
systems:
  - bundle-sdk
  - bundle-configuration
source_paths:
  - app/assets/sdk/validate-bundle.js
  - app/lib/addon-step-lock.ts
  - prisma/schema.prisma
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - validation
  - quantity
keywords:
  - minQuantity
  - conditionValue
  - zero
---

# Test Spec: Zero Required Quantity

**Spec ID:** zero-required-quantity
**Created:** 2026-07-26

## Purpose

Verify that new step and step-product requirements default to zero and that a shopper can proceed
without a selection when the merchant configures a zero requirement.

## Test Cases

### Zero requirement behavior

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | SDK validates zero requirement | Empty selections and `conditionValue: 0` | Step is valid | No implicit quantity of one |
| 2 | Add-on follows optional step | Prior step has no minimum and no selections | Add-on remains unlocked | Missing minimum means zero |
| 3 | New persisted step | No explicit minimum | Database default is `0` | Applies to bundle steps and step products |

## Acceptance Criteria

- [x] Focused SDK and add-on lock tests pass.
- [x] Modified TypeScript files pass ESLint with zero errors.
- [x] SDK bundle is rebuilt from source.
