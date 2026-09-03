---
schema_version: 1
id: fpb-desktop-box-selection
title: FPB Desktop Bundle Quantity Options
type: test-spec
status: active
summary: Verifies enabled bundle quantity options render through the shared desktop summary sidebar across every FPB template.
last_audited: 2026-08-13
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.ts
  - app/assets/widgets/full-page-css/base/toast-sidebar-shell.css
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - fpb
  - desktop
keywords:
  - bundle-quantity-options
  - box-selection
  - summary-sidebar
---

# Test Spec: FPB Desktop Bundle Quantity Options

**Spec ID:** fpb-desktop-box-selection  **Created:** 2026-08-13

## Purpose

Verify the shared desktop summary sidebar renders saved Bundle Quantity Options
for every FPB design preset and omits the selector when no options are enabled.
Chrome visual verification owns placement and styling evidence.

## Test Cases

### Desktop Summary Box Selection

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Saved options across presets | Standard, Classic, Compact, Horizontal | Shared box selector is included in each desktop summary | No preset-specific render branch |
| 2 | Options absent or disabled | Renderer returns no selector | Desktop summary contains no box selector | No fallback UI is fabricated |

## Acceptance Criteria

- [x] Saved Bundle Quantity Options render in all four desktop presets.
- [x] Missing Bundle Quantity Options remain absent.
- [x] Placement and responsive styling are verified in Chrome rather than unit tests.
