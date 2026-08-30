---
schema_version: 1
id: shopify-app-pricing-redirect
title: Shopify App Pricing Redirect Test Spec
type: test-spec
status: active
summary: Defines secure hosted plan redirect and return verification behavior for Shopify App Pricing.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - subscriptions
  - billing
systems:
  - admin
  - shopify-partner-api
source_paths:
  - app/components/billing/UpgradeConfirmationModal.tsx
  - app/services/subscriptions/app-pricing-navigation.server.ts
  - app/services/subscriptions/shopify-app-identity.server.ts
  - app/routes/app/app.pricing.tsx
  - app/routes/app/app.billing.tsx
  - app/routes/app/app.billing.return.tsx
related_docs:
  - internal docs/Subscriptions/07-shopify-app-pricing-setup-runbook.md
tags:
  - tdd
  - shopify-app-pricing
keywords:
  - plan redirect
  - plan handle
---

# Test Spec: Shopify App Pricing Redirect

**Spec ID:** shopify-app-pricing-redirect  **Created:** 2026-08-28

## Purpose

Send merchants to Shopify-hosted plan management and verify the resulting subscription from Shopify rather than trusting redirect parameters.

## Test Cases

### Hosted plan navigation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Plan selection | Authenticated shop plus Admin-derived app handle | Store-specific Shopify-hosted pricing URL | No duplicated environment value. |
| 2 | Monthly or annual | One Growth plan with yearly option | Same hosted plan selection page | Shopify owns interval selection. |
| 3 | Current app identity | Authenticated Admin client | Shopify app GID and handle | Query `app { id handle }`. |
| 4 | Unsafe identity | Invalid shop domain or app handle | Configuration error | Prevent path injection. |
| 5 | Return hint | plan_handle query | Force provider verification | Hint is not authorization. |
| 6 | Unknown local plan | Unsupported plan value | Reject with 400 | No legacy plan aliases. |
| 7 | Pricing loader | Verified Free or Growth state | Current public usage and limit returned | Provider failure returns safe error data. |
| 8 | Billing loader | Verified Growth state | Billing interval, usage, and active status returned | Unverified state returns 500 without fabricated subscription data. |
| 9 | Manage plan | Upgrade or cancel action | Same Shopify-hosted plan management URL | No app-owned billing mutation. |
| 10 | Unknown return state | Growth hint with failed verification | Billing error redirect | Redirect hints never grant access. |
| 11 | Growth confirmation lifecycle | Modal state opens and closes | Polaris overlay opens and closes | Uses supported `showOverlay` and `hideOverlay` methods. |
| 12 | Verified return navigation | Growth, Free, or unverified provider state | Authenticated Shopify redirect to the matching Billing destination | Preserve the embedded Admin session after Shopify-hosted plan approval. |

## Acceptance Criteria

- [ ] New upgrades do not create Billing API subscriptions.
- [ ] Every merchant receives a pricing URL built from its authenticated shop and deployed app handle.
- [ ] Monthly and annual billing are options on one Shopify-managed Growth plan.
- [ ] Return handling grants access only after Partner API verification.
- [ ] Return handling keeps merchants inside the authenticated embedded Admin app.
