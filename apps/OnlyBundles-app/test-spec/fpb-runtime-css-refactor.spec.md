---
schema_version: 1
id: fpb-runtime-css-refactor
title: FPB Runtime CSS Ownership
type: test-spec
status: active
summary: Defines behavior coverage for app-embed-owned FPB stylesheets and data-only runtime styling.
last_audited: 2026-08-11
owners:
  - Aditya Awasthi
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/storefront/app-embed.ts
  - app/assets/widgets/full-page/methods/runtime-cart-settings-methods.ts
  - app/assets/widgets/full-page/methods/responsive-layout-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - fpb
  - tdd
keywords:
  - stylesheet ownership
  - runtime styles
---

# Test Spec: FPB Runtime CSS Ownership

**Spec ID:** fpb-runtime-css-refactor  **Created:** 2026-08-11

## Purpose

Verify that the app embed owns FPB stylesheet loading, canonical renders cannot add duplicate links, and runtime styling remains limited to merchant or data-driven values.

## Test Cases

### FullPageStylesheetOwnership

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | App embed resolves active preset | Any supported preset | Base, mobile-summary, active-preset, and responsive URLs are selected once | Asset behavior only; no CSS declarations are asserted. |
| 2 | Existing stylesheet | Hydration repeats with an already-loaded URL | No duplicate link is appended | Covers section reload and duplicate bootstrap triggers. |
| 3 | Preset marker rerender | Canonical FPB rerender | No stylesheet is created, disabled, or switched by the widget controller | App embed is the sole owner. |
| 4 | Merchant Custom CSS rerender | Bundle CSS changes | One owned style element is updated or removed | Merchant CSS remains supported without accumulation. |

### CanonicalFullPageRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Authoritative app-proxy payload | Source-marked matching full bundle payload | Render without a bundle JSON request | Primary source remains unchanged. |
| 2 | Missing or malformed payload | Valid bundle ID | Existing bundle JSON fallback runs | Preserve the single 503/504 retry. |
| 3 | Supported FPB preset | Standard, Classic, Compact, Horizontal | Canonical sidebar layout and shared container-mounted tray are used | No footer-bottom or body portal branch. |
| 4 | Summary rerender | Selection or step changes | Existing sidebar/tray updates without a duplicate summary surface | Pricing and selection semantics remain unchanged. |

## Acceptance Criteria

- [x] All listed behavior tests pass.
- [x] Existing selection, pricing, cart, add-on, box-selection, and modal tests remain green.
- [x] No test reads CSS or source text to assert styling, class names, or placement.
- [x] Chrome DevTools verifies visual ownership after a cache-bypassing hard reload.
