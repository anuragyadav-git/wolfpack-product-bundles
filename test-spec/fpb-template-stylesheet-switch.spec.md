---
schema_version: 1
id: fpb-template-stylesheet-switch
title: FPB Template Stylesheet Ownership Test Spec
type: test-spec
status: active
summary: Verifies that preset marker updates do not duplicate app-embed stylesheet ownership in the widget runtime.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - storefront
systems:
  - widget-runtime
source_paths:
  - app/assets/widgets/full-page/methods/runtime-cart-settings-methods.ts
  - app/storefront/app-embed.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - stylesheets
keywords:
  - applyFullPageDesignPresetMarker
  - ensureStylesheet
---

# Test Spec: FPB Template Stylesheet Ownership

**Spec ID:** fpb-template-stylesheet-switch  **Created:** 2026-07-02

## Purpose
Ensure the app embed remains the sole FPB stylesheet loader while the widget runtime limits preset updates to DOM markers.

## Test Cases
### FullPageRuntimeCartSettingsMethods
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Runtime preset marker update | Supported preset and a stylesheet-loader spy | Preset markers update without invoking the loader | App embed owns stylesheet loading before widget initialization |

## Acceptance Criteria
- [x] Runtime preset updates do not load or switch stylesheets.
