---
schema_version: 1
id: fpb-proxy-bootstrap-skeleton
title: FPB Proxy Bootstrap Loading Screen Test Spec
type: test-spec
status: active
summary: Verifies that the FPB app-proxy document reserves a customizable pure loading screen before widget hydration.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-app-proxy
source_paths:
  - app/routes/root/wpb.$bundleId.tsx
  - app/assets/widgets/full-page-css/base/bootstrap-reservation.css
  - app/assets/widgets/full-page/bootstrap-skeleton.ts
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - fpb
  - loading
keywords:
  - bootstrap loading screen
  - first paint
---

# Test Spec: FPB Proxy Bootstrap Loading Screen

**Spec ID:** fpb-proxy-bootstrap-skeleton  **Created:** 2026-08-10

## Purpose

Verify that Shopify receives an accessible, server-rendered FPB loading screen that remains visible until the app embed hydrates the real widget.

## Test Cases

### FPBProxyPageLoader

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render an active FPB proxy document | Signed proxy request for an active full-page bundle and store Design settings | Liquid marker contains one pure loading screen with the saved background and either the saved GIF or default spinner | No card or summary skeletons are emitted |
| 2 | Hydrate the proxy marker | Marker containing the server-rendered loading screen | App embed moves the same screen into the widget container until initialization finishes | Prevents a first-paint replacement flash |

## Acceptance Criteria

- [ ] The focused FPB proxy route tests pass.
- [ ] The loading screen is present in the server-rendered Liquid response.
- [ ] The loading screen exposes an accessible status name.
- [ ] The widget container exposes `aria-busy="true"` until rendering completes.
- [ ] Hydration preserves the loading screen inside the widget container.
- [ ] Slow-network desktop and mobile hard reloads show the loading screen before widget hydration.
- [ ] No transient card or sidebar skeleton is emitted.
