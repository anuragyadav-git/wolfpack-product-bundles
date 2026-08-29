---
schema_version: 1
id: admin-billing-navigation
title: Admin Billing Navigation
type: test-spec
status: active
summary: Verifies that the main embedded app navigation links merchants to Subscription and Billing through a Billing item.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - admin
systems:
  - remix-routes
source_paths:
  - app/routes/app/app.tsx
  - app/i18n/locales/
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - navigation
keywords:
  - billing
  - subscription
---

# Test Spec: Admin Billing Navigation

**Spec ID:** admin-billing-navigation  **Created:** 2026-08-29

## Purpose

Verify that Subscription and Billing is directly reachable from the main app
navigation through an option named Billing.

## Test Cases

### Main Navigation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Merchant opens the app navigation | Authenticated app shell | Billing item links to `/app/pricing` | `/app/pricing` owns the Subscription and Billing screen |
| 2 | Merchant uses a supported Admin locale | Any supported locale | Billing label resolves from the locale catalog | Catalog keys remain aligned |

## Acceptance Criteria

- [x] The main app navigation includes Billing.
- [x] Billing navigates to `/app/pricing`.
- [x] All supported locale catalogs contain the Billing key.
- [x] Focused tests and lint pass.
