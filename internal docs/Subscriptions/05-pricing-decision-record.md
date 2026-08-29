---
schema_version: 1
id: pricing-decision-record
title: Subscription Pricing Decision Record
type: decision-record
status: approved
summary: Records the approved permanent Free tier and Growth plan with monthly and annual billing plus one Shopify-managed trial.
last_audited: 2026-08-29
owners:
  - product
domains:
  - subscriptions
systems:
  - shopify-app-pricing
source_paths:
  - app/constants/plans.ts
  - internal docs/Subscriptions/03-entitlement-decision-matrix.csv
related_docs:
  - internal docs/Subscriptions/07-shopify-app-pricing-setup-runbook.md
tags:
  - pricing
  - approved
keywords:
  - monthly
  - annual
---

# Subscription Pricing Decision Record

## Approved pricing

| Field | Configuration default | Production status |
|---|---:|---|
| Free | $0 | Approved |
| Growth monthly | $19.99 USD | Approved |
| Growth annual | $199 USD | Approved |
| Annual saving | $40.88 versus twelve monthly payments, approximately 17.04% | Approved calculation |
| Growth trial | 14 days | Approved |
| Cutover policy | One atomic cutover with immediate enforcement | Approved |
| Existing billing policy | No legacy billing or migration support | Approved |

Growth is one Shopify App Pricing plan configured as monthly with a yearly option. Both billing periods grant identical entitlements. Shopify owns trial accounting, billing-period changes, and proration; the app does not maintain a second trial ledger.

## Approval gate

The product owner approved the prices and cutover direction on 2026-08-28 and the 14-day Growth trial on 2026-08-29. Partner Dashboard configuration and manual release verification remain operational gates, not pricing-decision gates.

**Owner approval:** Aditya Awasthi, 2026-08-29.
