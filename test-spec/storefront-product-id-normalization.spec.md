---
schema_version: 1
id: storefront-product-id-normalization
title: Storefront Product ID Normalization
type: test-spec
status: active
summary: Verifies that storefront product hydration sends canonical Shopify product GIDs and rejects malformed identifiers.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
systems:
  - app-proxy
source_paths:
  - app/routes/api/api.storefront-products.tsx
  - tests/unit/routes/storefront-products.test.ts
related_docs:
  - internal docs/Shopify Integration/Admin API.md
tags:
  - ppb
  - fpb
  - hydration
keywords:
  - storefront-products
  - product-gid
---

# Test Spec: Storefront Product ID Normalization
**Spec ID:** storefront-product-id-normalization  **Created:** 2026-08-10

## Purpose
Ensure the shared storefront product endpoint converts numeric Shopify product IDs to canonical product GIDs and rejects malformed identifiers before querying Shopify.

## Test Cases
### api.storefront-products loader
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Numeric product IDs | `111,222` | Shopify receives `gid://shopify/Product/111` and `gid://shopify/Product/222` | Supports FPB and PPB saved product selections without changing widget semantics |
| 2 | Malformed product ID | `111,not-a-product` | HTTP 400 and Shopify is not called | Fails fast instead of forwarding an invalid GraphQL ID |

## Acceptance Criteria
- [x] Numeric product IDs are normalized exactly once at the API boundary.
- [x] Canonical Shopify product GIDs remain canonical.
- [x] Malformed product IDs return HTTP 400 before any Storefront API request.
