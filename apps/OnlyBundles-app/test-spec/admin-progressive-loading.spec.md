---
schema_version: 1
id: admin-progressive-loading
title: Admin Progressive Loading
type: test-spec
status: active
summary: Verifies Shopify-native route loading and progressive Polaris feedback without page-level skeletons or artificial delays.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - remix
  - app-bridge
source_paths:
  - app/routes/app/app.tsx
  - app/components/AdminSectionLoadingState.tsx
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - lcp
  - loading
keywords:
  - progressive loading
  - Shopify loading API
---

# Test Spec: Admin Progressive Loading

**Spec ID:** admin-progressive-loading  **Created:** 2026-08-25

## Purpose

Keep stable Admin content visible while Shopify owns route-transition feedback and deferred regions use small Polaris loading states.

## Test Cases

### AdminProgressiveLoading

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Child route navigation starts | Remix loads a different pathname | Shopify Admin loading API starts | Existing outlet remains visible |
| 2 | Navigation settles or shell unmounts | Loading state becomes false or effect cleans up | Shopify Admin loading API stops | Prevents a stuck header indicator |
| 3 | Deferred region is pending | Region label is provided | Polaris spinner and visible accessible label render | No custom CSS or skeleton geometry |
| 4 | Analytics data remains pending | Route shell has mounted | Analytics title and critical funnel heading render before the deferred body | Deferred dashboard stays hidden |
| 5 | Controls navigation is pending | Settings landing has already rendered | Settings cards remain visible | Shopify owns transition feedback |
| 6 | Settings workspace data is pending | Design or Language was selected | Destination title and inline Polaris loading state render | No artificial minimum delay |
| 7 | Pricing subscription is pending | Pricing route has mounted | Pricing title and inline Polaris loading state render | No card skeleton |
| 8 | Analytics route shell loads | Initial route chunk is requested | Dashboard component and CSS load with the eager route owner before deferred markup can render | Prevents unstyled dashboard paint |
| 9 | Auth destination is resolving | `/app` is preparing the Dashboard redirect | The native workspace spinner and text are centered in the iframe | Chrome visual verification only |
| 10 | Configure section module is pending | Merchant selects a lazy FPB or PPB section | The main column renders the native Polaris workspace spinner until that section is ready | Sidebar, header, and controller state stay mounted |

## Acceptance Criteria

- [x] Shopify owns route-transition feedback.
- [x] Stable route content is not replaced during navigation.
- [x] Deferred regions use Polaris loading feedback without skeleton cards.
- [x] No loading helper adds a minimum wait.
- [x] Analytics critical shell paints before deferred dashboard content.
- [ ] Analytics dashboard CSS loads with the eager route shell.
- [x] The `/app` redirect workspace feedback is centered with one page-owned layout rule.
- [x] FPB and PPB section boundaries replace their blank fallback with Polaris loading feedback.
