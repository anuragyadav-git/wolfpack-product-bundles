---
schema_version: 1
id: shopify-platform-research-log
title: Shopify Subscription Platform Research Log
type: research-log
status: active
summary: Records official Shopify contracts used for App Pricing and subscription implementation decisions.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
systems:
  - shopify-partner-api
source_paths:
  - app/services/subscriptions/shopify-app-pricing.server.ts
related_docs:
  - internal docs/Subscriptions/04-subscription-architecture-adr.md
tags:
  - shopify-docs
  - research
keywords:
  - activeSubscription
  - Partner API
---

# Shopify Subscription Platform Research Log

| Date checked | Documentation title | API version | Constraint | Implementation consequence |
|---|---|---|---|---|
| 2026-08-28 | [Shopify App Pricing](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing) | Current | Shopify hosts plan selection; redirect supplies `plan_handle` and optional shop hints | Remove new Billing API charge creation and verify the return through Partner API |
| 2026-08-28 | [Active subscription](https://shopify.dev/docs/api/partner/latest/active-subscription) | Latest; implementation pins 2026-07 | `activeSubscription(appId, shopId)` is canonical and returns null without an active managed contract | Null maps to Free because managed pricing is the only supported billing system |
| 2026-08-28 | [Partner API reference](https://shopify.dev/docs/api/partner/unstable) | Implementation pins 2026-07 | Requests use organization ID plus `X-Shopify-Access-Token`; Manage apps permission is required | Store Partner credentials only in server environment configuration |
| 2026-08-28 | [Shopify App Pricing migration preparation](https://shopify.dev/changelog/prepare-your-app-for-migration-to-shopify-app-pricing) | 2026 | Draft plans can be generated and tested before publication | Configure and test SIT plans before the atomic cutover |
| 2026-08-28 | [Shopify App Pricing expansion](https://shopify.dev/changelog/shopify-app-pricing-charge-for-usage-recurring-subscriptions-or-both) | 2026 | Shopify App Pricing replaces app-owned Billing API flows | Remove Billing API routes, handlers, webhooks, and local charge authority |
| 2026-08-28 | [Managed pricing planHandle](https://shopify.dev/changelog/new-planhandle-field-managed-pricing) | 2025-04+ | Stable handles identify configured pricing items/plans | Map configured Free/Growth handles to internal stable PlanCode values |
| 2026-08-29 | [Public and private plans](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing/plans) | Current | One plan can use monthly billing with a yearly option and a configured trial | Use one Growth plan, not separate monthly and annual plans |
| 2026-08-29 | [Offer free trials](https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing/subscription-billing/offer-free-trials) | Current | Shopify tracks consumed trial days over 180 days | Configure 14 days in Shopify and do not build a local trial ledger |
| 2026-08-29 | [Active subscription](https://shopify.dev/docs/api/partner/latest/active-subscription) | 2026-07 | Public app plus Manage apps permission required; trial state exposes `trialEndsAt` | SIT draft public app is eligible; existing provider already reads trial state |

App Pricing no longer sends managed subscription lifecycle webhooks after April 28, 2026. Reconciliation and authenticated return verification therefore own current state. Development stores in the same Partner organization can test eligible plans without production charges.
