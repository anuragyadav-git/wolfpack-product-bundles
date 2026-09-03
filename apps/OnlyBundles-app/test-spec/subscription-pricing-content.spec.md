---
schema_version: 1
id: subscription-pricing-content
title: Subscription Pricing Content Test Spec
type: test-spec
status: active
summary: Defines behavior-level pricing data consistency with centralized Free and Growth entitlements.
last_audited: 2026-08-29
owners:
  - product
  - engineering
domains:
  - subscriptions
systems:
  - admin
source_paths:
  - app/constants/pricing-data.ts
  - app/utils/pricing.ts
related_docs:
  - internal docs/Subscriptions/08-app-store-pricing-content-delta.md
tags:
  - tdd
  - pricing-content
keywords:
  - feature comparison
  - plan claims
---

# Test Spec: Subscription Pricing Content

**Spec ID:** subscription-pricing-content  **Created:** 2026-08-28

## Purpose

Keep the in-app comparison, value propositions, FAQ, and quota messages aligned with one-public-bundle Free and unlimited Growth without revenue or order caps.

## Test Cases

### Pricing data

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Public bundle comparison | Pricing data | Free 1; Growth unlimited | Public bundles, not Draft count. |
| 2 | Merchandising | Pricing data | Included in both | Discounts, gifts, add-ons, upsells stay Free. |
| 3 | Advanced surfaces | Pricing data | Design/analytics differentiated | Approved gates only. |
| 4 | Free limit message | 1 of 1 | Growth offers unlimited public bundles | No 20-bundle claim. |
| 5 | Free usage rendering | 0 of 1 | Localized usage sentence | Translation keys never reach merchant UI. |
| 6 | Growth prices in browser code | Shared plan constants | $19.99 monthly and $199 annual | No Node-only environment lookup. |
| 7 | Growth trial | One Growth plan | 14 trial days | Shopify tracks consumed trial days. |
| 8 | Growth quota display | Internal unlimited sentinel | Merchant sees Unlimited | Never expose the sentinel number. |

## Acceptance Criteria

- [ ] Pricing data contains no revenue threshold or finite Growth bundle cap.
- [ ] FAQ explains that incompatible public bundles become Draft without deleting configuration.
- [ ] The quota card renders localized usage copy.
- [ ] Shared plan constants use the approved browser-safe prices.
- [ ] Growth communicates the Shopify-managed 14-day trial.
