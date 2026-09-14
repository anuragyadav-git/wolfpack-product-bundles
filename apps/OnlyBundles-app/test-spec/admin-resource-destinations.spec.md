---
schema_version: 1
id: admin-resource-destinations
title: Admin Resource Destinations
type: test-spec
status: active
summary: Verifies that Admin help and resource actions use current public destinations while unavailable gallery resources remain inert.
last_audited: 2026-09-14
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
| 1 | Shared external destination | App brand links | Company URL uses https://onlybundles.com; listing retains the official Shopify App Store destination | No dependency on an expired company domain |
| 2 | Dashboard resources | Dashboard resources card | SDK documentation opens the public guide; gallery previews remain unavailable and non-interactive | Support remains functional |
| 3 | Integration setup | Integration catalog | View Setup opens app-owned guide content from `guideSummary` without an external URL | Avoids unrelated external navigation |
| 4 | Welcome documentation | Intentional `/app` landing | Documentation is non-interactive until a verified public guide exists | No unresolved documentation hostname |

Visual placement is verified in Chrome rather than in a source/CSS assertion:
each Dashboard resource uses a Polaris inline stack so its icon and label remain
in one row at desktop and mobile widths.

## Acceptance Criteria

- [x] No application-owned Admin action references `wolfpackapps.com`.
- [x] SDK documentation opens the canonical public guide and unavailable gallery previews cannot open a browsing context.
- [x] Every integration guide retains at least one app-owned setup instruction.
- [x] Dashboard resource icons and labels remain aligned in one row after an
  Agent-store hard reload at desktop and the minimum-width real Chrome window.
- [x] All listed test cases pass.

## Verification Notes

- Agent-store Chrome QA passed at 1280x800 after a cache-bypassing reload.
- The requested 390x844 resize was clamped by Chrome to an actual 500x844
  content area. At that minimum real-window width, all three resource icons and
  labels remained inline without clipping or horizontal overflow. No viewport
  emulation was used.
