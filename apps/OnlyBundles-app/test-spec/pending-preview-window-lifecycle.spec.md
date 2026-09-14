---
schema_version: 1
id: pending-preview-window-lifecycle
title: Pending Preview Window Lifecycle Test Spec
type: test-spec
status: active
summary: Defines the reserved browser-tab lifecycle used while authenticated Admin preview preparation completes asynchronously.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
  - bundle-configure
source_paths:
  - app/lib/dashboard-preview-window.ts
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureActionController.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbPreviewReadinessHandlers.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - preview
keywords:
  - about blank
  - popup blocker
  - opener lifecycle
---

# Test Spec: Pending Preview Window Lifecycle

**Spec ID:** pending-preview-window-lifecycle  **Created:** 2026-09-10

## Purpose

Keep a browser tab created by the merchant's Preview action navigable while the
authenticated preview request completes, without retaining opener access after
the storefront or Theme Editor destination is assigned.

## Test Cases

### Reserved Preview Tab

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Reserve during user gesture | `window.open("about:blank", "_blank")` succeeds | Return the live tab without severing it early | Async preparation still owns the handle |
| 2 | Preview becomes ready | Live reserved tab and signed URL | Replace the blank location, then clear `opener` | Prevent reverse-tab access after destination assignment |
| 3 | Browser blocks reservation | `window.open` returns null | Report navigation unavailable | Caller may attempt its existing fallback |
| 4 | Preparation fails | Live reserved tab | Close the unused blank tab | Do not strand blank windows |

## Acceptance Criteria

- [x] Preview preparation retains a navigable reserved tab until destination assignment.
- [x] The destination is assigned before `opener` is cleared.
- [x] FPB, PPB, dashboard, and Design preview consumers retain their existing helper contract.
- [x] Focused tests, full unit tests, typecheck, ESLint, Graphify, and Chrome Agent-store verification pass.
