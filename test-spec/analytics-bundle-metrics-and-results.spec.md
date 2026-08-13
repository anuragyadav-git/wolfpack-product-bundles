---
schema_version: 1
id: analytics-bundle-metrics-and-results
title: Analytics Bundle Metrics and Results Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for selectable bundle graph metrics and searchable sortable bundle results.
last_audited: 2026-08-13
owners:
  - Wolfpack Product Bundles
domains:
  - analytics
systems:
  - admin-ui
source_paths:
  - app/lib/analytics/bundle-metrics.ts
  - app/lib/analytics/engagement-helpers.ts
  - app/components/analytics/BundleResultsCard.tsx
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - tdd
  - analytics
keywords:
  - bundle metrics
  - bundle results
---

# Test Spec: Analytics Bundle Metrics and Results

**Spec ID:** analytics-bundle-metrics-and-results  **Created:** 2026-08-13

## Purpose

Verify the data behavior behind the selectable Analytics graph and bundle search/sort card without coupling tests to CSS or placement.

## Test Cases

### BundleMetricSeries

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Empty date window | No views or orders | One zero-valued point per day | Keeps the graph continuous |
| 2 | Daily aggregation | Bundle views and attributed orders | Correct revenue, views, orders, conversion, and AOV | Conversion uses orders divided by views |
| 3 | Non-bundle order | Attribution row without a bundle ID | Excluded from every bundle metric | Prevents unrelated order revenue leaking into bundle analytics |

### BundlePerformanceRows

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | View-only bundle | Views with no engagement or orders | Bundle remains visible with view count | Required for search results |
| 2 | Overall conversion | Four views and one order | 25 percent conversion | Uses the selected date window |

### BundleResultControls

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Search | Mixed-case partial bundle name | Matching rows only | Case-insensitive |
| 2 | Metric sort | Bundle Views plus Highest | Descending view count | Mirrors the dropdown contract |
| 3 | Direction sort | Total Bundle Value plus Lowest | Ascending revenue | Direction applies to selected metric |

## Acceptance Criteria

- [ ] Every graph metric is derived from the selected Analytics window.
- [ ] Search is case-insensitive and matches bundle names.
- [ ] Every requested sort metric supports Highest and Lowest direction.
- [ ] View-only bundles remain available in results.
- [ ] All listed test cases pass.
