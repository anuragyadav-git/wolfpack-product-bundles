---
schema_version: 1
id: attribution-lcp-funnel
title: Attribution LCP Funnel
type: test-spec
status: active
summary: Verifies Analytics funnel loading behavior and persisted event calculations.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
  - analytics
systems:
  - attribution
source_paths:
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - lcp
keywords:
  - funnel
  - progressive-loading
---

# Test Spec: Attribution LCP Funnel
**Spec ID:** attribution-lcp-funnel  **Created:** 2026-07-11

## Purpose
Keep the analytics route LCP path fast while preserving merchant feedback during loading and calculating funnel metrics from real persisted events.

## Test Cases
### AttributionRouteShell
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Analytics payload is still loading | Pending analytics promise | The critical Analytics title and funnel heading render with one inline Polaris loading state | Banner, dashboard, and chart content remain behind the readiness boundary |

### computeBundleFunnel
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | ATC event exists without checkout | Engagement rows include one `wpb:bundle-add-to-cart-success`; no attribution rows | Added To Cart is 1 and Checked Out is 0 | ATC must no longer proxy checkout |
| 2 | Checkout rows exist | Bundle attribution rows exist | Checked Out and revenue use bundle-attributed orders only | Null-bundle rows stay excluded |

### app.attribution loader
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Engagement rows contain session and ATC events | Loader result | Funnel snapshot has distinct engaged sessions and ATC count | Requires selecting `eventName` |

### api.attribution.engagement
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Same session emits engagement and ATC | Two valid payloads with different event names | Both can persist idempotently by event | DB unique key includes `eventName` |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] `tsc` passes
- [ ] Integration tests pass
- [ ] Analytics reveals the critical heading immediately and defers data-dependent content until the route is ready.
