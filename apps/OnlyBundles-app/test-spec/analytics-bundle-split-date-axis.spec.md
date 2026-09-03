---
schema_version: 1
id: analytics-bundle-split-date-axis
title: Analytics Bundle Split Date Axis
type: test-spec
status: active
summary: Verifies Bundle Split date ticks stay compact for short and long merchant-selected ranges without displaying a year.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - analytics
systems:
  - admin-ui
source_paths:
  - app/lib/analytics/chart-axis-formatters.ts
  - app/components/analytics/BundleMetricChart.tsx
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - tdd
  - charts
keywords:
  - Bundle Split
  - date axis
  - compact date
---

# Test Spec: Analytics Bundle Split Date Axis

**Spec ID:** analytics-bundle-split-date-axis  **Created:** 2026-08-25

## Purpose

Keep Bundle Split graph dates readable for the merchant-selected range without changing the underlying ISO date data.

## Test Cases

### BundleSplitDateAxisFormatter

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Seven-day range | `2026-07-07`, 7 days | `7` | Day number only |
| 2 | Thirty-day range | `2026-07-14`, 30 days | `14` | Day number only |
| 3 | Longer range | `2026-07-07`, 31 days | `Jul 7` | Abbreviated month and day |
| 4 | Long range in another year | `2026-12-31`, 365 days | `Dec 31` | Year is never displayed |
| 5 | Invalid date value | `not-a-date`, 30 days | `not-a-date` | Preserve the source label safely |

## Acceptance Criteria

- [x] Ranges of 30 days or fewer display only the day number.
- [x] Ranges over 30 days display abbreviated month and day.
- [x] Bundle Split axis labels never display the year.
- [x] Raw ISO dates remain unchanged in the chart data.
- [x] Focused formatter tests pass.
