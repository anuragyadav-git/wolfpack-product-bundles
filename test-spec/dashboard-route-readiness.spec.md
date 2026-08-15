---
schema_version: 1
id: dashboard-route-readiness
title: Dashboard Route Readiness
type: test-spec
status: active
summary: Verifies that Dashboard content is revealed only after its data and shared loading-bar interval are ready.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
source_paths:
  - app/routes/app/app.dashboard/route.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.dashboard/DashboardStatusGrid.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - loading
  - dashboard
keywords:
  - Loading your workspace
  - AdminRouteLoadingBar
---

# Test Spec: Dashboard Route Readiness
**Spec ID:** dashboard-route-readiness  **Created:** 2026-08-13

## Purpose
Keep the complete Dashboard behind one readiness boundary and replace dashboard skeletons with a shared loading bar and centered workspace message.

## Test Cases
### DashboardRouteReadiness
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | One readiness dependency remains pending | Resolved App Embed status and loading interval with unresolved banner data | Dashboard readiness remains pending | Prevents partial Dashboard content |
| 2 | Every readiness dependency resolves | Resolved App Embed status, banner data, and loading interval | Dashboard readiness resolves with both data payloads | Complete content can render together |
| 3 | Dashboard is pending | Loading workspace fallback | Shared progress bar and `Loading your workspace` message render | No Dashboard skeleton is rendered |
| 4 | Theme-extension client check is pending after route readiness | App Embed status banner with `loading=true` | The actual banner renders | Server readiness owns the loading transition |

## Acceptance Criteria
- [ ] Dashboard data and the minimum loading-bar interval share one readiness boundary.
- [ ] Loading state contains the shared top-edge loading bar and centered workspace message.
- [ ] No App Embed banner skeleton renders after Dashboard readiness.
- [ ] Dashboard resources render with the rest of the Dashboard instead of after an idle delay.
