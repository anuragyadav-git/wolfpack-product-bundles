---
schema_version: 1
id: analytics-offer-performance-card
title: Analytics Offer Performance Card
type: test-spec
status: active
summary: Verifies that Offer performance acts as an integrated analytics filter without duplicating bundle funnel metrics.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
  - analytics
systems:
  - attribution
source_paths:
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
  - app/routes/app/app.attribution/OfferAnalyticsCard.tsx
  - tests/unit/routes/app.attribution.offer-analytics-card.test.ts
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - analytics
  - admin
keywords:
  - offer-performance
  - screen-gutters
  - duplicate-metrics
---

# Test Spec: Analytics Offer Performance Card

**Spec ID:** analytics-offer-performance-card  **Created:** 2026-09-01

## Purpose

Integrate Offer performance into the Analytics content shell and keep it focused
on filtering and offer-policy context rather than repeating funnel outcomes.

## Test Cases

### OfferAnalyticsCard

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | A selected offer has policy metadata and funnel results | Selected offer with rule, eligibility, tiers, and metrics | Filter and policy metadata render; engagement, cart, order, and revenue metrics do not render | Behavioral content contract |
| 2 | Analytics renders at desktop and mobile widths | Settled advanced Analytics page | Offer card aligns with the shared Analytics gutters and remains responsive | Direct Chrome visual QA; no styling unit test |

## Acceptance Criteria

- [x] Offer performance is inside the shared Analytics content stack.
- [x] The card retains the offer selector and unique policy metadata.
- [x] The card does not repeat funnel engagement, cart, checkout, or revenue metrics.
- [x] Desktop layout and settled-state content ownership are verified directly in Chrome.
- [ ] Mobile layout is verified directly in Chrome when resizing is available.
