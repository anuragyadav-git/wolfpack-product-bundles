---
schema_version: 1
id: dashboard-bundle-delete
title: Dashboard Bundle Delete
type: test-spec
status: active
summary: Defines safe Shopify Page cleanup behavior when deleting full-page bundles from the dashboard.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - bundles
systems:
  - dashboard
  - shopify-pages
source_paths:
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - deletion
  - fpb
keywords:
  - pageDelete
  - bundle deletion
---

# Test Spec: Dashboard Bundle Delete

**Spec ID:** dashboard-bundle-delete  **Created:** 2026-08-11

## Purpose

Ensure dashboard deletion removes legacy Shopify Pages before deleting an FPB
database record, without changing PPB behavior or losing references after a
Shopify cleanup failure.

## Test Cases

### HandleDeleteBundle

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Delete FPB with public and preview Pages | Two distinct Page GIDs | Both Pages are deleted before the bundle row | Preserves cleanup ordering |
| 2 | Delete FPB whose Page is already gone | `NOT_FOUND` Page error | Bundle deletion continues | Idempotent retry |
| 3 | Shopify rejects Page deletion | GraphQL or user error | Returns an error and retains bundle row | References remain recoverable |
| 4 | Delete PPB | Product-page bundle | No Page mutation; existing deletion continues | FPB-only behavior |

## Acceptance Criteria

- [x] FPB Page cleanup runs before database deletion.
- [x] Duplicate Page GIDs are deleted once.
- [x] Already-missing Pages do not block deletion.
- [x] Other Page deletion failures preserve the bundle row.
- [x] PPB deletion makes no Page API call.
