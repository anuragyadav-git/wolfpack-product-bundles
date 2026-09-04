---
schema_version: 1
id: fpb-summary-total-price-color
title: FPB Summary Total Price Color
type: test-spec
status: active
summary: Verifies that the default colour for the total price in the summary sidebar across all FPB templates is black (#000).
last_audited: 2026-09-04
owners:
  - storefront
domains:
  - bundles
systems:
  - full-page-bundle
source_paths:
  - app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css
  - extensions/bundle-builder/assets/bundle-widget-full-page.css
related_docs: []
tags:
  - fpb
  - storefront
  - summary-sidebar
  - pricing
keywords:
  - total-price
  - sidebar
  - summary
  - color
  - black
---

# Test Spec: FPB Summary Total Price Color

**Spec ID:** fpb-summary-total-price-color  **Created:** 2026-09-04

## Purpose

Ensure the total price (`.side-panel-total-final`) in the summary sidebar for all Full Page Bundle (FPB) design presets (`STANDARD`, `CLASSIC`, `COMPACT`, `HORIZONTAL`) defaults to black (`#000` / `rgb(0, 0, 0)`) instead of orange (`#e65100`).

## Test Cases

### Visual Parity & Stylesheet Defaults
| # | Scenario | Selector | Expected Value | Notes |
|---|----------|----------|----------------|-------|
| 1 | Standard preset summary total price color | `.side-panel-total-final` | `rgb(0, 0, 0)` (`#000`) | Verified via Chrome DevTools MCP computed style |
| 2 | Classic preset summary total price color | `.side-panel-total-final` | `rgb(0, 0, 0)` (`#000`) | Inherited from base `sidebar-totals-discounts.css` |
| 3 | Compact preset summary total price color | `.side-panel-total-final` | `rgb(0, 0, 0)` (`#000`) | Inherited from base `sidebar-totals-discounts.css` |
| 4 | Horizontal preset summary total price color | `.side-panel-total-final` | `rgb(0, 0, 0)` (`#000`) | Inherited from base `sidebar-totals-discounts.css` |
| 5 | Asset size limit check | `bundle-widget-full-page.css` | <= 100,000 bytes | Shopify app-block asset limit |

## Acceptance Criteria

- [ ] `.side-panel-total-final` color variable fallback in `sidebar-totals-discounts.css` is `#000`
- [ ] Minified `bundle-widget-full-page.css` has `color:var(--bundle-side-panel-total-final-color,#000)`
- [ ] Computed color on live storefront page is `rgb(0, 0, 0)`
- [ ] `bundle-widget-full-page.css` remains within the 100,000 B Shopify asset limit
