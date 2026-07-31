---
schema_version: 1
id: admin-all-routes-lcp
title: Test Spec - Admin All Routes LCP
type: test-spec
status: active
summary: Enforces strict route-level Admin LCP and production chunk isolation.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - remix
source_paths:
  - app/lib/admin-web-vitals-diagnostics.client.ts
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - lcp
  - performance
keywords:
  - vendor-state
  - vendor-charts
---

# Test Spec: Admin All Routes LCP
**Spec ID:** admin-all-routes-lcp  **Created:** 2026-07-30

## Purpose
Keep the authenticated Admin shell lightweight and enforce the strict app-owned LCP target across route-keyed diagnostics.

## Test Cases
### AdminAllRoutesLcp
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Strict LCP pass boundary | Route samples with p75 values of 2499ms and 2500ms | 2499ms passes; 2500ms fails | Target is strictly below 2500ms |
| 2 | Shared Admin shell dependencies | Production Admin layout | No legacy Polaris React provider, stylesheet, translations, or global Redux provider | App Bridge and `polaris.js` load from the document head |
| 3 | Shared app bootstrap | `/app` and `/app/dashboard` loader requests | Neither request reads first-create eligibility | Eligibility remains create-handler-owned |
| 4 | Route-owned state | Dashboard, Billing, FPB configure, PPB configure | Each state consumer owns its Redux provider | Non-state routes avoid `vendor-state` |
| 5 | Production chunk isolation | Vite production manifest | Non-state routes cannot reach `vendor-state`; non-Analytics routes cannot reach `vendor-charts` | Analytics code and CSS remain atomic |

## Acceptance Criteria
- [x] Route-keyed LCP p75 passes only when it is below 2500ms.
- [x] Embedded Admin routes do not load legacy Polaris React CSS.
- [x] The shared `/app` layout does not own Redux or React Polaris.
- [x] The shared app loader does not read `firstCreateTourEligible`.
- [x] Production manifest checks pass.
