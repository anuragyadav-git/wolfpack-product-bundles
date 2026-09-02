---
schema_version: 1
id: checkout-ui-total-savings
title: Checkout UI Total Savings Test Spec
type: test-spec
status: active
summary: Defines checkout total-savings behavior for native discounts and transformed bundle lines.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - checkout
systems:
  - bundle-checkout-ui
source_paths:
  - extensions/bundle-checkout-ui/src/Checkout.tsx
related_docs:
  - docs/competitor-analysis/checkout-page-parity-matrix.md
tags:
  - checkout
  - parity
keywords:
  - total savings
  - checkout extension
---

# Test Spec: Checkout UI Total Savings
**Spec ID:** checkout-ui-total-savings  **Created:** 2026-06-30

## Purpose
Match EB checkout order-summary savings behavior for bundle carts without reintroducing the removed cart-line savings panel.

## Test Cases
### TotalSavingsExtension
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | No savings | Empty discounts and no bundle savings attributes | Component returns `null` | Avoids noise on undiscounted carts |
| 2 | Native add-on discount | Line discount allocation for selected add-on | `TOTAL SAVINGS` row with formatted amount | Matches EB native checkout proof |
| 3 | Cart Transform savings | Bundle parent `_bundle_total_savings_cents` with no native allocation | Same savings amount is included | Covers merged parent bundle savings |
| 4 | Filtered private attributes | Public `Retail Price` plus native line cost | Difference is included once | Covers checkout runtimes that omit private line attributes |
| 5 | Native and derived savings overlap | Native allocation and retail-price difference represent the same discount | Larger value is used once | Prevents double counting |
| 6 | Zero-decimal currency | JPY savings | Currency-native formatting without decimal places | Avoids hard-coded USD precision |
| 7 | Discounted add-on plus parent price delta | Native add-on allocation and parent bundle savings metadata | Only the native checkout discount is shown | Matches direct EB rich-cart evidence |

## Acceptance Criteria
- [x] Focused checkout UI unit test passes.
- [x] Shopify checkout UI component validation passes for `purchase.checkout.reductions.render-after`.
- [x] Checkout UI TypeScript check passes.
