---
schema_version: 1
id: offer-recurring-schedule-runtime
title: Offer Recurring Schedule Runtime
type: test-spec
status: active
summary: Defines timezone-safe weekly and monthly offer recurrence across Admin persistence and storefront decisions.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - offers
systems:
  - offer-policy
  - storefront-runtime
source_paths:
  - app/lib/offer-policy-decision.ts
  - app/lib/offer-policy-admin.ts
  - app/lib/bundle-configure-loader.server.ts
  - app/routes/app/shared/OfferOperationsSection.tsx
related_docs:
  - internal docs/Architecture/Database Schema.md
  - docs/competitor-analysis/20-bogos-personalization-analytics-offer-operations.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - recurrence
  - scheduling
keywords:
  - daylight saving time
  - next transition
---

# Test Spec: Offer Recurring Schedule Runtime

**Spec ID:** offer-recurring-schedule-runtime  **Created:** 2026-09-01

## Purpose

Evaluate weekly and monthly offer windows directly from normalized policy data
at request time. Shopify owns the shop timezone; Wolfpack persists that IANA
identifier with the local calendar rule and does not rely on a transition job
to decide storefront eligibility.

## Test Cases

### OfferScheduleDecision

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Always mode | Inactive one-shot values remain populated | Offer is active with no transition | Mode is authoritative |
| 2 | One-time mode | UTC start/end instants | Inclusive start and exclusive end | Existing behavior remains canonical |
| 3 | Weekly DST transition | America/New_York Sunday window crossing spring DST change | Wall-clock window resolves to correct UTC instants | Use maintained timezone primitives |
| 4 | Between weekly runs | Valid rule outside its daily window | Scheduled with next local run converted to UTC | No timer/job is required |
| 5 | Monthly missing date | Anchor on day 31 during February | February is skipped; next run is March 31 | Never clamp merchant intent |
| 6 | Stop after runs | Weekly rule after its final completed window | Expired with no next transition | Runs count actual occurrences |
| 7 | Stop on date | Next occurrence would be after the inclusive termination date | Expired with no next transition | Last allowed date may still run |
| 8 | Invalid persisted rule | Missing/invalid timezone, window, or recurrence field | Fail closed as invalid | Never expose an offer from malformed policy |

### OfferScheduleAdmin

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Shopify timezone default | New policy plus Shopify shop IANA timezone | Admin defaults recurrence timezone to the shop value | No browser timezone fallback |
| 2 | Recurring save | Complete weekly/monthly form state | Normalized typed mutation data | Local date and minute fields stay separate |
| 3 | Invalid mode fields | Missing anchor/window or contradictory termination | Field-specific validation issue | No partial policy write |
| 4 | Inactive configured values | Switching schedule mode | Values remain configured but only selected mode is effective | Supports reversible merchant edits |

### ConfigureShopTimezone

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Shopify shop configuration | Admin GraphQL shop response | Currency and `ianaTimezone` are returned together | Shopify is the sole timezone source |
| 2 | Missing timezone | Incomplete Shopify response | Loader fails explicitly | Never infer from server/browser timezone |

## Acceptance Criteria

- [x] Resolver tests cover DST, skipped monthly dates, and both termination modes
- [x] Admin validation produces only normalized typed schedule data
- [x] Configure loaders use Shopify's `shop.ianaTimezone` without fallback
- [x] FPB and PPB use the same schedule state, controls, and Save Bar lifecycle
- [x] Storefront discovery evaluates recurrence at request time
- [x] Focused tests, lint, build, and desktop/mobile storefront SIT Chrome QA pass

## SIT QA Evidence

- PPB recurring state saved as a weekly `00:00`–`23:59` window in
  `America/New_York`, then survived a cache-bypassing Admin reload as active.
- FPB and PPB Admin configuration surfaces both rendered the shared scheduling
  controls after cache-bypassing reloads.
- FPB and PPB storefronts rendered after Cache Storage clearing and desktop and
  iPhone 14-sized hard reloads.
- Shopify Admin replaced the embedded app iframe with `about:blank` under true
  mobile device emulation, so Admin-mobile visual inspection remains blocked by
  the host surface rather than treated as application evidence.
