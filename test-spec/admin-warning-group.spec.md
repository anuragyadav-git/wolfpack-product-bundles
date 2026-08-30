---
schema_version: 1
id: admin-warning-group
title: Admin Warning Group
type: test-spec
status: active
summary: Verifies that simultaneous Admin warnings collapse into one summary banner with an actionable warning-list modal.
last_audited: 2026-08-30
owners:
  - wolfpack-engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/AdminWarningGroup.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureCanvasHeader.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - warning
  - modal
keywords:
  - stacked banners
  - publish actions
---

# Test Spec: Admin Warning Group
**Spec ID:** admin-warning-group  **Created:** 2026-08-30

## Purpose

Prevent simultaneous Admin warnings from rendering as stacked banners while preserving every warning and its remediation action.

## Test Cases

### AdminWarningGroup

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | No active warnings | Empty warning list | Nothing renders | Avoids an empty summary |
| 2 | One active warning | One warning with an action | The warning renders directly with its original copy and action | Single-warning behavior remains concise |
| 3 | Multiple active warnings | Two warnings with separate actions | One summary banner and one modal containing both warnings and actions | No stacked warning banners |
| 4 | Merchant selects a modal warning action | Warning with an action callback | The modal closes before the callback runs | Prevents an overlay lingering over Shopify navigation |

## Acceptance Criteria

- [x] No warning group renders more than one banner.
- [x] Multiple warnings use the exact summary copy `Few actions are needed to publish the bundle.` and a `View` action.
- [x] Every active warning remains visible in the modal with its associated action.
- [x] FPB and PPB configure headers use the shared warning group.
- [x] Other co-existing warning groups use the same shared behavior.
