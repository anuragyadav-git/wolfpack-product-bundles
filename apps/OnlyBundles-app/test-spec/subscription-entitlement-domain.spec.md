---
schema_version: 1
id: subscription-entitlement-domain
title: "Test Spec: Subscription Entitlement Domain"
type: test-spec
status: active
summary: Behavior contract for Free and Growth plans, bundle requirements, and typed entitlement failures.
last_audited: 2026-08-28
owners:
  - wolfpack-engineering
domains:
  - subscriptions
systems:
  - admin
  - storefront
source_paths:
  - app/lib/subscriptions/entitlements.ts
related_docs:
  - internal docs/Subscriptions/04-subscription-architecture-adr.md
tags:
  - tdd
  - entitlements
keywords:
  - free plan
  - growth plan
---

# Test Spec: Subscription Entitlement Domain

**Spec ID:** subscription-entitlement-domain  **Created:** 2026-08-28

## Purpose

Define the stable plan and entitlement behavior before billing-provider or route integration.

## Test Cases

### PlanEntitlements

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Free plan limits | `FREE` | One public bundle, two steps, basic templates and Design | Drafts remain unlimited |
| 2 | Growth intervals | Monthly and annual Growth | Identical entitlement maps | Price and interval do not affect access |
| 3 | Public bundle counting | Active, unlisted, draft, archived | Active and unlisted count | Same bundle is counted once |
| 4 | FPB step requirement | Three enabled FPB steps | Growth step entitlement required | Disabled steps do not count |
| 5 | PPB step requirement | Three enabled PPB steps | Growth step entitlement required | Applies to both builders |
| 6 | Premium template | Non-Free FPB or PPB template | Premium-template entitlement required | Standard and Product List remain Free |
| 7 | Advanced Design | Advanced Design differs from defaults | Advanced-Design entitlement required | Brand colors and typography are Free |
| 8 | Typed denial | Missing entitlement or exceeded limit | Stable error code and safe payload | No merchant-authored content included |

## Acceptance Criteria

- [ ] All listed test cases pass.
- [ ] Monthly and annual Growth access is identical.
- [ ] No entitlement check depends on price or display labels.
- [ ] Bundle selling plans and custom code are not treated as Growth requirements.
