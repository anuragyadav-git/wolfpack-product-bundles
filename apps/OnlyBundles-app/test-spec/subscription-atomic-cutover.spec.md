---
schema_version: 1
id: subscription-atomic-cutover
title: Subscription Atomic Cutover Test Spec
type: test-spec
status: active
summary: Verifies that subscription UI, managed-plan navigation, and enforcement activate together with no runtime flag.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
systems:
  - subscription-enforcement
source_paths:
  - app/services/subscriptions/bundle-entitlement-gate.server.ts
related_docs:
  - internal docs/Subscriptions/11-rollout-and-rollback-runbook.md
tags:
  - tdd
  - cutover
keywords:
  - atomic cutover
  - immediate enforcement
---

# Test Spec: Subscription Atomic Cutover

**Spec ID:** subscription-atomic-cutover  **Created:** 2026-08-28

## Purpose

Ensure the released code activates every subscription surface without configuration flags, phased cohorts, or delayed enforcement.

## Test Cases

### Cutover controls

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Released code | No activation flag | UI, redirects, and blocking enabled | Immediate activation |

## Acceptance Criteria

- [ ] All listed test cases pass.
- [ ] No cohort, bypass, migration, shadow, or delayed-enforcement flag exists.
