---
schema_version: 1
id: fpb-mobile-box-selection
title: FPB Mobile Bundle Quantity Options
type: test-spec
status: active
summary: Verifies saved bundle quantity options render consistently and enforce EB tier-switching behavior.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - mobile
keywords:
  - bundle-quantity-options
  - box-selection
---

# Test Spec: FPB Mobile Bundle Quantity Options

**Spec ID:** fpb-mobile-box-selection  **Created:** 2026-07-30

## Purpose

Verify the shared mobile summary renders saved Bundle Quantity Options in every
FPB design preset, omits the selector when no options are configured, and
prevents switching to a tier below the current selected quantity.

## Test Cases

### Mobile Summary Box Selection

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Saved options across presets | Standard, Classic, Compact, Horizontal | Box selector is included in each mobile summary | EB renders the selector in every preset |
| 2 | Options absent or disabled | Renderer returns no selector | Mobile summary contains no box selector | No fallback UI is fabricated |
| 3 | Switch upward | 2 selected, target 3 | Switch is allowed | Existing selections remain |
| 4 | Switch downward below count | 4 selected, target 2 | Switch is refused | Active tier and selections remain |

## Acceptance Criteria

- [ ] Saved Bundle Quantity Options render in all four mobile presets.
- [ ] Missing Bundle Quantity Options remain absent.
- [ ] Tier switching is allowed only when the target fits the selected quantity.
