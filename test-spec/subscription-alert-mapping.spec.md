---
schema_version: 1
id: subscription-alert-mapping
title: Subscription Alert Mapping Test Spec
type: test-spec
status: active
summary: Defines localized copy selection for typed entitlement failures shown by both bundle editors.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
systems:
  - admin
source_paths:
  - app/lib/subscriptions/alerts.ts
related_docs:
  - internal docs/Subscriptions/09-alert-and-gating-copy-inventory.md
tags:
  - tdd
  - alerts
keywords:
  - gate alert
  - billing state
---

# Test Spec: Subscription Alert Mapping

**Spec ID:** subscription-alert-mapping  **Created:** 2026-08-28

## Purpose

Ensure both bundle editors translate typed entitlement failures into consistent localized guidance.

## Test Cases

### Alert mapping

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Limit reached | `LIMIT_REACHED` | Localized public-bundle upgrade guidance | Persistent save banner. |
| 2 | Growth feature required | `ENTITLEMENT_REQUIRED` | Localized Growth proposition | Persistent save banner. |
| 3 | Billing unverified | `BILLING_UNVERIFIED` | Localized billing retry guidance | Fail closed. |
| 4 | Untyped save failure | Missing code | Localized generic save feedback | No hardcoded fallback copy. |

## Acceptance Criteria

- [ ] Message IDs are stable and merchant copy is not embedded in domain services.
- [ ] FPB and PPB save flows consume the same typed copy mapping.
