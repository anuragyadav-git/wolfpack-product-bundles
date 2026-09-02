---
schema_version: 1
id: dashboard-storefront-setup-card
title: Test Spec - Dashboard Storefront Setup Card
type: test-spec
status: active
summary: Covers the equal-sized informational loading, success, and actionable warning states of the Dashboard App Embed banner.
last_audited: 2026-08-28
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
Provide a transient App Embed status check followed by the existing resolved Dashboard banner without blocking useful Dashboard content.

## Test Cases
### DashboardStorefrontSetupCard
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | App Embed status is pending | App Bridge check is unresolved | `s-banner` renders with the `info` tone, loading heading, native Polaris spinner, and loading description | Uses the same content shell as resolved states and is not dismissible |
| 2 | Status unavailable | Resolved App Embed status is disabled | `s-banner` resolves to the `warning` tone and retains the activation CTA | Uses the resolved route payload |
| 3 | Setup complete | Resolved App Embed status is enabled | `s-banner` resolves to the `success` tone without an activation CTA | Uses the same content shell as loading and warning |
| 4 | Banner dismissed | Merchant clicks the banner close control | Banner is removed for the current dashboard mount | Uses the Polaris banner dismiss event |
| 5 | Resolved banner was previously dismissed | A new App Embed check is unresolved in the same session | Transient informational banner still renders | Session dismissal applies only after resolution |

## Acceptance Criteria
- [x] The unresolved App Embed state always renders the informational spinner banner.
- [x] Loading, success, and warning states share the same banner content shell and minimum block size.
- [x] No App Embed banner skeleton renders.
- [x] Disabled App Embed state retains the Theme Editor action.
- [x] The banner has no document-level clipping or horizontal overflow at desktop and mobile widths.
- [x] The banner close control removes the banner for the current dashboard mount.
