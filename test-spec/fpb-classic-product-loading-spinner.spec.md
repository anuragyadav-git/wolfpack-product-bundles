---
schema_version: 1
id: fpb-classic-product-loading-spinner
title: FPB Product Loading Screen Test Spec
type: test-spec
status: active
summary: Verifies that every FPB preset uses the shared store-level loading screen while product data is pending.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/full-page/methods/product-grid-methods.ts
  - app/assets/widgets/full-page/methods/runtime-cart-settings-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - loading
keywords:
  - loading screen
  - spinner
---

# Test Spec: FPB Classic Product Loading Spinner
**Spec ID:** fpb-classic-product-loading-spinner  **Created:** 2026-07-06

## Purpose
Ensure every FPB preset uses the shared loading screen until product data is populated instead of rendering product-card skeletons.

## Test Cases
### ProductGridLoadingState
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Product grid enters pending state | Standard, Classic, Compact, or Horizontal | Product-grid container is empty and the shared loading overlay is shown | Prevents provisional card geometry |
| 2 | No merchant GIF is configured | Store-level loading screen has no GIF URL | Shared loading overlay renders the default CSS spinner | Default path |
| 3 | Merchant GIF is configured | Store-level loading screen has an HTTPS GIF URL | Shared loading overlay renders the saved GIF on the saved background | Design setting path |

## Acceptance Criteria
- [ ] Every FPB preset shows the shared loading screen, not product-card skeletons.
- [ ] The merchant GIF and background are store-level Design settings.
