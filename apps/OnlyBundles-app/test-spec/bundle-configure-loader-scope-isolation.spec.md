---
schema_version: 1
id: bundle-configure-loader-scope-isolation
title: Bundle Configure Loader Scope Isolation
type: test-spec
status: active
summary: Verifies that optional Shopify product and locale failures cannot prevent FPB or PPB Configure pages from loading required shop currency data.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure-loader
source_paths:
  - app/lib/bundle-configure-loader.server.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - regression
keywords:
  - graphql-scope-isolation
---

# Test Spec: Bundle Configure Loader Scope Isolation

**Spec ID:** bundle-configure-loader-scope-isolation  **Created:** 2026-08-29

## Purpose

Keep required shop currency loading independent from optional product and locale queries so a scoped Shopify field cannot fail both FPB and PPB Configure routes.

## Test Cases

### Shopify Configure Data Loading

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | All Shopify data is available | Product ID and successful product, currency, and locale responses | Product, currency, and published locales are returned | Queries may execute concurrently |
| 2 | Bundle has no Shopify product | Null product ID and successful currency and locale responses | Product is null and no product query is sent | Required currency remains available |
| 3 | Product query is rejected | Product access error plus successful currency and locale responses | Configure data resolves with a null product | Optional product data cannot fail the route |
| 4 | Locale query is rejected | Locale access error plus successful currency response | Configure data resolves with no locale options | Optional locale data cannot fail the route |
| 5 | Currency is missing | Successful optional queries and a currency response without a code | Loader rejects | Currency is required by pricing controls |
| 6 | Product query scope stays narrow | Product ID | Query excludes restricted media fields | Existing `read_products` scope is sufficient |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Product, currency, and locale queries are isolated
- [x] Optional query failures are logged and do not reject Configure loaders
- [x] Missing required shop currency still rejects
- [x] The product query does not request restricted media fields
