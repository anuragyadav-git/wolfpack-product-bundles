---
schema_version: 1
id: step-condition-save-validation-test-spec
title: "Test Spec: Step Condition Save Validation"
type: test-spec
status: active
summary: Verifies that Admin saves validate merchant-authored step rules without inventing hidden quantity bounds.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - bundle-configuration
systems:
  - fpb-configure
  - ppb-configure
source_paths:
  - app/lib/step-condition-validation.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - testing
  - step-rules
keywords:
  - quantity conditions
  - save validation
  - hidden bounds
---

# Test Spec: Step Condition Save Validation
**Spec ID:** step-condition-save-validation  **Created:** 2026-08-13

## Purpose
Ensure FPB and PPB saves preserve canonical quantity state and validate only merchant-authored step-rule constraints.

## Test Cases
### StepConditionSaveValidation
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Single exact-quantity rule with stale hidden bounds | `equal_to 2`, legacy range `0-0` | Save succeeds | Runtime rule is authoritative |
| 2 | Coherent two-rule quantity interval | `>= 2` and `<= 4` | Save succeeds | Both rules can be satisfied |
| 3 | Contradictory two-rule quantity interval | `>= 4` and `<= 2` | Save fails before persistence | Merchant-authored conflict remains blocked |
| 4 | FPB save transport receives absent bounds | `null` or missing values | Values remain absent; no zero is invented | Prevents hidden state mutation |
| 5 | FPB and PPB percentage tiers coexist with step rules | Total quantity tiers at `2` and `4` | Save succeeds | Discount tiers are bundle-total rules |
| 6 | Bundle pricing receives canonical step quantity | Numeric quantity from app state | Quantity is consumed directly without reparsing | Prevents hidden truncation or fallback |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Canonical step quantities are consumed directly without reparsing
- [x] FPB and PPB no longer compare step rules with hidden `minQuantity` or `maxQuantity`
- [x] Missing quantity values are not converted to zero by Admin save code
- [x] Contradictory merchant-authored step rules still fail clearly
- [x] Shopify-specific quantity normalization remains confined to Shopify integration boundaries
