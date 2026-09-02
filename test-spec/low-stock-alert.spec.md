---
schema_version: 1
id: low-stock-alert
title: Low Stock Alert
type: test-spec
status: active
summary: Defines Shopify-owned inventory rules, merchant configuration validation, runtime output, and bundle persistence for low-stock alerts.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-configure
  - widget-runtime
source_paths:
  - app/lib/low-stock-alert.ts
  - app/lib/bundle-formatter.server.ts
  - app/services/bundles/metafield-sync/types.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/assets/widgets/full-page/methods/product-processing-methods.ts
  - app/assets/widgets/full-page/methods/product-card-footer-methods.ts
  - app/assets/widgets/full-page/methods/modal-product-methods.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server.ts
related_docs:
  - docs/competitor-analysis/21-bundlex-urgency-swatches-tier-badges.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - inventory
  - merchandising
keywords:
  - quantityAvailable
  - currentlyNotInStock
  - low stock
---

# Test Spec: Low Stock Alert
**Spec ID:** low-stock-alert  **Created:** 2026-09-01

## Purpose

Verify that low-stock messaging uses Shopify component-variant inventory, remains merchant-configurable, and suppresses claims when sellable quantity is unknown, zero, unavailable, or backorderable.

## Test Cases

### LowStockAlertDecision
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Feature disabled | Valid component and disabled config | `null` | No storefront claim |
| 2 | Above threshold | Sellable stock above configured threshold | `null` | Alert stays hidden |
| 3 | At threshold | Sellable stock equals threshold | Rendered message | Boundary is inclusive |
| 4 | Below threshold | Sellable stock below threshold | Rendered message | Replaces every `{{stock}}` token |
| 5 | Zero stock | Sellable stock is zero | `null` | Out-of-stock UI owns this state |
| 6 | Unknown stock | `quantityAvailable` is null | `null` | Missing scope or stale read must not create scarcity |
| 7 | Backorder | `currentlyNotInStock` is true | `null` | Continue-selling suppresses scarcity |
| 8 | Unavailable variant | `availableForSale` is false | `null` | Out-of-stock UI owns this state |
| 9 | Component requirements | Multiple required component quantities | Minimum floor ratio | Uses selected component variants only |
| 10 | Optional components | Required quantity is zero | Ignore optional component | No misleading aggregate |

### LowStockAlertConfiguration
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Missing fields | Empty form | Disabled, threshold 5, documented message | Canonical new-bundle defaults |
| 2 | Valid controls | Enabled, threshold 8, tokenized message | Parsed direct fields | Shared by FPB and PPB saves |
| 3 | Invalid threshold | 0, 1001, decimal, or non-number | Validation issue | Supported range is 1–1000 |
| 4 | Missing token | Message without `{{stock}}` | Validation issue | Exact quantity must remain visible |
| 5 | Oversized copy | More than 200 characters | Validation issue | Matches researched control boundary |

### StorefrontRuntimeContract
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Saved bundle | Direct Prisma fields | Public `lowStockAlert` config | Both widgets consume one contract |
| 2 | Defaults | Fields absent in unit fixture | Disabled canonical config | No legacy JSON fallback |
| 3 | Grouped FPB product | Selected variant runtime stock is 3 | Normalize stock once and render merchant message with stock 3 on the full-page product card | Product processing owns inventory normalization; the existing shared-card badge slot owns presentation |
| 4 | PPB Shopify sync | Persisted direct low-stock fields | Sync configuration retains the fields for `$app:bundle_config` | Prevents the runtime builder from dropping canonical merchant settings |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] FPB and PPB save the same direct Prisma fields
- [x] Storefront runtime contains one `lowStockAlert` contract
- [x] Product cards use Shopify component-variant inventory only
- [x] Unknown, zero, unavailable, and backorder states never show low-stock copy
- [x] Desktop and mobile Chrome QA pass after the required Prisma restart
