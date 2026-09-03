---
schema_version: 1
id: bundle-contract-cleanup
title: Bundle Persistence and Storefront Contract Cleanup
type: test-spec
status: active
summary: Verifies that bundle persistence and storefront synchronization use one current contract without dead response fields or unused sync bookkeeping.
last_audited: 2026-08-11
owners:
  - Wolfpack Product Bundles
domains:
  - bundles
  - storefront
systems:
  - bundle-api
  - deployment-general-sync
  - storefront-sync
source_paths:
  - app/routes/api/api.bundle.$bundleId[.]json.tsx
  - app/services/bundles/storefront-sync.server.ts
  - app/services/deployment-general-sync.server.ts
  - app/services/bundles/bundle-parent-product.server.ts
  - prisma/schema.prisma
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
  - internal docs/Shopify Integration/Metafields.md
  - internal docs/Operations/Deployment General Sync.md
tags:
  - cleanup
  - persistence
  - metafields
keywords:
  - dead fields
  - canonical bundle contract
  - storefront sync
---

# Test Spec: Bundle Persistence and Storefront Contract Cleanup

**Spec ID:** bundle-contract-cleanup  **Created:** 2026-08-11

## Purpose

Keep FPB and PPB save paths separate while removing persistence and public API
fields that have no owned reader. Deployment sync must replay only the current
Shopify contract and must not invoke placeholder metaobject work.

## Test Cases

### PublicBundleApi

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Fetch a public bundle | Valid signed bundle request | Exact `{ success, bundle }` response | No request timestamp |
| 2 | Supply a legacy sparse field query | Valid request with `fields=bootstrap` | Same full canonical response | Sparse projections are removed |

### StorefrontSync

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Sync succeeds | Persisted FPB or PPB | Current metafields are written and success is returned | No DB sync-status write |
| 2 | Sync fails | Cart Transform or metafield failure | Error propagates | No DB failure-status write |

### DeploymentGeneralSync

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | General sync applies | Installed shops and persisted bundles | Definitions, current bundle sync, variant remediation, and add-on setup run | No metaobject hook or counter |
| 2 | General sync repeats | Already canonical persisted state | Same current contract is replayed safely | No legacy fallback path |

### CanonicalCategoryAndPricing

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Save and format a category | Current Admin category | `id`, `sortOrder`, `products`, and `collections` cross persistence/runtime boundaries | No alias reads or writes |
| 2 | Save pricing display options | FPB or PPB pricing form | Direct `BundlePricing.displayOptions` is persisted and emitted | Messages contain text only |
| 3 | Ensure variant definitions | Current Shopify Admin client | Five current variant definitions are ensured | No `component_parents` definition |

### FpbParentProductHost

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Create an FPB parent | New full-page bundle | Uses the deterministic internal handle | PPB remains merchant-facing |
| 2 | Sync an existing FPB parent | Stored or live merchant-facing handle | Ensures the app-proxy redirect and moves the parent to its internal handle | Normal save/sync ownership |
| 3 | Sync an already canonical FPB parent | Existing internal handle | Leaves the handle unchanged | Idempotent retry |
| 4 | Sync a Unicode parent handle | Shopify returns a percent-encoded redirect path | Updates the existing redirect | Does not attempt a duplicate create |

## Acceptance Criteria

- [x] FPB and PPB save handlers remain independent.
- [x] Public bundle responses contain no timestamp or sparse bootstrap branch.
- [x] Storefront sync does not persist operational attempt/status columns.
- [x] Deployment general sync contains no empty metaobject abstraction.
- [x] Categories and pricing display options have one persisted owner each.
- [x] FPB parent-product routing is owned by normal save/sync with no migration command.
- [x] Focused and full unit tests, lint, Prisma validation, widget build, asset minification, and production build pass.
