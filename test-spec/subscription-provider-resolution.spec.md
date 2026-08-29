---
schema_version: 1
id: subscription-provider-resolution
title: "Test Spec: Subscription Provider Resolution"
type: test-spec
status: active
summary: Verification precedence, outage grace, and Shopify App Pricing mapping for subscription state.
last_audited: 2026-08-30
owners:
  - wolfpack-engineering
domains:
  - subscriptions
systems:
  - shopify-partner-api
  - billing
source_paths:
  - app/services/subscriptions/subscription-resolution.server.ts
  - app/services/subscriptions/shopify-app-pricing.server.ts
  - app/routes/app/app.pricing.tsx
related_docs:
  - internal docs/Subscriptions/04-subscription-architecture-adr.md
tags:
  - tdd
  - shopify-app-pricing
keywords:
  - activeSubscription
  - outage grace
---

# Test Spec: Subscription Provider Resolution

**Spec ID:** subscription-provider-resolution  **Created:** 2026-08-28

## Purpose

Prove that Shopify remains the billing source of truth while paid merchants are protected from false-Free classification.

## Test Cases

### SubscriptionResolution

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Managed monthly Growth | Active configured App Pricing item | Growth monthly | Entitlements equal annual |
| 2 | Managed annual Growth | Active configured App Pricing item | Growth annual | Entitlements equal monthly |
| 3 | Verified Free | Managed response has no paid contract | Free | Single provider authority |
| 4 | Provider outage | Recent active Growth snapshot | Growth in outage grace | Maximum 24 hours |
| 5 | Expired outage grace | Old active snapshot | Unknown | Never silently downgrade |
| 6 | App Pricing request | Partner API config and shop GID | Versioned authenticated GraphQL request | No Admin token used |
| 7 | Unknown item handle | Active contract with unrecognized item | Unknown | Fails closed |
| 8 | No-charge Growth trial | Active Growth contract with `trialEndsAt`, no current cycle, and an inactive price record | Growth | The active contract and stable item handle are authoritative; Shopify owns consumed trial accounting |
| 9 | Provider configuration | Environment with Partner token | Token only | App identity comes from Admin; handles and API coordinates are code-owned |
| 10 | Provider verification unavailable | Unknown entitlement state | Verification error without a current Free plan or usable quota | Unknown must never be presented as verified Free |

## Acceptance Criteria

- [ ] All listed test cases pass.
- [ ] A provider error never resolves directly to Free.
- [ ] The Pricing surface never presents an Unknown provider state as Free.
- [ ] A verified managed absence maps to Free.
- [ ] Partner credentials are validated server-side and never returned.
