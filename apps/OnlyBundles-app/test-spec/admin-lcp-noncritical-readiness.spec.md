---
schema_version: 1
id: admin-lcp-noncritical-readiness
title: Admin LCP Noncritical Readiness Test Spec
type: test-spec
status: active
summary: Keeps Admin page content paint independent from noncritical status and banner lookups.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin-performance
systems:
  - remix
source_paths:
  - app/routes/app/_shared/bundle-configure/deferred-configure-sections.ts
  - app/lib/bundle-configure-loader.server.ts
  - app/routes/app/app.dashboard/route.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - lcp
keywords:
  - noncritical readiness
---

# Test Spec: Admin LCP Noncritical Readiness

**Spec ID:** admin-lcp-noncritical-readiness  **Created:** 2026-08-25

## Purpose

Paint useful Dashboard and bundle-configure content without waiting for status checks that only control banners or preview safeguards.

## Test Cases

### Initial Admin Content

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB app-embed status pending | Configure flow is otherwise loaded and `isCriticalStatusReady=false` | FPB configure canvas renders | Live status may update the banner later |
| 2 | PPB app-embed status pending | Configure flow is otherwise loaded and `isCriticalStatusReady=false` | PPB configure canvas renders | Live status may update the banner later |
| 3 | Dashboard proxy-health status pending | Dashboard data is loaded and proxy-health promise is unresolved | Dashboard content renders while the proxy banner remains absent | Proxy health is not page-critical |
| 4 | Dashboard proxy unhealthy | Proxy-health promise resolves false | Proxy warning banner renders | Existing merchant warning remains |
| 5 | Dashboard app-embed status pending | Client status has not resolved | Dashboard content renders while the owned banner shows a native Polaris spinner | Status updates asynchronously without false resolved feedback |
| 6 | Configure route opens on Step Setup | `activeSection=step_setup` | No inactive configure section module is selected for loading | Keeps the initial route chunk focused on the visible section |
| 7 | Configure route opens another section | Supported non-Step Setup section id | Only that section's deferred module key is selected | Image and visibility views share their existing combined section |
| 8 | Configure route initial server paint | Configure editor loads | Closed modal and overlay trees are not part of the initial paint | They become available after client mount |
| 9 | Configure route Shopify loader data | Bundle product id is present or absent | Product, currency, and published locales resolve through one Admin GraphQL request | Avoids three concurrent route-blocking requests |

## Acceptance Criteria

- [x] FPB and PPB configure content does not wait for the app-embed status lookup.
- [x] Preview still performs its established live app-embed guard.
- [x] Dashboard content does not wait for proxy-health or subscription banner data.
- [x] Dashboard content does not wait for the app-embed status lookup.
- [ ] Dashboard App Embed Status owns native Polaris loading feedback while unresolved.
- [x] An unhealthy proxy still produces its warning after deferred data resolves.
- [x] Configure routes load Step Setup without requesting inactive section modules.
- [x] Navigating to another configure section loads the correct section module.
- [x] Closed configure overlays do not block the initial server paint.
- [x] Configure route Shopify data uses one Admin GraphQL request.
