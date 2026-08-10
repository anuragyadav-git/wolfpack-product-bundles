---
schema_version: 1
id: dashboard-clone-action
title: Dashboard Clone Action
type: test-spec
status: active
summary: Defines the dashboard bundle clone action as an immediate single-click submission without confirmation.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
source_paths:
  - app/lib/bundle-navigation.ts
  - app/routes/app/app.dashboard/DashboardPage.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - clone
  - dashboard
keywords:
  - cloneBundle
  - single click
---

# Test Spec: Dashboard Clone Action

**Spec ID:** dashboard-clone-action  **Created:** 2026-08-11

## Purpose

Ensure one click on the dashboard clone action immediately produces the normal
clone submission without asking the merchant for confirmation.

## Test Cases

### BuildDashboardCloneSubmission

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Clone a dashboard bundle | Bundle ID | POST form contains `intent=cloneBundle` and the exact bundle ID | No confirmation state is required |

## Acceptance Criteria

- [x] Clone submission is created immediately from the selected bundle ID.
- [x] The browser confirmation dialog is not used.
- [x] Delete confirmation remains unchanged.
