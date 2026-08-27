---
schema_version: 1
id: n-plus-one-remediation
title: N Plus One Query Remediation
type: test-spec
status: active
summary: Behavior and request-count coverage for replacing entity-by-entity Shopify and Prisma reads with bounded batches.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - performance
systems:
  - shopify-admin-api
  - shopify-storefront-api
  - prisma
source_paths:
  - app/services/cart-transform-runtime-token.server.ts
  - app/services/bundle-subscription-discovery.server.ts
  - app/routes/api/api.storefront-products.tsx
related_docs:
  - internal docs/Shopify Integration/Admin API.md
  - internal docs/Shopify Integration/Storefront API.md
tags:
  - performance
  - batching
keywords:
  - n plus one
  - nodes ids
---

# Test Spec: N Plus One Query Remediation

**Spec ID:** n-plus-one-remediation  **Created:** 2026-08-27

## Purpose

Keep request counts proportional to bounded batches and unavoidable cursor pages while preserving merchant-visible validation, hydration, attribution, and clone behavior.

## Test Cases

### Shopify reads

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Runtime subscription validation | Multiple selected component variants | Variant ownership is resolved in one ID batch and selling-plan assignments in one bounded batch | No per-component query pair |
| 2 | Subscription discovery | Multiple direct and collection-backed products | Products, collections, and group assignments are queried in bounded batches | Overflow alone uses cursor follow-ups |
| 3 | Storefront product hydration | Multiple products with up to 250 variants | Product data and variants arrive in the initial 50-product batch | No base per-product variant query |
| 4 | Storefront variant overflow | Product with more than 250 variants | Only the remaining cursor pages are requested | Initial variants are retained on failure |
| 5 | Bundle save validation | Duplicate and distinct variant references | Unique storefront-visible variant GIDs are checked in 50-ID batches | FPB and PPB error paths remain unchanged |
| 6 | Collection expansion | Repeated collection handles across steps and categories | Each unique handle is resolved once per operation batch | Existing product/category mapping is preserved |

### Database reads and writes

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 7 | Order attribution backfill | Multiple orders in one Shopify page | At most one direct and one fallback Prisma read serve the page | Direct bundle matches retain precedence |
| 8 | Bundle clone | Multiple steps with products | One nested Prisma write creates all cloned steps and products | Existing cloned field set is unchanged |

### Retired code

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 9 | Retired webhook topic | Inventory webhook reaches the processor | Processor drops it before persistence | No unreachable inventory handler remains |
| 10 | Unused services | Production import graph | Pricing, inventory-sync, and metafield-validation modules have no production callers and are removed | Obsolete dedicated tests and mocks are removed |

## Acceptance Criteria

- [ ] All listed behavior and request-count tests pass.
- [ ] Changed Shopify GraphQL operations validate against API version 2026-07.
- [ ] Modified files have zero ESLint errors and the full typecheck passes.
- [ ] Full tests, Graphify rebuild, and focused Chrome SIT smoke checks pass before commit.
