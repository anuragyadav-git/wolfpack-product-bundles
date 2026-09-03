---
schema_version: 1
id: ppb-mobile-summary-footer-test-spec
title: PPB Mobile Summary Footer Test Spec
type: test-spec
status: active
summary: Defines behavior and browser acceptance coverage for the shared PPB mobile summary footer and product picker close control.
last_audited: 2026-08-20
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-bundle-widget
source_paths:
  - app/assets/widgets/product-page/templates/cascade-summary.ts
  - app/assets/widgets/product-page/templates/cascade-template.ts
  - app/assets/widgets/product-page-css/base/inpage-shared-footer.css
related_docs:
  - test-spec/ppb-product-drawer-parity.spec.md
tags:
  - ppb
  - mobile
keywords:
  - summary footer
  - selected drawer
---

# Test Spec: PPB Mobile Summary Footer
**Spec ID:** ppb-mobile-summary-footer  **Created:** 2026-08-20

## Purpose

Protect quantity and pricing behavior in the shared Product List and Product Grid mobile summary while keeping styling verification in Chrome DevTools.

## Test Cases

### SummaryContent

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Empty selection | Quantity `0`, zero total, no discount | Quantity and payable total are returned; compare-at total is empty | Keeps the summary informative before selection |
| 2 | Undiscounted selection | Summed quantity and equal retail/payable totals | Summed quantity and payable total are returned; compare-at total is empty | Avoids duplicate prices |
| 3 | Discounted selection | Discounted payable total differs from retail total | Payable total and retail compare-at total are returned | Supports the partitioned pill |
| 4 | Rounded totals match | Discount qualifies but formatted totals match | Compare-at total is empty | Prevents misleading strike-through content |

### ChromeAcceptance

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Mobile shared footer | Product List and Product Grid at `390x844` | Chevron, cart/count, divider, payable total, and optional compare-at total fit without wrapping | Clear cache and hard reload first |
| 2 | Expanded selected drawer | Two selected products | One shell rule, one heading rule, no doubled borders, and no CTA overlap | Verify computed geometry |
| 3 | Product picker close | `PDP_MODAL` open on mobile | Centered chevron close control is visible, keyboard focusable, and at least `44x44` | Desktop close remains unchanged |

## Acceptance Criteria

- [ ] All listed behavior tests pass.
- [ ] Product List and Product Grid share the same mobile summary contract.
- [ ] Desktop retains the localized label presentation.
- [ ] Cache-cleared mobile and desktop Chrome checks pass.
