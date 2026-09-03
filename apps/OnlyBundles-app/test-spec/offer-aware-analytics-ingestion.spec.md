---
schema_version: 1
id: offer-aware-analytics-ingestion
title: Offer-Aware Analytics Ingestion Test Spec
type: test-spec
status: active
summary: Defines the behavior contract for carrying privacy-safe offer dimensions from storefront decisions through Shopify cart lines into engagement and order attribution.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - analytics
  - storefront
systems:
  - bundle-widget
  - web-pixel
  - attribution-api
source_paths:
  - app/lib/offer-policy-decision.ts
  - app/assets/widgets/shared/engine/cart-submit.ts
  - app/routes/api/api.attribution.engagement.tsx
  - app/routes/api/api.attribution.tsx
  - extensions/wolfpack-utm-pixel/src/index.ts
related_docs:
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
  - internal docs/Architecture/Database Schema.md
  - internal docs/Shopify Integration/Web Pixels.md
tags:
  - tdd
  - analytics
  - offers
keywords:
  - offer-policy-id
  - rule-version
  - tier-id
  - checkout-line-properties
---

# Test Spec: Offer-Aware Analytics Ingestion

**Spec ID:** offer-aware-analytics-ingestion  **Created:** 2026-09-01

## Purpose

Prove that Wolfpack records only normalized, privacy-safe offer dimensions while using Shopify checkout line-item properties as the canonical completed-order handoff.

## Test Cases

### OfferAnalyticsIngestion

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Runtime decision marker | Policy with link, schedule, or priority settings | Stable policy ID, rule version, and safe eligibility source | No raw link token |
| 2 | Bundle without an offer policy | Null policy | Offer dimensions remain null | Bundle-only analytics stays valid |
| 3 | Shopify cart-line metadata | Bundle marker and reached pricing tier | Private line properties contain normalized bundle and offer dimensions | Uses line properties exposed by `checkout_completed` |
| 4 | Engagement ingestion | Signed app-proxy payload with valid dimensions | Normalized fields persist on `BundleEngagement` | Cross-shop guard remains unchanged |
| 5 | Invalid engagement dimensions | Arbitrary or oversized values | Invalid values persist as null | No identity or raw condition data |
| 6 | Completed checkout ingestion | Matching bundle line with Shopify properties | Matching `OrderAttribution` row receives offer dimensions | Revenue and UTM behavior remains unchanged |
| 7 | Completed checkout without metadata | Matching bundle line without offer properties | Offer dimensions remain null | Supports ordinary bundle orders |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] No raw specific-link token or customer identity is persisted
- [x] Existing bundle-only engagement and attribution payloads remain accepted
- [x] Checkout dimensions are accepted only from a line explicitly marked with the matched bundle ID
- [x] Shopify Web Pixel forwards line-item properties without adding a second persistence channel
