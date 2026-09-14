---
schema_version: 1
id: dashboard-bundle-delete
title: Dashboard Bundle Delete
type: test-spec
status: active
summary: Defines shared parent-product cleanup and database deletion behavior for dashboard bundle deletion.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - bundles
systems:
  - dashboard
  - bundle-parent-product
source_paths:
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.dashboard/dashboard-table-model.ts
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - deletion
  - fpb
  - ppb
keywords:
  - productDelete
  - bundle deletion
---

# Test Spec: Dashboard Bundle Delete

**Spec ID:** dashboard-bundle-delete  **Created:** 2026-08-11

## Purpose

Ensure dashboard deletion uses the shared Shopify parent-product lifecycle for
FPB and PPB bundles, never calls a legacy Shopify Page mutation, and retains the
database row when current resource cleanup fails.

## Test Cases

### HandleDeleteBundle

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Delete bundle without a stored parent-product ID | FPB or PPB with `shopifyProductId: null` | No Shopify mutation; bundle row is deleted | Supports a missing or already-cleared parent reference |
| 2 | Delete FPB with a stored parent product | FPB plus a Product GID | Shopify Product is deleted before the bundle row | Uses the shared parent-product contract |
| 3 | Delete PPB with a stored parent product | PPB plus a Product GID | Shopify Product is deleted before the bundle row | Same lifecycle as FPB |
| 4 | Parent product is already gone | Product deletion returns a missing-product user error | Bundle deletion continues | Idempotent retry |
| 5 | Shopify rejects parent-product deletion | GraphQL or non-missing user error | Returns an error and retains bundle row | References remain recoverable |
| 6 | Bundle does not exist in the authenticated shop | Unknown bundle ID | Returns not found and performs no cleanup | Preserves tenant scope |
| 7 | Successful dashboard deletion | Action returns success while loader revalidation is settling | Deleted row is removed immediately and remaining rows stay interactive | Prevents stale deleted records until hard reload |

## Acceptance Criteria

- [x] No dashboard deletion path calls a Shopify Page API.
- [x] FPB and PPB parent products use the same Shopify Product deletion path.
- [x] A missing stored parent-product ID skips Shopify cleanup.
- [x] An already-missing parent product does not block bundle deletion.
- [x] Other parent-product deletion failures preserve the bundle row.
- [x] Missing or cross-shop bundles return not found without cleanup.
- [x] A successful deletion immediately removes the row from the current dashboard.
