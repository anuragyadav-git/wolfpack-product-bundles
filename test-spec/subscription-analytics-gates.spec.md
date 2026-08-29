---
schema_version: 1
id: subscription-analytics-gates
title: Subscription Analytics Gates Test Spec
type: test-spec
status: active
summary: Defines Free summary analytics and Growth-only advanced analytics actions.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
  - analytics
systems:
  - admin
source_paths:
  - app/lib/subscriptions/analytics-entitlements.ts
  - app/routes/app/app.attribution.tsx
related_docs:
  - internal docs/Subscriptions/03-entitlement-decision-matrix.csv
tags:
  - tdd
  - analytics
keywords:
  - analytics summary
  - export gate
---

# Test Spec: Subscription Analytics Gates

**Spec ID:** subscription-analytics-gates  **Created:** 2026-08-28

## Purpose

Keep a 30-day bundle activity summary on Free while enforcing advanced ranges, drill-downs, custom UTM configuration, backfill, and export on the server for Growth.

## Test Cases

### Analytics access

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Free summary | Free entitlements | Summary mode | 30-day fixed window. |
| 2 | Growth monthly | Growth monthly | Advanced mode | Full analytics. |
| 3 | Growth annual | Growth annual | Advanced mode | Same features. |
| 4 | Free export | Export mutation | Typed entitlement denial | Server enforced. |
| 5 | Unknown billing | Advanced mutation | Billing-unverified denial | Fail closed. |
| 6 | Unknown billing | Analytics loader | Fixed 30-day summary only | Advanced data stays closed. |
| 7 | Unexpected entitlement error | Advanced mutation | Error propagates and no analytics query runs | Never fail open. |

## Acceptance Criteria

- [ ] Free receives useful 30-day totals without detailed campaign or bundle rows.
- [ ] Advanced mutations cannot be bypassed with direct POST requests.
