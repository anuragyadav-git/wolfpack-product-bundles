---
schema_version: 1
id: admin-page-navigation
title: "Test Spec: Admin Page Navigation"
type: test-spec
status: active
summary: Verifies the shared Admin breadcrumb and app-owned back navigation semantics.
last_audited: 2026-08-13
owners:
  - Wolfpack Product Bundles
domains:
  - admin-ui
systems:
  - navigation
source_paths:
  - app/components/AdminPageNavigation.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - navigation
keywords:
  - breadcrumb
  - back button
---

# Test Spec: Admin Page Navigation

**Spec ID:** admin-page-navigation  **Created:** 2026-08-13

## Purpose

Ensure merchant-facing Admin pages can render the Shopify breadcrumb and the app-owned back action from one shared semantic component contract.

## Test Cases

### AdminPageNavigation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shopify title-bar navigation | Title, breadcrumb label, callback | Title bar exposes the title and breadcrumb action | No styling assertions |
| 2 | App-owned page navigation | Title, accessibility label, callback | Visible heading and accessible back action render | No placement assertions |

## Acceptance Criteria

- [ ] Both semantic navigation surfaces render from the shared component.
- [ ] Existing guarded callbacks can be supplied unchanged.
- [ ] Dashboard does not render the shared navigation.
