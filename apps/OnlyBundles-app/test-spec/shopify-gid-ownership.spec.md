---
schema_version: 1
id: shopify-gid-ownership
title: Shopify GID Ownership Test Spec
type: test-spec
status: active
summary: Defines one dependency-neutral owner for normalizing Shopify ProductVariant global IDs across checkout services.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - checkout-offers
  - cart-transform-runtime-token
source_paths:
  - app/lib/shopify-product-gid.ts
  - app/services/cart-transform-runtime-token.server.ts
  - app/services/checkout-bundle-offers.server.ts
  - app/services/ppb-static-authorization.server.ts
  - app/routes/api/api.checkout-bundle-offer-token.tsx
related_docs:
  - internal docs/Architecture/Cart Transform Function.md
tags:
  - tdd
  - architecture
keywords:
  - ProductVariant GID
  - import cycle
---

# Test Spec: Shopify GID Ownership

**Spec ID:** shopify-gid-ownership  **Created:** 2026-09-10

## Purpose

Keep Shopify ProductVariant GID normalization independent of Cart Transform
token signing so checkout-offer serialization does not depend on the token
service that consumes its output.

## Test Cases

### ProductVariant GID Normalization

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Numeric REST identifier | `101` or `"101"` | `gid://shopify/ProductVariant/101` | Normalize at the Shopify resource boundary |
| 2 | Canonical ProductVariant GID | `gid://shopify/ProductVariant/303` | Same GID | Preserve canonical identifiers |
| 3 | Wrong Shopify resource type | Product GID | `null` | Fail closed |
| 4 | Missing or malformed identifier | Empty, non-numeric, object, or null | `null` | Do not invent resource identifiers |

## Acceptance Criteria

- [x] GID normalization has one dependency-neutral owner.
- [x] Cart Transform token and checkout-offer services import that owner directly.
- [x] Checkout-offer selection uses a narrow local input contract instead of importing the full runtime-token payload.
- [x] Focused tests, typecheck, ESLint, Graphify, and diff checks pass.
