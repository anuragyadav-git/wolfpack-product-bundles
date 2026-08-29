---
schema_version: 1
id: subscription-telemetry
title: Subscription Telemetry Test Spec
type: test-spec
status: active
summary: Defines privacy-safe subscription and entitlement funnel instrumentation.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - subscriptions
  - observability
systems:
  - business-events
source_paths:
  - app/services/subscriptions/subscription-telemetry.server.ts
related_docs:
  - internal docs/Operations/App Events Taxonomy.md
tags:
  - tdd
  - telemetry
keywords:
  - subscription event
  - entitlement event
---

# Test Spec: Subscription Telemetry

**Spec ID:** subscription-telemetry  **Created:** 2026-08-28

## Purpose

Record the subscription funnel and gate outcomes with approved low-cardinality dimensions and no customer PII, access tokens, or raw bundle configuration.

## Test Cases

### Event recording

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Publish blocked | Entitlement failure | Business event with plan, feature, location, action, and error code | No raw config. |
| 2 | Verification failed | Provider error | Verification event | No tokens. |

## Acceptance Criteria

- [ ] Only declared subscription event handles and dimensions compile.
- [ ] Shop domains are stored in the protected business-event column, not attributes.
