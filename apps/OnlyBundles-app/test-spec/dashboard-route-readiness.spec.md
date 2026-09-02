---
schema_version: 1
id: dashboard-route-readiness
title: Dashboard Route Readiness
type: test-spec
status: active
summary: Verifies that Dashboard content paints before noncritical status and proxy-banner lookups settle.
last_audited: 2026-08-25
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
  - app/routes/app/app.dashboard/DashboardDeferredProxyHealthBanner.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - loading
  - dashboard
keywords:
  - Loading your workspace
  - progressive loading
---

# Test Spec: Dashboard Route Readiness
**Spec ID:** dashboard-route-readiness  **Created:** 2026-08-13

## Purpose
Keep useful Dashboard content on the initial render while noncritical status checks update their owned warning surfaces asynchronously.

## Test Cases
### DashboardRouteReadiness
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Proxy-health data remains pending | Dashboard bundles are loaded and the deferred banner promise is unresolved | Dashboard content renders without a proxy warning | Proxy health is not page-critical |
| 2 | Proxy-health resolves unhealthy | Deferred banner data has `proxyHealthy=false` | Proxy warning renders | Existing merchant warning remains |
| 3 | App-embed client check is pending | No live status has resolved | Dashboard renders while the App Embed Status banner shows a native Polaris spinner and loading description | Prevents false enabled or disabled feedback |
| 4 | App-embed client check resolves disabled | Live status is false | Dashboard warning and preview safeguards use disabled state | Existing setup guard remains |
| 5 | Dashboard bundle list loads | Active, draft, and unlisted bundles exist | Query selects only fields rendered by the Dashboard | Avoids loading the unused pricing relation on the critical path |
| 6 | App-embed banner hydrates | The dismissible banner is server-rendered, then hydrated in the browser | Hydration completes without a prop mismatch | Keeps the native dismiss action client-safe |

## Acceptance Criteria
- [x] Dashboard content does not wait for proxy-health banner data.
- [x] Dashboard content does not wait for the app-embed status lookup.
- [x] The unresolved App Embed Status banner shows native Polaris loading feedback.
- [x] Proxy and app-embed warnings appear after their owned checks resolve.
- [x] Dashboard resources remain part of the initial Dashboard render.
- [x] App Embed Status banner hydration does not emit a prop mismatch.
