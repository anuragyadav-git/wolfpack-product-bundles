---
schema_version: 1
id: cart-transform-savings-format
title: Cart Transform Savings Format
type: test-spec
status: active
summary: Verifies Cart Transform honors the persisted amount-only and percentage-only savings formats.
last_audited: 2026-07-30
owners:
  - wolfpack
domains:
  - cart-transform
systems:
  - bundle-cart-transform-rs
source_paths:
  - extensions/bundle-cart-transform-rs/src/merge.rs
  - extensions/bundle-cart-transform-rs/tests/integration_test.rs
related_docs:
  - test-spec/cart-transform-discount-types.spec.md
tags:
  - tdd
  - cart-line-messaging
keywords:
  - amount_only
  - percentage_only
---

# Test Spec: Cart Transform Savings Format

**Spec ID:** cart-transform-savings-format  **Created:** 2026-07-30

## Purpose

Verify the Cart Transform consumes the exact discount-format values persisted by Admin controls.

## Test Cases

### CartTransformSavingsFormat

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Amount-only savings | Function-owner format `amount_only` | `You Save` contains only the formatted amount | Matches Admin runtime serialization. |
| 2 | Percentage-only savings | Function-owner format `percentage_only` | `You Save` contains only the formatted percentage | Matches Admin runtime serialization. |

## Acceptance Criteria

- [x] Both savings-format tests pass.
