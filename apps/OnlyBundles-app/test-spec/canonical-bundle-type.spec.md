---
schema_version: 1
id: canonical-bundle-type
title: Canonical Bundle Type
type: test-spec
status: active
summary: Verify Shopify storefront writers and Product Page rendering require an explicit canonical bundle type.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - storefront
  - bundles
systems:
  - metafield-sync
  - product-page-widget
source_paths:
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server.ts
  - app/assets/widgets/product-page/methods/layout-shell-methods.ts
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - canonical-contract
  - no-compatibility
keywords:
  - bundleType
  - product_page
---

# Test Spec: Canonical Bundle Type

**Spec ID:** canonical-bundle-type **Created:** 2026-09-09

## Purpose

Remove implicit Product Page defaults so missing or cross-bundle configuration cannot be published or rendered as a valid PPB.

## Test Cases

### BundleTypeContract

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Shared metafield writer receives no type | Bundle configuration without `bundleType` | Reject before Shopify lookup or mutation | No PPB default |
| 2 | Shared metafield writer receives an unsupported type | Bundle configuration with an unknown `bundleType` | Reject before Shopify lookup or mutation | Canonical enum only |
| 3 | PPB sync builder receives a PPB | Persisted bundle with `bundleType=product_page` | Emit exact `product_page` | Route owner preserves canonical type |
| 4 | PPB sync builder receives no type or FPB | Missing type or `full_page` | Reject configuration | Do not convert another contract into PPB |
| 5 | PPB layout receives canonical type | Selected bundle has `bundleType=product_page` | Render Product Page steps | Existing behavior |
| 6 | PPB layout receives missing or FPB type | Missing type or `full_page` | Render neither PPB nor FPB fallback layout | Controller fails closed |
| 7 | FPB sync builder receives an FPB | Persisted bundle with `bundleType=full_page` | Emit exact `full_page` | Route owner preserves canonical type |
| 8 | FPB sync builder receives no type or PPB | Missing type or `product_page` | Reject configuration | Do not convert another contract into FPB |

## Acceptance Criteria

- [x] `bundle_ui_config` is never written with an inferred bundle type.
- [x] PPB save/sync configuration rejects a missing or cross-bundle type.
- [x] Product Page rendering requires exact `product_page`.
- [x] No compatibility layout alias remains.
- [x] All listed test cases pass.
