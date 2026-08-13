---
schema_version: 1
id: attribution-lcp-critical-status
title: Attribution LCP Critical Status
type: test-spec
status: active
summary: Verifies that Analytics status and deferred dashboard loading preserve the critical first-paint path.
last_audited: 2026-08-13
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
  - loading-bar
---

# Test Spec: Attribution LCP Critical Status
**Spec ID:** attribution-lcp-critical-status  **Created:** 2026-07-10

## Purpose
Keep attribution's inactive-tracking state from becoming a delayed LCP-sized route body candidate.

## Test Cases
### AttributionCriticalStatus
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Pixel is active and analytics has no data | `pixelActive=true`, `hasNoData=true` | Render the analytics no-data banner after analytics resolves | Message depends on analytics summary |
| 2 | Pixel is inactive and analytics has no data | `pixelActive=false`, `hasNoData=true` | Do not render the analytics no-data banner | Prevents a delayed inactive/no-data paragraph becoming the route LCP candidate |
| 3 | Pixel status is still checking | pending `pixelStatus` promise | Render the UTM Pixel Tracking card shell with a checking state | First paint has stable banner structure while the check runs |
| 4 | Dashboard analytics are still delayed | pending `analytics` promise | Render the critical funnel heading and shared top-edge loading bar from the route shell | Keeps the first paint lightweight without skeleton cards |

## Acceptance Criteria
- [ ] The first-load inactive tracking state is contained to the compact status card.
- [ ] The first-load status check renders the compact status card shell immediately.
- [ ] Analytics no-data copy only renders when tracking is active and analytics confirms no data.
- [ ] The route shell owns only critical first-paint markup; the full dashboard chunk owns non-critical dashboard styles.
