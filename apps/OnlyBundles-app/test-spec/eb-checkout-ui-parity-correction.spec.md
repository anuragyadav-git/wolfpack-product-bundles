---
schema_version: 1
id: eb-checkout-ui-parity-correction
title: EB Checkout UI Parity Correction Test Spec
type: test-spec
status: active
summary: Defines the native add-on discount activation, checkout savings, and bundle cart metadata contracts shared by FPB and PPB.
last_audited: 2026-07-31
owners:
  - engineering
domains:
  - checkout
systems:
  - addon-discount-function-service
  - bundle-discount-function
  - bundle-checkout-ui
  - bundle-cart-transform-rs
source_paths:
  - app/services/addon-discount-function-service.server.ts
  - extensions/bundle-discount-function/src/cart_lines_discounts_generate_run.rs
  - extensions/bundle-checkout-ui/src/Checkout.tsx
related_docs:
  - internal docs/Shopify Integration/Checkout UI Extension.md
  - internal docs/Architecture/Cart Transform Function.md
tags:
  - tdd
  - eb-parity
keywords:
  - Add On
  - TOTAL SAVINGS
  - native discount allocation
---

# Test Spec: EB Checkout UI Parity Correction

**Spec ID:** eb-checkout-ui-parity-correction  **Created:** 2026-07-31

## Purpose

Verify that Shopify owns native add-on discount presentation while Wolfpack renders only the aggregate savings row from native allocations.

## Test Cases

### AddOnDiscountFunctionService

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Exact function resolution | Deployed function handle is `bundle-discount-function` | Resolve that function only | Title and description are not identifiers |
| 2 | Active matching discount | Matching function and `ACTIVE` automatic discount | Return `already_active`; no mutation | Idempotent |
| 3 | Inactive or expired match | Matching function and non-active automatic discount | Activate and return `reactivated` | Must surface activation errors |
| 4 | Missing matching discount | No discount uses the resolved function | Create with `functionHandle`; return `created` | Do not use deprecated `functionId` input |
| 5 | Wrong function | `Add On` discount points at another function | Do not reuse it; create the correct discount | Prevent false success |
| 6 | Shopify error | Query, create, or activate returns errors | Return failure with Shopify error text | Never report success without an active discount |

### Discount Function

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Signed partial add-on | Authorized `addon:PERCENTAGE:10` line | One `10%` product candidate with message `Add On` | Shopify renders native allocation |
| 2 | Signed free add-on | Authorized `addon:PERCENTAGE:100` line | One `100%` product candidate with message `Add On` | Shopify renders `FREE` |
| 3 | Multiple add-ons | Two independently authorized add-on lines | One candidate per line | Bundle isolation retained |
| 4 | Tampered or mismatched token | Invalid signature, variant, quantity, or percentage | No candidate for the invalid line | Fail closed |
| 5 | Generated checkout code | Automatic add-on path plus WPB checkout code | No automatic duplicate candidate | Avoid double discount |

### Checkout UI

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Native allocations | Checkout and line allocation views | Count each native reduction once | No cart metadata fallback |
| 2 | Parent metadata only | `Retail Price` and `_bundle_total_savings_cents` without allocations | Zero savings and no row | Parent savings excluded |
| 3 | Active currency | Native allocation in checkout currency | Locale-aware formatted money | Honor currency fraction digits |
| 4 | Positive savings render | Native allocation greater than zero | Inline discount icon, `TOTAL SAVINGS`, and amount | Component-tree assertion |
| 5 | Zero savings render | No native allocations | `null` | No empty row |

### Widget and Cart Transform

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parent metadata | Widget-created FPB or PPB bundle | Exact `Box`, comma-separated `Items`, `Retail Price`, and `You Save` | Native properties |
| 2 | Expanded components | Actual component lines | Each component retains `Box: 1` | Native expanded list |
| 3 | Add-on isolation | Selected add-on line | Only its own `Box` plus private authorization metadata | No parent properties |
| 4 | Mixed ordinary line | Bundle and normal product | Normal product remains ungrouped and unchanged | Regression coverage |

## Acceptance Criteria

- [ ] Focused Jest suites pass.
- [ ] Both relevant Rust Cargo suites pass.
- [ ] Admin GraphQL, Discount Function input, and Checkout UI component code validate.
- [ ] Checkout TypeScript and modified-file ESLint pass.
- [ ] Widget build and raw syntax checks pass when widget source changes.
- [ ] `npm run graphify:rebuild` and `git diff --check` pass.
- [ ] Documentation and the parity matrix are updated only after direct desktop and mobile proof.
