---
schema_version: 1
id: shopify-native-remediation-dead-code
title: Shopify Native Remediation Dead Code Test Spec
type: test-spec
status: active
summary: Defines remediation for root routing, retired template and Page scaffolding, internal webhook guards, and the dead bundle diagnostic route.
last_audited: 2026-09-06
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - remix
  - prisma
  - storefront-widgets
source_paths:
  - app/routes/root/_index/route.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/route.tsx
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
  - app/assets/widgets/shared/bundle-data-manager.ts
  - prisma/schema.prisma
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
  - internal docs/Architecture/Database Schema.md
tags:
  - tdd
  - cleanup
keywords:
  - root redirect
  - product template
  - Shopify Page
---

# Test Spec: Shopify Native Remediation Dead Code

**Spec ID:** shopify-native-remediation-dead-code  **Created:** 2026-09-06

## Purpose

Remove no-op and retired compatibility paths while retaining the current app-proxy and theme-extension ownership boundaries.

## Test Cases

### Root Route

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Root request without query | `GET /` | Redirect to `/app` | `/app` owns Shopify Admin authentication |
| 2 | Root request with query | `GET /?shop=example.myshopify.com&host=abc` | Redirect to `/app` with the exact query string | Preserve Shopify context |

### Retired Template Scaffolding

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Retired ensure-template intent | PPB configure POST with `intent=ensureBundleTemplates` | 400 unknown action | Theme app extensions own placement |

### Bundle Deletion

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB row contains stale Page-shaped metadata | Delete FPB with no parent product | Delete only the app-owned bundle row | App-proxy document is the canonical FPB host |

### Retired Internal Webhook Authentication

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Source audit after native webhook cutover | App source and tests | No `INTERNAL_WEBHOOK_SECRET` guard or guard-only test remains | `authenticate.webhook(request)` owns webhook verification |

### Retired Bundle Diagnostic

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Unreferenced bundle-report endpoint | Route and Vite route-chunk configuration | Endpoint and special chunk handling are absent | It read retired JSON membership, miscounted relations, and exposed server stack traces |
| 2 | Unreferenced all-bundles endpoint | Route and navigation map | Endpoint and map entry are absent | FPB uses the tenant-scoped single-bundle fallback; PPB uses Shopify-hosted snapshots |

### Storefront Bundle Selection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Live bundle selection | Current bundle payload and storefront context | `selectBundle` returns the matching canonical bundle or `null` | Existing behavior suite remains the contract |
| 2 | Unused selector utilities | Deployable widget source | Helpers with no runtime caller are absent | Do not ship a second unused bundle-query API inside the widget |

## Acceptance Criteria

- [x] Root redirects directly to `/app` and preserves the original query string.
- [x] Product-template route, service, RTK Query mutation, and configure intent are removed.
- [x] FPB deletion no longer calls Shopify Page mutations.
- [x] The unused manual internal-secret guard and its stale tests are removed.
- [x] The unreferenced bundle-report diagnostic route and its Vite exceptions are removed.
- [x] The parallel all-bundles app-proxy endpoint and its navigation entry are removed.
- [x] Uncalled `BundleDataManager` query and filtering helpers are removed while live selection behavior remains green.
- [x] A forward-only migration drops the four Page columns and obsolete handle index.
- [x] Focused tests, Prisma validation, typecheck, ESLint, and diff checks pass.
