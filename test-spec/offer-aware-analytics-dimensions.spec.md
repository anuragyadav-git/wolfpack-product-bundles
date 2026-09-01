---
schema_version: 1
id: offer-aware-analytics-dimensions
title: Offer-Aware Analytics Dimensions
type: test-spec
status: active
summary: Defines the privacy-safe offer dimensions persisted on existing engagement and order-attribution records.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - analytics
systems:
  - bundle-engagement
  - order-attribution
source_paths:
  - app/lib/analytics/offer-dimensions.ts
  - prisma/schema.prisma
related_docs:
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
  - internal docs/Operations/App Events Taxonomy.md
tags:
  - tdd
  - analytics
keywords:
  - offerPolicyId
  - offerRuleVersion
  - offerTierId
  - offerEligibilitySource
---

# Test Spec: Offer-Aware Analytics Dimensions

**Spec ID:** offer-aware-analytics-dimensions  **Created:** 2026-08-31

## Purpose

Extend the existing `BundleEngagement` and `OrderAttribution` owners with
privacy-safe offer, rule-version, tier, and eligibility-source dimensions. Raw
tokens, URLs, customer identity, tags, geography, and purchase facts are not
part of this contract.

## Test Cases

### NormalizeOfferAnalyticsDimensions

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Complete valid dimensions | Policy ID, positive rule version, tier ID, `specific_link` | Trimmed canonical dimensions | Suitable for both analytics models |
| 2 | Missing optional dimensions | Empty object | Four null values | Bundle-only analytics remain valid |
| 3 | Invalid rule version | Zero, negative, fractional, or non-number | Null rule version | Rule versions are positive integers |
| 4 | Unsupported eligibility source | Arbitrary or sensitive string | Null source | Only privacy-safe reason categories are stored |
| 5 | Oversized identifiers | More than 128 characters | Null identifier | Bounds analytics payload and CSV cells |

### PrismaPersistence

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Engagement dimensions | Offer fields on `BundleEngagement` | Nullable direct columns plus shop/offer/date index | No parallel event table |
| 2 | Checkout dimensions | Offer fields on `OrderAttribution` | Nullable direct columns plus shop/offer/date index | Preserves historical values if a policy is later removed |

## Acceptance Criteria

- [x] Offer dimensions normalize without accepting shopper-private data.
- [x] Existing bundle-only rows remain valid with null offer dimensions.
- [x] `BundleEngagement` and `OrderAttribution` own the same direct fields.
- [x] Both models support indexed shop, offer, and date filtering.
- [x] The Prisma migration applies cleanly before runtime ingestion work begins.
