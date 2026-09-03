---
schema_version: 1
id: dashboard-storefront-setup-layout
title: Dashboard storefront setup layout
type: test-spec
status: draft
summary: Lock dashboard layout order and storefront setup actionable status behavior for the redesign.
last_audited: 2026-07-31
owners:
  - aditya
domains:
  - admin
systems:
  - wolfpack-admin
source_paths:
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.dashboard/DashboardStatusGrid.tsx
related_docs:
  - tests/unit/routes/dashboard-page-layout.test.ts
  - tests/unit/routes/dashboard-storefront-setup-card.test.ts
tags:
  - dashboard
keywords:
  - storefront-setup
  - actionability
  - dashboard-layout
---
# Test Spec: Dashboard storefront setup layout
**Spec ID:** dashboard-storefront-setup-layout  **Created:** 2026-07-31

## Purpose
Keep the dashboard storefront setup area as the primary setup action path with compact, actionable rows and the requested visual order.

## Test Cases
### Dashboard Page Composition
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Section order on dashboard render | Current `DashboardPage.tsx` source with bundles panel, status card, top cards, resources card | DOM source order is `Bundles panel -> DashboardStatusGrid -> DashboardTopCards -> DashboardResourcesCard` | Ensures requested component prominence sequence is preserved. |

### Storefront Setup Actionability
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 2 | Inline action row availability | Resource enabled/disabled + loading/theme editor link combinations | `shouldRenderResourceAction` returns true only when resource is disabled and theme editor link is available | Prevents rendering actions when they cannot resolve status. |

## Acceptance Criteria
- [ ] Storefront setup summary card appears after the bundles table and before top cards on dashboard
- [ ] Row-level actions only appear when status can be resolved
- [ ] Incomplete setup retains a completion CTA and exposes status-resolution action(s)
