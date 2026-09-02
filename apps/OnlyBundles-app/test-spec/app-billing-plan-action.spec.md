---
schema_version: 1
id: app-billing-plan-action
title: Billing Plan Action
type: test-spec
status: active
summary: Verifies that verified Free merchants can open Shopify-managed plan selection from the Billing page.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - admin
  - billing
systems:
  - app-billing-route
source_paths:
  - app/routes/app/app.billing.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - qa
  - billing
keywords:
  - upgrade
  - managed-pricing
---

# Test Spec: Billing Plan Action
**Spec ID:** app-billing-plan-action  **Created:** 2026-08-30

## Purpose

Keep the documented Billing-to-Shopify managed-pricing handoff available to verified Free merchants.

## Test Cases

### BillingPage

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Free plan billing action | Verified Free subscription | Upgrade action is rendered | Existing `upgrade` action owns the Shopify-hosted URL |
| 2 | Upgrade server action | Authenticated `intent=upgrade` POST | Current app identity resolves to Shopify App Pricing URL | No legacy Billing API fallback |

## Acceptance Criteria

- [ ] Verified Free merchants can initiate the existing managed-pricing action.
- [ ] The server continues to derive the hosted URL from the authenticated app identity.
- [ ] No subscription change occurs until the merchant acts in Shopify.
