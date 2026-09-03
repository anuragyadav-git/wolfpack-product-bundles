---
schema_version: 1
id: subscription-entitlement-service
title: "Test Spec: Subscription Entitlement Service"
type: test-spec
status: active
summary: Central service behavior for managed-provider refresh, persistent caching, and resolved capabilities.
last_audited: 2026-08-28
owners:
  - wolfpack-engineering
domains:
  - subscriptions
systems:
  - billing
  - database
source_paths:
  - app/services/subscriptions/subscription-entitlement-service.server.ts
related_docs:
  - internal docs/Subscriptions/04-subscription-architecture-adr.md
tags:
  - tdd
  - cache
keywords:
  - entitlement resolver
  - persistent snapshot
---

# Test Spec: Subscription Entitlement Service

**Spec ID:** subscription-entitlement-service  **Created:** 2026-08-28

## Purpose

Specify the single application service used by loaders, actions, jobs, and storefront publishers.

## Test Cases

### EntitlementService

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Fresh cache | Recent managed snapshot | Provider is not called | Normal loader path |
| 2 | Forced refresh | Fresh cache plus `forceRefresh` | Managed provider called and saved | High-impact path |
| 3 | Provider outage | Failed refresh plus recent paid snapshot | Growth outage grace | No false downgrade |
| 4 | Unknown state | Failed refresh with no paid snapshot | No entitlements | Premium mutation must fail closed |

## Acceptance Criteria

- [ ] All listed test cases pass.
- [ ] Cache lifetime and outage grace are independent.
- [ ] The service returns one stable client-safe context.
- [ ] Provider implementations are injected and do not import Shopify authentication.
