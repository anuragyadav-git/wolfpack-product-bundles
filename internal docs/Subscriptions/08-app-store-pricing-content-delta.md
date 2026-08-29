---
schema_version: 1
id: app-store-pricing-content-delta
title: App Store Pricing Content Delta
type: content-audit
status: sit-entered-prod-pending
summary: Reconciles the English pricing claims entered for SIT with the equivalent production content still pending.
last_audited: 2026-08-29
owners:
  - product
domains:
  - subscriptions
systems:
  - shopify-app-store-listing
source_paths:
  - app/constants/plans.ts
  - app/i18n/locales/
related_docs:
  - internal docs/Subscriptions/03-entitlement-decision-matrix.csv
  - internal docs/Subscriptions/07-shopify-app-pricing-setup-runbook.md
tags:
  - listing
  - pricing-copy
keywords:
  - feature claims
  - locales
---

# App Store Pricing Content Delta

## Code-derived plan bullets

Free: one public bundle, two enabled steps or categories, FPB and PPB, all
merchandising features, brand colors and typography, a fixed 30-day activity
summary, and standard support.

Growth: unlimited public bundles and steps, all supported templates, advanced
Design controls, advanced analytics, and priority support. Monthly and annual
use the same bullets.

## Known repository deltas

| Surface | Current/previous claim | Approved entitlement | Change required | Owner |
|---|---|---|---|---|
| In-app locale copy | Grow, 10/20 bundles, `$500/month` revenue threshold, double-revenue language | Growth, 1/unlimited public, no revenue/order cap | Replace inaccurate claims in all six Admin locales | Engineering/product |
| Billing API endpoints | New subscriptions created manually | New selection hosted by Shopify App Pricing | Remove app-owned billing endpoints | Engineering |
| Pricing screenshots | Repository screenshot reference exists; pricing media was not changed | No price embedded; no inaccurate Free claims | Inspect media before publication if pricing appears in it | Product |
| Published listing locales | English only; primary | English needs accurate pricing description | Enter the approved handoff content | Product |
| Help documentation | Not audited outside repository | Must match matrix | Produce claim inventory before launch | Product/support |

The application locale cards now remove the revenue threshold and send merchants to Shopify's single Growth plan, where Shopify offers monthly or annual billing and owns the 14-day trial. The approved content from `13-partner-dashboard-pricing-content-en.md` has been entered for SIT; apply the same content to PROD during its App Pricing setup.

Do not redesign screenshots in this project. Replace media only if the current
asset contains pricing or materially implies an entitlement that is no longer
true, and retain a rollback copy outside the deployed repository.
