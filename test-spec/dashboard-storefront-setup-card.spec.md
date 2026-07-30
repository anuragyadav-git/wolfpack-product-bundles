---
schema_version: 1
id: dashboard-storefront-setup-card
title: Test Spec - Dashboard Storefront Setup Card
type: test-spec
status: active
summary: Covers the action-first dashboard setup card and its retained detail modal.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
source_paths:
  - app/routes/app/app.dashboard/DashboardStatusGrid.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - dashboard
  - storefront-setup
keywords:
  - theme-extension-status
  - setup-modal
---

# Test Spec: Dashboard Storefront Setup Card
**Spec ID:** dashboard-storefront-setup-card  **Created:** 2026-07-30

## Purpose
Provide a clear, action-first storefront setup summary while retaining the detailed status modal.

## Test Cases
### DashboardStorefrontSetupCard
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Status loading | Theme-extension status is pending | Card communicates that setup is being checked | No false completion state |
| 2 | Status unavailable | Theme-extension status request fails | Card communicates that status needs attention | Modal retains the detailed error |
| 3 | Setup incomplete | One or more core resources are disabled | Card reports the remaining count and offers setup action | Action opens the existing modal |
| 4 | Setup complete | All core resources are enabled | Card reports storefront readiness | Details remain available in the modal |
| 5 | Active bundle summary | Any non-negative active bundle count | Card reports the supplied count | Zero and plural counts remain accurate |

## Acceptance Criteria
- [x] The card has distinct loading, error, incomplete, and complete states.
- [x] The primary card action opens the detailed storefront setup modal.
- [x] The modal retains core and optional resource statuses and Theme Editor action.
- [x] The card and modal have no document-level clipping or horizontal overflow at desktop and mobile widths.
