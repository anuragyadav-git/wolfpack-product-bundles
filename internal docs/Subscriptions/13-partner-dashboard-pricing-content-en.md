---
schema_version: 1
id: partner-dashboard-pricing-content-en
title: Partner Dashboard Pricing Content - English
type: operator-handoff
status: sit-entered-prod-pending
summary: Records the English-only App Pricing values entered for SIT and approved for later production entry.
last_audited: 2026-08-29
owners:
  - product
  - engineering
domains:
  - subscriptions
systems:
  - shopify-partner-dashboard
source_paths:
  - app/constants/plans.ts
  - app/i18n/locales/en.json
related_docs:
  - internal docs/Subscriptions/07-shopify-app-pricing-setup-runbook.md
tags:
  - pricing-content
  - english
keywords:
  - published locale
  - top features
---

# Partner Dashboard Pricing Content - English

Live Partner Dashboard check on 2026-08-29 found one published listing locale: **English**, marked primary. No additional published or unpublished listing locales were shown. These values have been entered for SIT; enter the same English-only content for PROD at its cutover.

## Free plan

| Field | Value |
|---|---|
| Display name | Free |
| Plan handle | `free` |
| Billing | Free |
| Top feature 1 | One public bundle |
| Top feature 2 | Two enabled steps or categories |
| Top feature 3 | Product and full-page bundles |
| Top feature 4 | Discounts, gifts, add-ons and upsells |
| Welcome link | `/app/billing/return` |

## Growth plan

| Field | Value |
|---|---|
| Display name | Growth |
| Plan handle | `growth` |
| Billing | Monthly with yearly option |
| Monthly charge | `$19.99 USD` |
| Yearly charge | `$199 USD` |
| Free trial duration | `14` days |
| Top feature 1 | Unlimited public bundles and steps |
| Top feature 2 | All bundle templates |
| Top feature 3 | Advanced Design and analytics |
| Top feature 4 | Priority support |
| Welcome link | `/app/billing/return` |

Do not create separate Monthly and Annual plans. Shopify presents the two billing periods on this one Growth plan and owns trial accounting, proration, and billing-period changes.

## Verified dashboard identifiers

| Identifier | Value |
|---|---|
| Partner organization ID | `4162406` |
| PROD Partner app ID | `261615583233` |
| PROD App GID | `gid://shopify/App/261615583233` |
| PROD app handle | `wolfpack-product-bundles` |
| SIT Partner app ID | `299492081665` |
| SIT App GID | `gid://shopify/App/299492081665` |
| SIT app handle | `wolfpack-product-bundles-sit` |

Create the plans with the exact stable handles `free` and `growth`. Confirm those values through `activeSubscription.items[].handle` during SIT testing. They are code-owned identifiers and are not environment variables.
