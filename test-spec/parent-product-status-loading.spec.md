---
schema_version: 1
id: parent-product-status-loading
title: Parent Product Status Loading
type: test-spec
status: active
summary: Verifies that configure-page parent product status loading and resolved states stay synchronized across the banner and bundle product card.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/lib/parent-product-status-ui.ts
  - app/components/UnlistedBundleBanner.tsx
  - app/routes/app/_shared/bundle-configure/CommonConfigureSidebar.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - loading-state
keywords:
  - parent-product-status
---

# Test Spec: Parent Product Status Loading

**Spec ID:** parent-product-status-loading  **Created:** 2026-08-25

## Purpose

Keep the configure banner and Bundle Product card synchronized while Shopify parent product status is being revalidated.

## Test Cases

### ParentProductStatusUi

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Status revalidation is active | Unlisted status plus loading | Loading state | Stale warning must not remain visible. |
| 2 | Status is unresolved | Missing status | Loading state | Do not show an Unknown fallback. |
| 3 | Status resolves to Unlisted | Unlisted status and idle | Warning state | Banner and badge become Unlisted together. |
| 4 | Status resolves to Active | Active status and idle | Active card state, no banner | No success banner is rendered. |

### UnlistedBundleBanner

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 5 | Parent product status is loading | Loading state | Info banner with native spinner | Manage action is absent. |
| 6 | Parent product is Unlisted | Warning state | Warning banner with Manage action | Existing merchant action remains available. |

### CommonConfigureSidebar

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 7 | Parent product status is loading | Shared loading presentation | Native inline spinner without a badge | No Unknown fallback is rendered. |
| 8 | Parent product is Unlisted | Shared warning presentation | Unlisted warning badge without a spinner | Card resolves with the banner state. |

## Acceptance Criteria

- [x] FPB and PPB derive banner and card state from one status presentation object.
- [x] Loading renders an info banner and inline native Polaris spinners.
- [x] No fallback status badge is shown while loading.
- [x] Active status does not render a success banner.
- [x] Focused tests pass.
