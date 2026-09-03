---
schema_version: 1
id: fpb-widget-initialization
title: FPB Widget Initialization Claim
type: test-spec
status: active
summary: Verifies single-controller FPB bootstrap, retry safety, and stable initial full-page geometry.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/bundle-widget-full-page.js
  - app/assets/widgets/full-page/initialization-guard.js
  - app/assets/widgets/full-page-css/base/bootstrap-reservation.css
  - app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - initialization
keywords:
  - duplicate-bootstrap
  - initialization-claim
---

# Test Spec: FPB Widget Initialization Claim

**Spec ID:** fpb-widget-initialization  **Created:** 2026-08-04

## Purpose

Prevent the app embed script-load callback and the widget bundle's own bootstrap from constructing two FPB controllers for the same container, and keep late storefront rendering from shifting the page footer through the viewport.

## Test Cases

### FullPageWidgetInitialization

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | First bootstrap claims an idle container | Empty dataset | Claim succeeds and marks initialization in progress | Synchronous guard |
| 2 | Concurrent bootstrap reaches the same container | Dataset already marked in progress | Claim is rejected | Prevents duplicate fetches and render |
| 3 | Bootstrap runs after successful initialization | Dataset marked initialized | Claim is rejected | Preserves one controller |
| 4 | Failed initialization releases the claim | In-progress marker removed after failure | A later claim succeeds | Keeps recovery retryable |

### StorefrontChromeQA

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Full-page widget hydrates after the theme shell | Cache-bypass reload at 1280×800 and 390×844 | The initial widget host reserves viewport-relative block space and measured CLS remains below 0.1 | Direct Chrome proof; no CSS unit assertion |
| 2 | App embed and widget bundle bootstrap overlap | Instrumented cache-bypass reload | Language settings, controls settings, and bundle view each occur once | Direct Chrome proof |
| 3 | Product quantity controls receive keyboard focus | Add a product, then tab to the decrement control | The product card height remains stable and the visible focus outline stays inside every clipping ancestor | Direct Chrome proof; no styling-source assertion |

## Acceptance Criteria

- [x] Concurrent FPB bootstrap calls construct one controller.
- [x] Successful initialization cannot be claimed again.
- [x] Failed initialization can be retried after the in-progress marker is released.
- [x] Desktop and mobile hard reloads keep measured CLS below 0.1.
- [x] Language settings, controls settings, and bundle view requests each occur once per load.
- [x] Product selection preserves card height and the keyboard focus outline is not clipped.
- [x] Existing FPB loading, rendering, and storefront behavior remain unchanged.

## Verification Evidence

- Direct Chrome cache-bypass reloads measured CLS `0` at both `1280×800` and `390×844`.
- Language settings, controls settings, and bundle-view requests each occurred once per reload, with no failed app-proxy request.
- Selecting the first product changed card height by `0px`; keyboard focus on the decrement control remained visible and unclipped at both viewports.
- Two same-policy mobile lab traces measured CLS `0.00`. The saved gzip traces have SHA-256 hashes `7d40afcf048b80062314efaa9b9ed2732a5653c1712abc84f00ac67b2f0491b7` and `90a475e16b2888bcdd37f120f8c32bc13c4d56a2451610137b7a258d1493a218`.
