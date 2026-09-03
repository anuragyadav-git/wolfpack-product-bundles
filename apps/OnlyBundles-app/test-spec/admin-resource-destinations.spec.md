---
schema_version: 1
id: admin-resource-destinations
title: Admin Resource Destinations
type: test-spec
status: active
summary: Verifies that Admin help and resource actions use current public destinations while unavailable gallery resources remain inert.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
  - integrations
source_paths:
  - app/lib/app-brand.ts
  - app/routes/app/app.dashboard/DashboardResourcesCard.tsx
  - app/routes/app/app.integrations/IntegrationsRouteShell.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - qa
  - resource-links
keywords:
  - sdk-documentation
  - integration-guides
---

# Test Spec: Admin Resource Destinations
**Spec ID:** admin-resource-destinations  **Created:** 2026-08-30

## Purpose

Keep merchant-facing Admin resources on verified destinations and prevent unavailable documentation or gallery actions from opening expired domains.

## Test Cases

### AdminResourceDestinations

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shared external destination | App brand links | Company and listing URLs use the verified official Shopify App Store surfaces | No dependency on an expired company domain |
| 2 | Dashboard resources | Dashboard resources card | SDK documentation opens the public guide; gallery previews remain unavailable and non-interactive | Support remains functional |
| 3 | Integration setup | Integration catalog | View Setup opens app-owned guide content from `guideSummary` without an external URL | Avoids unrelated external navigation |
| 4 | Welcome documentation | Intentional `/app` landing | Documentation is non-interactive until a verified public guide exists | No unresolved documentation hostname |

## Acceptance Criteria

- [x] No application-owned Admin action references `wolfpackapps.com`.
- [x] SDK documentation opens the canonical public guide and unavailable gallery previews cannot open a browsing context.
- [x] Every integration guide retains at least one app-owned setup instruction.
- [x] All listed test cases pass.
