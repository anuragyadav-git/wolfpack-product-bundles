---
schema_version: 1
id: fpb-fixed-price-sidebar-cta
title: FPB Fixed Price Sidebar CTA Test Spec
type: test-spec
status: active
summary: Verifies FPB sidebar tier CTA copy follows pricing semantics and the shopper-selected bundle quantity option.
last_audited: 2026-08-06
owners:
  - storefront
domains:
  - bundles
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/box-selection-sidebar-methods.js
related_docs:
  - design-jobs/fpb-all-template-summary-20260804/state-matrix.md
tags:
  - fpb
  - storefront
keywords:
  - bundle quantity options
  - tier CTA
---

# Test Spec: FPB Fixed Price Sidebar CTA
**Spec ID:** fpb-fixed-price-sidebar-cta  **Created:** 2026-06-12

## Purpose
Verify FPB Standard summary sidebar CTA text does not render stale percentage subtext for fixed bundle price rules.

## Test Cases
### fullPageBoxSelectionSidebarMethods.getSidebarTierCtaContent
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Fixed bundle price rule with stale saved subtext | `fixed_bundle_price`, `discountValue: 500000`, saved subtext `500000% off` | `{ label: "Box of 5", subtext: "Bundle for PKR5000.00" }` | Uses actual rule price |
| 2 | Percentage rule with saved subtext | `percentage_off`, saved subtext `10% off` | Saved subtext remains | Merchant copy still wins for percentage discounts |
| 3 | Shopper switches the active bundle quantity option | Default rule `rule-2`; runtime selection `rule-4` | CTA uses the label and subtext saved for `rule-4` | Active storefront state must override the configured default |

## Acceptance Criteria
- [ ] Fixed bundle price sidebar CTA derives subtext from the pricing rule value.
- [ ] Stale percentage-looking saved subtext is not shown for fixed bundle price.
- [ ] The sidebar CTA follows the shopper-selected bundle quantity option.
- [ ] Non-fixed-price CTA behavior is preserved.
