---
schema_version: 1
id: dashboard-media-deferral
title: Dashboard Media Readiness
type: test-spec
status: active
summary: Verifies Dashboard first-render image preloads while all visible cards render together after route readiness.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
source_paths:
  - app/routes/app/app.dashboard/dashboard-media-state.ts
  - app/routes/app/app.dashboard/DashboardPage.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - dashboard
  - media
keywords:
  - Parth.avif
  - resource-card
---

# Test Spec: Dashboard Media Readiness
**Spec ID:** dashboard-media-deferral  **Created:** 2026-06-28

## Purpose
Preload only first-viewport Dashboard media while revealing every visible Dashboard card together after route readiness.

## Test Cases
### DashboardMediaState
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Dashboard route links are built | Current Dashboard media registry | Only the first-viewport support avatar is preloaded | Avoid speculative image preloads |
| 2 | Dashboard readiness resolves | Complete Dashboard module and data | Resources card renders with the rest of the Dashboard | No idle reveal point remains |

## Acceptance Criteria
- [ ] Dashboard support avatar remains the only initial image preload.
- [ ] Resources card renders in the same content reveal as the other Dashboard cards.
- [ ] Existing Dashboard interactions remain unchanged.
