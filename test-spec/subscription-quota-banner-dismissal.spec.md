---
schema_version: 1
id: subscription-quota-banner-dismissal
title: Subscription Quota Banner Dismissal
type: test-spec
status: active
summary: Verifies that the informational Free-plan usage prompt closes when the merchant dismisses it.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - admin
  - billing
systems:
  - subscription-quota-card
source_paths:
  - app/components/billing/SubscriptionQuotaCard.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - qa
  - billing
keywords:
  - dismiss
  - usage-banner
---

# Test Spec: Subscription Quota Banner Dismissal
**Spec ID:** subscription-quota-banner-dismissal  **Created:** 2026-08-30

## Purpose

Keep the Free-plan quota prompt dismissible within the current Billing or Pricing page mount.

## Test Cases

### SubscriptionQuotaCard

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Dismiss visible usage prompt | Free plan at the public-bundle limit; merchant activates Dismiss | Usage prompt is removed from the rendered card | Does not change billing or bundle state |

## Acceptance Criteria

- [ ] The prompt renders when the Free usage threshold requires it.
- [ ] Dismiss removes the prompt for the current component mount.
- [ ] Existing localized usage and unlimited-plan behavior remains green.
