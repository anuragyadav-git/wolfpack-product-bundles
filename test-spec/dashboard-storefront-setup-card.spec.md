---
schema_version: 1
id: dashboard-storefront-setup-card
title: Test Spec - Dashboard Storefront Setup Card
type: test-spec
status: active
summary: Covers the dismissible Dashboard App Embed status banner after route readiness.
last_audited: 2026-08-13
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
  - app-embed-banner
---

# Test Spec: Dashboard Storefront Setup Card
**Spec ID:** dashboard-storefront-setup-card  **Created:** 2026-07-30

## Purpose
Provide a clear, dismissible App Embed status banner without a banner-specific loading skeleton.

## Test Cases
### DashboardStorefrontSetupCard
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Route readiness is pending | App Embed or banner data is unresolved | Dashboard loading workspace surface remains visible | Banner has no independent skeleton |
| 2 | Status unavailable | Resolved App Embed status is disabled | Banner communicates that setup needs attention and offers activation | Uses the resolved route payload |
| 3 | Setup complete | Resolved App Embed status is enabled | Banner reports storefront readiness | No intermediate loading banner |
| 4 | Banner dismissed | Merchant clicks the banner close control | Banner is removed for the current dashboard mount | Uses the Polaris banner dismiss event |

## Acceptance Criteria
- [x] The actual banner renders only after route readiness.
- [x] No App Embed banner skeleton renders.
- [x] Disabled App Embed state retains the Theme Editor action.
- [x] The banner has no document-level clipping or horizontal overflow at desktop and mobile widths.
- [x] The banner close control removes the banner for the current dashboard mount.
