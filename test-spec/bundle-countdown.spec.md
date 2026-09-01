---
schema_version: 1
id: bundle-countdown
title: Schedule-derived Bundle Countdown
type: test-spec
status: active
summary: Defines countdown presentation that derives its only deadline from the existing offer schedule end instant.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-configure
  - widget-runtime
source_paths:
  - prisma/schema.prisma
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/parsers.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
related_docs:
  - docs/competitor-analysis/21-bundlex-urgency-swatches-tier-badges.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - countdown
  - scheduling
keywords:
  - offer ends at
  - truthful urgency
---

# Test Spec: Schedule-derived Bundle Countdown
**Spec ID:** bundle-countdown  **Created:** 2026-09-01

## Purpose

Verify that countdown configuration owns presentation only. The existing
`OfferPolicy.endsAt` UTC instant is the sole deadline; the app does not create
fixed-duration, visitor-reset, shopper-midnight, or parallel scheduling state.

## Test Cases

### CountdownConfiguration

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | New bundle defaults | Fields absent | Disabled, compact, above, hide on expiry | Safe opt-in defaults |
| 2 | Merchant configuration | Full, below, expiry message | Direct normalized fields | No JSON fallback |
| 3 | Invalid enum input | Unsupported layout/position/action | Canonical defaults | Closed option set |
| 4 | Save | Valid direct fields | Prisma update receives exact values | Deadline remains on OfferPolicy |

### CountdownRuntime

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Missing or invalid deadline | No valid `OfferPolicy.endsAt` | Countdown absent | No fabricated deadline |
| 2 | Active deadline | Future UTC instant | Remaining time derives from `Date.now()` | No decrement drift |
| 3 | Visibility resume or clock jump | Current time changes | Remaining time is recomputed | No stale elapsed counter |
| 4 | Expiry | Deadline reached | One hide, zero, or message transition | No per-second analytics |
| 5 | Accessibility | Active timer | No per-second live-region announcements | Expiry message only may be live |

## Acceptance Criteria

- [x] Direct Prisma presentation fields use documented defaults.
- [x] PPB and FPB save flows preserve one canonical presentation contract.
- [x] Runtime deadline is derived only from `OfferPolicy.endsAt`.
- [x] Desktop and mobile Chrome QA pass after the Prisma restart.
