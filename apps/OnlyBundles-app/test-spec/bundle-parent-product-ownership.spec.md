---
schema_version: 1
id: bundle-parent-product-ownership
title: "Test Spec: Bundle Parent Product Ownership"
type: test-spec
status: active
summary: Verifies Shopify bundle ownership, Rebuy Smart Cart compatibility, and the native product configuration edit flow.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - bundle-parent-product
  - product-configuration-extension
source_paths:
  - app/services/bundles/bundle-parent-product.server.ts
  - app/routes/app/app.bundles.products.$productId/route.tsx
related_docs:
  - internal docs/Architecture/Bundle Parent Product.md
tags:
  - tdd
  - shopify-bundles
keywords:
  - claimOwnership
  - product-configuration
  - smart-cart-hide-bundle-options
---

# Test Spec: Bundle Parent Product Ownership
**Spec ID:** bundle-parent-product-ownership  **Created:** 2026-08-27

## Purpose

Verify that new Wolfpack bundle parents claim Shopify bundle ownership during creation and that Shopify's native Edit action returns merchants to the existing configure flow.

## Test Cases

### BundleParentProductOwnership

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Create FPB parent | New full-page bundle | `productCreate` claims bundle ownership | Creation only |
| 2 | Create PPB parent | New product-page bundle | `productCreate` claims bundle ownership | Same shared contract |
| 3 | Sync existing parent | Stored Shopify product | No ownership claim is attempted | Shopify forbids retroactive claims |
| 4 | Create Rebuy-compatible parent | New FPB or PPB parent | Exact `smart-cart-hide-bundle-options` tag is included | Rebuy-recognized contract |
| 5 | Sync existing Rebuy-compatible parent | Stored parent with arbitrary merchant tags | `tagsAdd` adds only the exact Rebuy tag | Preserve all existing tags; operation is idempotent |
| 6 | Rebuy tag mutation fails | Shopify returns a user error | Parent sync fails with a typed operation error | Do not report false compatibility |

### ProductConfigurationEdit

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Edit PPB | Owned Shopify product ID | Shopify embedded redirect to PPB configure route | Preserve embedded auth parameters |
| 2 | Edit FPB | Owned Shopify product ID | Shopify embedded redirect to FPB configure route | Preserve embedded auth parameters |
| 3 | Missing or invalid ID | Missing or non-numeric product ID | HTTP 400 | No database lookup |
| 4 | Missing or foreign bundle | Valid product ID without shop match | HTTP 404 | Prevent cross-shop access |
| 5 | Unauthorized request | Failed Shopify admin authentication | Authentication response propagates | No database lookup |

## Acceptance Criteria

- [x] Every newly created FPB and PPB parent claims Shopify bundle ownership.
- [x] Existing parent sync never attempts an unsupported ownership claim.
- [x] Product and variant configuration extension targets render localized Wolfpack management copy.
- [x] Shopify's Edit action reaches the correct existing configure route.
- [x] Existing parent variant, publication, and storefront contracts remain unchanged.
- [x] New and explicitly synchronized parents carry Rebuy's exact Smart Cart compatibility tag without replacing merchant tags.
