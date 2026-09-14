---
schema_version: 1
id: sdk-pricing-operator-contract
title: SDK Pricing Operator Contract
type: test-spec
status: active
summary: Verify that the public SDK type accepts only the canonical pricing-operator vocabulary.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - storefront
systems:
  - storefront-sdk
source_paths:
  - types/wolfpack-bundles.d.ts
related_docs:
  - internal docs/Features/Pricing Pipeline.md
  - internal docs/Architecture/Bundle Field Ownership.md
tags:
  - sdk
  - pricing
keywords:
  - pricing operators
  - TypeScript
---

# Test Spec: SDK Pricing Operator Contract

**Spec ID:** sdk-pricing-operator-contract  **Created:** 2026-09-09

## Purpose

Keep the public SDK declaration aligned with the runtime pricing ABI. Pricing
rules accept only `gte`, `gt`, `lte`, `lt`, and `eq`; the separate long-form
step-condition vocabulary must not leak into pricing types.

## Test Cases

### PublicSdkPricingOperators

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Canonical pricing operators | One SDK rule per canonical operator | Every rule type-checks and retains its operator | Covers all five runtime operators |
| 2 | Step-condition operator used as pricing operator | `equal_to` in an SDK pricing rule | TypeScript rejects the assignment | Prevents contract drift between step conditions and pricing |

## Acceptance Criteria

- [x] The public SDK declaration accepts all five canonical pricing operators.
- [x] The public SDK declaration rejects long-form step-condition operators.
