---
schema_version: 1
id: admin-route-loading-bar
title: Admin Route Loading Bar
type: test-spec
status: active
summary: Verifies that Settings workspace and Analytics readiness use one accessible shared top-edge loading bar with continuous pending feedback.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - settings
  - analytics
source_paths:
  - app/components/AdminRouteLoadingBar.tsx
  - app/routes/app/app.settings.tsx
  - app/routes/app/app.additional-configurations.tsx
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - loading
keywords:
  - progressbar
  - suspense
  - skeleton
---

# Test Spec: Admin Route Loading Bar

**Spec ID:** admin-route-loading-bar  **Created:** 2026-08-13

## Purpose

Keep Settings and Analytics loading feedback tied to their real Suspense readiness boundaries while removing route skeleton UI and preserving visible activity until content is ready.

## Test Cases

### AdminRouteLoadingBar

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Settings landing page is pending | Settings data or loading-bar fill is unresolved | One progressbar labelled Loading Settings | Landing cards remain hidden |
| 2 | Settings workspace is pending | Settings workspace chunk is unresolved after a card selection | One progressbar labelled Loading Settings | No skeleton markup |
| 3 | Loading bar fill is in progress | Fewer than 800 milliseconds elapsed | Content stays pending | Bar completes before content is revealed |
| 4 | Analytics dashboard is pending | Analytics data, status, or dashboard/chart chunk is unresolved | Only one progressbar labelled Loading Analytics | Title, funnel header, status banner, and dashboard stay behind one readiness boundary |

## Acceptance Criteria

- [x] The Settings landing page stays behind the shared loading bar until its deferred data is ready.
- [x] Settings workspace transitions use the loading bar and no card skeletons.
- [x] Analytics readiness uses the loading bar and no dashboard or chart skeletons.
- [x] The loading bar is accessible and respects reduced-motion preferences.
- [x] The shared bar continues to show activity if route readiness takes longer than its initial fill.
