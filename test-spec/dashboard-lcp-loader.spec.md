---
schema_version: 1
id: dashboard-lcp-loader
title: Dashboard Loader Readiness
type: test-spec
status: active
summary: Verifies deferred Dashboard data delivery and its single client-side readiness boundary.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
source_paths:
  - app/routes/app/app.dashboard/route.tsx
  - app/routes/app/app.dashboard/dashboard-route-readiness.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - dashboard
  - performance
keywords:
  - defer
  - route-readiness
---

# Test Spec: Dashboard Loader Readiness
**Spec ID:** dashboard-lcp-loader  **Created:** 2026-07-10

## Purpose
Stream the Dashboard route promptly while keeping its visible content behind one readiness boundary until App Embed and banner data resolve.

## Test Cases
### DashboardLoaderPerformance
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | App-embed detection is still pending | Dashboard loader request with bundle query resolved and app-embed lookup unresolved | Loader resolves the deferred payload and exposes App Embed status as a promise | Loading workspace screen remains visible |
| 2 | App Embed and banner data are ready | Both deferred payloads resolve | Route readiness resolves and complete Dashboard content renders | Prevents partial content reveal |

## Acceptance Criteria
- [ ] Dashboard loader returns its deferred response without waiting for App Embed detection.
- [ ] Visible Dashboard content waits for App Embed status, banner data, and the minimum loading-bar interval.
