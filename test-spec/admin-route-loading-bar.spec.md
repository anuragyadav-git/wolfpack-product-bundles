---
schema_version: 1
id: admin-route-loading-bar
title: Admin Route Loading Bar
type: test-spec
status: active
summary: Verifies that Settings workspace and Analytics readiness use one accessible top-edge loading bar instead of skeleton content.
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

Keep Settings and Analytics loading feedback tied to their real Suspense readiness boundaries while removing route skeleton UI.

## Test Cases

### AdminRouteLoadingBar

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Settings workspace is pending | Settings data or workspace chunk is unresolved | One progressbar labelled Loading Settings | No timer or skeleton markup |
| 2 | Analytics dashboard is pending | Analytics data or dashboard/chart chunk is unresolved | One progressbar labelled Loading Analytics | Dashboard stays behind one readiness boundary |

## Acceptance Criteria

- [x] Settings workspace transitions use the loading bar and no card skeletons.
- [x] Analytics readiness uses the loading bar and no dashboard or chart skeletons.
- [x] The loading bar is accessible and respects reduced-motion preferences.
