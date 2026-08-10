---
schema_version: 1
id: fpb-proxy-bootstrap-skeleton
title: FPB Proxy Bootstrap Skeleton Test Spec
type: test-spec
status: active
summary: Verifies that the FPB app-proxy document reserves a visible loading structure before widget hydration.
last_audited: 2026-08-10
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
  - bootstrap skeleton
  - first paint
---

# Test Spec: FPB Proxy Bootstrap Skeleton

**Spec ID:** fpb-proxy-bootstrap-skeleton  **Created:** 2026-08-10

## Purpose

Verify that Shopify receives a decorative, server-rendered FPB loading structure that remains visible until the app embed hydrates the real widget.

## Test Cases

### FPBProxyPageLoader

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render an active FPB proxy document | Signed proxy request for an active full-page bundle | Liquid marker contains one hidden-from-assistive-technology skeleton with four card placeholders | The app embed owns the atomic handoff to the real widget |
| 2 | Hydrate the proxy marker | Marker containing the server-rendered skeleton | App embed moves the skeleton into the widget container until initialization replaces it | The loading state must not degrade to a generic spinner |

## Acceptance Criteria

- [ ] The focused FPB proxy route tests pass.
- [ ] The skeleton is present in the server-rendered Liquid response.
- [ ] The skeleton is decorative and excluded from the accessibility tree.
- [ ] Hydration preserves the skeleton inside the widget container.
- [ ] Slow-network desktop and mobile hard reloads show the skeleton before widget hydration.
