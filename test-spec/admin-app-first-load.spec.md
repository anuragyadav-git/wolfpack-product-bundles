---
schema_version: 1
id: admin-app-first-load
title: Admin App First Load Test Spec
type: test-spec
status: active
summary: Verifies that the authenticated app entry renders stable loading content while client-side destination routing resolves.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - remix
source_paths:
  - app/routes/app/app._index.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - first-load
keywords:
  - app-index
  - skeleton
---

# Test Spec: Admin App First Load

**Spec ID:** admin-app-first-load  **Created:** 2026-07-30

## Purpose

Keep the embedded app iframe visibly stable while `/app` resolves the merchant's authenticated destination.

## Test Cases

### AdminAppFirstLoad

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Authentication destination | Auth parameters and first-create eligibility | Onboarding or dashboard destination | Existing routing contract |
| 2 | Destination pending | Initial server/client render | Accessible route-shaped loading content | Must not return a blank iframe |

## Acceptance Criteria

- [x] The route never renders a blank initial state.
- [x] Focused unit tests pass.
