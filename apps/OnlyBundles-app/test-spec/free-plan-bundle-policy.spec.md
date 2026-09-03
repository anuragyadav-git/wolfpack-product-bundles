---
schema_version: 1
id: free-plan-bundle-policy
title: Free Plan Bundle Policy Test Spec
type: test-spec
status: active
summary: Defines deterministic and non-destructive public bundle enforcement when a shop is verified as Free.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - subscriptions
systems:
  - storefront
  - database
source_paths:
  - app/services/subscriptions/free-plan-bundle-policy.server.ts
related_docs:
  - internal docs/Subscriptions/06-single-cutover-policy.md
tags:
  - tdd
  - enforcement
keywords:
  - Free plan
  - public bundles
---

# Test Spec: Free Plan Bundle Policy

**Spec ID:** free-plan-bundle-policy  **Created:** 2026-08-28

## Purpose

Apply the approved one-public-bundle limit immediately while preserving all merchant-authored configuration.

## Test Cases

### Bundle selection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Multiple compatible bundles | Public bundles with different publication dates | Most recently published bundle retained | Deterministic |
| 2 | Growth-only public bundle | Premium template, advanced Design, or more than two steps | No retained bundle | Configuration remains Draft |
| 3 | Mixed compatibility | Compatible and Growth-only public bundles | Latest compatible bundle retained | Growth-only bundle becomes Draft |
| 4 | Failed storefront sync | Previously demoted bundle remains pending | Reconciliation retries sync | No data deletion |

## Acceptance Criteria

- [ ] Enforcement has no migration or grace-period branch.
- [ ] At most one Free-compatible bundle remains public.
- [ ] Demoted bundles become Draft and retain their configuration.
- [ ] Failed storefront synchronization remains retryable.
