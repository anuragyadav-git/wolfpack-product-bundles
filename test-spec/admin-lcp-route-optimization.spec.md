---
schema_version: 1
id: admin-lcp-route-optimization
title: Admin LCP Route Optimization
type: test-spec
status: active
summary: Verifies route-level loading and critical-path behavior for Admin performance-sensitive pages.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - remix
source_paths:
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - lcp
keywords:
  - attribution
  - loading-bar
---

# Test Spec: Admin LCP Route Optimization
**Spec ID:** admin-lcp-route-optimization  **Created:** 2026-06-28

## Purpose
Reduce local Admin LCP on routes that exceeded 2500 ms during Shopify Admin iframe sampling while preserving route behavior.

## Test Cases

### RouteOptimization
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Cart-transform Admin list route remains removed | Route file inventory | `/app/bundles/cart-transform` route files are absent; API/function support remains | Existing integration test covers this |
| 2 | Pricing route can paint before subscription lookup settles | `/app/pricing` loader | Route returns deferred subscription data and renders a skeleton while it resolves | Targets local 2592 ms sample |
| 3 | Attribution route stays hidden while analytics queries settle | `/app/attribution` loader | Route keeps deferred `pixelStatus` and `analytics` behind the black loading bar | Prevents partial Analytics content |
| 4 | Dashboard route removes avoidable sequential DB wait | `/app/dashboard` loader | Bundle and shop metadata reads start concurrently before secondary work | Targets local 4476 ms sample |
| 5 | Support chat does not configure Crisp on the critical path | Admin app root support chat loader | Crisp configures after a delayed fallback, or immediately when a support action explicitly opens chat | Fallback if attribution p75 still exceeds local target after loader split |
| 6 | Admin i18n avoids loading inactive locales on first paint | Admin i18n config import | English catalog is present at bootstrap; non-English catalogs load only when requested | Fallback if attribution p75 still exceeds local target after loader split |
| 7 | Attribution reveals one ready surface | `/app/attribution` default export | Initial shell renders only the loading bar; title, banner, and dashboard appear after data and modules are ready | No partial route paint |

## Acceptance Criteria
- [ ] Focused cart-transform route removal test passes.
- [ ] Pricing route still renders quota, plan cards, comparison, and FAQ after deferred data resolves.
- [ ] Attribution renders only the black loading bar until status, analytics, and lazy modules are ready.
- [ ] Attribution title, banner, funnel, charts, matrix, activity, and campaigns appear together after readiness.
- [ ] Crisp chat is deferred until the delayed fallback while explicit support actions still open chat immediately.
- [ ] Admin i18n does not load inactive locale catalogs on the critical path.
- [ ] Local Admin debug bridge shows improved LCP samples on affected routes after reload.
