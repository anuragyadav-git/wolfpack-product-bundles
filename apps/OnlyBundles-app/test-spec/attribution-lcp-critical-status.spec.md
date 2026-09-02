---
schema_version: 1
id: attribution-lcp-critical-status
title: Attribution LCP Critical Status
type: test-spec
status: active
summary: Verifies that Analytics uses one top status banner while deferred dashboard loading preserves the critical first-paint path.
last_audited: 2026-08-25
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
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - lcp
keywords:
  - pixel-status
  - progressive-loading
---

# Test Spec: Attribution LCP Critical Status
**Spec ID:** attribution-lcp-critical-status  **Created:** 2026-07-10

## Purpose
Keep attribution's inactive-tracking state from becoming a delayed LCP-sized route body candidate.

## Test Cases
### AttributionCriticalStatus
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Pixel status resolves | Active or inactive status | Render one native UTM Pixel Tracking banner at the top | Banner owns both status states |
| 2 | Dashboard analytics are still delayed | Pending `analytics` promise | Keep the critical Analytics shell visible with one inline Polaris loading state | Pixel status does not gate dashboard data |
| 3 | Analytics contains zero values | No attributed orders | Do not add a second no-data banner | Zero-value cards communicate the state |
| 4 | Backfill completes or fails | Backfill action response | Show Shopify toast feedback | Does not stack a second page banner |

## Acceptance Criteria
- [ ] Analytics renders at most one page-level banner.
- [ ] Active and inactive tracking use the same top banner owner.
- [ ] Backfill results use Shopify toast feedback.
- [ ] The title and funnel heading render immediately while dashboard content remains deferred.
