---
schema_version: 1
id: admin-billing-lcp
title: Admin Billing LCP
type: test-spec
status: active
summary: Verifies that Billing paints useful route content before deferred subscription data resolves.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - remix
  - app-bridge
source_paths:
  - app/routes/app/app.billing_.plans.tsx
  - tests/unit/routes/admin-billing-progressive-render.test.ts
related_docs:
  - internal docs/Operations/Admin Performance.md
  - internal docs/Operations/LCP and CLS Playbook.md
tags:
  - billing
  - lcp
keywords:
  - deferred subscription
  - immediate heading
---

# Test Spec: Admin Billing LCP

**Spec ID:** admin-billing-lcp  **Created:** 2026-08-29

## Purpose

Keep the Billing route's useful title visible while subscription-dependent content resolves asynchronously.

## Test Cases

### AdminBillingProgressiveRender

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Subscription data is unresolved | Billing route renders with a pending deferred promise | The visible Billing heading and inline loading feedback render | Plan and quota content remains deferred |

## Acceptance Criteria

- [x] The visible Billing heading renders before deferred subscription data resolves.
- [x] The unresolved region uses the existing Polaris loading state.
- [ ] Direct Chrome DevTools iframe LCP p75 is strictly below 2500 ms in fresh SIT runs.
