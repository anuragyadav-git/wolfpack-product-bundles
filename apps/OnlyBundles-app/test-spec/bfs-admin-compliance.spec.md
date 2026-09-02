---
schema_version: 1
id: bfs-admin-compliance
title: Built for Shopify Admin Compliance
type: test-spec
status: active
summary: Verifies canonical parent navigation, mobile containment, and simultaneous desktop Design editor and preview behavior.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
systems:
  - app-bridge
  - remix-routes
source_paths:
  - app/routes/app/app.tsx
  - app/routes/app/app.settings_.controls.tsx
  - app/routes/app/app.billing_.plans.tsx
  - app/routes/app/app.bundles.create/create-bundle.module.css
  - app/routes/app/app.dashboard/dashboard.module.css
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - built-for-shopify
keywords:
  - mobile friendly
  - parent navigation
  - visible preview
---

# Test Spec: Built for Shopify Admin Compliance

**Spec ID:** bfs-admin-compliance  **Created:** 2026-09-01

## Purpose

Keep merchant-facing Admin routes mobile-friendly, let Shopify App Bridge select
the relevant parent navigation item from canonical route prefixes, and preserve
the simultaneous desktop Design editor and preview.

## Test Cases

### AdminNavigationAndRoutes

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Authenticated app shell renders navigation | Any app route | One `s-app-nav` with one `s-link` home and canonical primary links | App Bridge owns selection state |
| 2 | Merchant opens Controls | Settings Controls card | Navigate to `/app/settings/controls` | Settings remains the URL parent |
| 3 | Merchant directly loads Controls | `/app/settings/controls` with query state | Existing controls workspace and Redux provider render | Preserve deep links and save behavior |
| 4 | Merchant opens Billing | Main navigation | Navigate to `/app/billing` | Billing is the parent route |
| 5 | Free merchant chooses Upgrade | Billing page | Navigate to `/app/billing/plans` | Plan comparison is a Billing child URL |
| 6 | Merchant selects Growth | Billing Plans action | Return Shopify-hosted plan URL | Shopify owns plan purchase |
| 7 | Shopify returns after plan selection | `/app/billing/return` | Force verification and embedded redirect to Billing | Query hints never grant access |

### ResponsiveAcceptance

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Merchant opens any Admin workflow on mobile | Actual 390 x 844 Chrome window | Page does not scroll horizontally and all actions remain reachable | Internal labelled data scrollers are allowed |
| 2 | Merchant opens Create Bundle on mobile | Long heading and both bundle cards | Header and card actions stack without clipping or hidden overflow | Visual Chrome verification only |
| 3 | Merchant opens Settings Design on desktop | Actual 1280 x 800 Chrome window | Editor controls and corresponding live preview are visible together | No toggle or page scroll between panes |

## Acceptance Criteria

- [x] Canonical App Bridge navigation and route behavior tests pass.
- [x] Retired route URLs are absent from the Remix route manifest.
- [x] Focused tests, changed-file lint, build, Graphify, and diff checks pass.
- [ ] Direct Chrome desktop and mobile acceptance is recorded without CSS-oriented unit tests. Mobile passed at 390 x 844; the current Chrome session ignored the requested desktop resize.

## Verification Result

- Direct Chrome DevTools passed the 390 x 844 containment sweep for Dashboard,
  Create Bundle, Settings, Settings Controls, Integrations, Analytics, Billing,
  Billing Plans, Events, and both FPB and PPB configure routes. The outer
  Shopify document reported equal 390px scroll and client widths.
- Shopify automatically selected Settings on `/app/settings/controls` and
  Billing on `/app/billing/plans` from the canonical parent URL prefixes.
- Post-change desktop Design verification remains blocked because the Chrome
  window stayed at 390 x 844 after a requested 1280 x 800 resize. The Design
  workspace implementation was not changed in this slice.
