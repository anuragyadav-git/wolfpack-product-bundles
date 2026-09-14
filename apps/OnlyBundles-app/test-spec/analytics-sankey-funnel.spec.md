---
schema_version: 1
id: analytics-sankey-funnel
title: Analytics Conversion Funnel
type: test-spec
status: active
summary: Verifies the accessible three-stage Analytics conversion funnel and its canonical view, cart, and order inputs.
last_audited: 2026-09-05
owners:
  - engineering
domains:
  - admin
  - analytics
systems:
  - attribution
source_paths:
  - app/components/analytics/BundleConversionFunnel.tsx
  - app/lib/analytics/funnel-retention.ts
  - app/routes/app/app.attribution/AttributionDashboard.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - accessibility
keywords:
  - funnel
  - conversion
---

# Test Spec: Analytics Conversion Funnel
**Spec ID:** analytics-sankey-funnel  **Created:** 2026-09-04

## Purpose
Replace the Analytics page's standalone charts with one accessible three-stage funnel sourced from existing persisted Analytics records.

## Test Cases
### calculateFunnelRetention
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Typical funnel | `645, 305, 116` | `47%`, `38%` | Round to whole percentages |
| 2 | Growth between stages | `10, 15, 30` | `150%`, `200%` | Do not clamp values above 100 |
| 3 | Zero preceding stage | `0, 0, 0` | `null`, `null` | UI displays an em dash |

### BundleConversionFunnel
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Persisted funnel values | Views `645`, carts `305`, orders `116` | All localized labels, exact formatted counts, `47%`, and `38%` are exposed in one accessible chart | SVG geometry does not replace exact text values |
| 2 | Empty reporting window | Views `0`, carts `0`, orders `0` | Three zero stages and two em-dash conversions render without `NaN` or `Infinity` | Empty data remains a valid collapsed funnel state |

### AttributionDashboard
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Growth Analytics | Advanced payload | Funnel receives `views.totalViews`, `funnelSnapshot.addedToCart`, and `funnelSnapshot.checkedOut` | Date, export, backfill, offer, UTM, and table controls remain available |
| 2 | Free Analytics | Summary payload | Funnel receives the same three canonical fields | Summary mode does not require advanced chart data |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] The conversion funnel is the only funnel chart and no Bundle Split control remains
- [x] Zero denominators display an em dash
- [x] The Analytics production route does not request `vendor-charts`
- [x] The deferred critical funnel heading remains the route LCP candidate
