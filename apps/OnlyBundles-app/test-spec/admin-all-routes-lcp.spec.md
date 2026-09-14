---
schema_version: 1
id: admin-all-routes-lcp
title: Test Spec - Admin All Routes LCP
type: test-spec
status: active
summary: Enforces strict route-level Admin LCP, route-local state ownership, and production chunk isolation.
last_audited: 2026-09-14
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - remix
source_paths:
  - app/routes/app/app.dashboard/route.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - lcp
  - performance
keywords:
  - vendor-state
  - vendor-charts
---

# Test Spec: Admin All Routes LCP

**Spec ID:** admin-all-routes-lcp **Created:** 2026-07-30

## Purpose

Keep the authenticated Admin shell lightweight and enforce the strict app-owned LCP target across route-keyed diagnostics.

## Test Cases

### AdminAllRoutesLcp

| #   | Scenario                        | Input                                              | Expected Output                                                                                                                 | Notes                                                                                |
| --- | ------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1   | Strict LCP pass boundary        | Route samples with p75 values of 2499ms and 2500ms | 2499ms passes; 2500ms fails                                                                                                     | Target is strictly below 2500ms                                                      |
| 2   | Shared Admin shell dependencies | Production Admin layout                            | No legacy Polaris React provider, stylesheet, translations, or global Redux provider                                            | App Bridge and `polaris.js` load from the document head                              |
| 3   | Shared app bootstrap            | `/app` and `/app/dashboard` loader requests        | Neither request reads first-create eligibility                                                                                  | Eligibility remains create-handler-owned                                             |
| 4   | Route-owned state               | Dashboard, Billing, FPB configure, PPB configure   | Transient state stays in route-local React state or reducers; route data and mutations use Remix loaders, actions, and fetchers | No Admin route mounts a Redux provider or recreates a client-side server-state cache |
| 5   | Production chunk isolation      | Vite production manifest                           | No `vendor-state` asset is emitted; no embedded Admin route reaches `vendor-charts`                                             | Analytics uses dependency-free SVG funnel and sales charts                           |

## Acceptance Criteria

- [x] Route-keyed LCP p75 passes only when it is below 2500ms.
- [x] Embedded Admin routes do not load legacy Polaris React CSS.
- [x] The shared `/app` layout does not own Redux or React Polaris.
- [x] Admin routes use route-local React state and Remix data primitives without emitting `vendor-state`.
- [x] The shared app loader does not read `firstCreateTourEligible`.
- [x] Production manifest checks pass.
- [x] Analytics does not import or request `vendor-charts`.
- [x] The temporary diagnostics were removed after the measurement and optimization cycle.
