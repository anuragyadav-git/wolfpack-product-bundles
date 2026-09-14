---
schema_version: 1
id: analytics-bundle-commerce-metrics
title: Test Spec - Analytics Bundle Commerce Metrics
type: test-spec
status: active
summary: Verifies the six merchant-facing bundle statistics and two sales trends against canonical order and bundle-line values.
last_audited: 2026-09-05
owners:
  - engineering
domains:
  - admin
  - analytics
systems:
  - attribution
source_paths:
  - app/lib/analytics/bundle-commerce-metrics.ts
  - app/lib/analytics/bundle-line-revenue.ts
  - app/components/analytics/BundleKeyStatistics.tsx
  - app/components/analytics/BundleSalesTrends.tsx
  - app/routes/app/app.attribution.tsx
  - app/services/analytics/free-attribution-summary.server.ts
  - extensions/wolfpack-utm-pixel/src/index.ts
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - shopify-admin-api
keywords:
  - order-revenue
  - bundle-revenue
  - average-order-value
---

# Test Spec: Analytics Bundle Commerce Metrics
**Spec ID:** analytics-bundle-commerce-metrics  **Created:** 2026-09-05

## Purpose
Expose the complete BOGOS Bundle Analytics metric vocabulary while keeping Shopify order totals, Shopify line values, and app-owned funnel events as distinct canonical inputs.

## Test Cases
### computeBundleCommerceSummary
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | One order contains two different bundles | Two rows with the same order ID and distinct bundle IDs | Order revenue and order count are deduplicated; both bundle values and purchases are counted | One order can contribute multiple unique bundle purchases |
| 2 | Same bundle row is duplicated | Duplicate order and bundle pair | Revenue, order, and purchase totals are not duplicated | Defends against replayed attribution |
| 3 | No add-to-cart activity | Positive bundle revenue and zero add-to-cart count | Add to cart value is `null` | UI renders an em dash |
| 4 | Empty window | No rows | All totals are zero and quotient metrics are `null` | Never emit `NaN` or `Infinity` |

### buildBundleSalesTrend
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Sparse reporting window | Orders on first and last day | Every UTC day is returned with zero-filled gaps | Revenue and order series share the same buckets |
| 2 | Multi-bundle order | Two bundle rows for one order | Bundle revenue sums both bundles while orders count once | Matches headline definitions |

### collectBundleLineRevenue
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Flat checkout bundle components | Tagged checkout lines with `finalLinePrice` | Values sum by bundle ID | Uses Shopify Web Pixel checkout data |
| 2 | Cart Transform parent line | Tagged parent with nested components | Parent value is counted once | No parent/component double count |
| 3 | Admin order line | Verified bundle ID and `discountedTotalSet` | Current discounted line value is used | Backfill uses canonical Admin GraphQL money |
| 4 | Unrelated or malformed line | Missing/unknown bundle identity or invalid money | Line is ignored | Never guesses bundle allocation |

### Web Pixel payload
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Checkout completes with priced lines | Shopify checkout line items include `finalLinePrice` | Attribution POST preserves each line's final Shopify amount | Real-time bundle revenue uses the same canonical input as the pure collector |

### Merchant UI
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Populated summary | Exact counts and currency values | All six localized labels and formatted values are accessible | No CSS or placement assertions |
| 2 | Empty summary | Zero totals and null quotient metrics | BOGOS-style zero money values are exposed | No `NaN` or `Infinity` |
| 3 | Sales history | Daily bundle revenue and distinct-order points | Both metric names and every exact point are accessible | Dependency-free SVG only |

## Acceptance Criteria
- [x] All listed behavior tests pass
- [x] Advanced and Free summary modes use the same six metric definitions
- [x] Completed orders are deduplicated by Shopify order ID
- [x] Bundle revenue uses Shopify line values, not repeated whole-order totals
- [x] The Analytics production route does not request `vendor-charts`
- [x] Existing attribution, export, backfill, and table tests remain green
