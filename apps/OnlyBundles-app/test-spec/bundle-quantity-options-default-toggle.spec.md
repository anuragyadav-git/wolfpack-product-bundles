# Test Spec: Bundle Quantity Options Default Rule Toggle
**Spec ID:** bundle-quantity-options-default-toggle  **Created:** 2026-09-12

## Purpose
Ensure that in bundle quantity options (both Product Page Bundle and Full Page Bundle configure pages), 'Make this rule default' is presented as a native Polaris toggle (`<s-switch>`) instead of a button/press-button, reducing merchant confusion while preserving the header layout placement and selection behavior.

## Test Cases
### BundleQuantityOptionsDefaultToggle
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB quantity options default rule toggle rendering | `PpbDiscountDisplayOptions` with rules and `qtyOptionsDefaultRuleId` matching rule 1 | Renders `<s-switch>` with label "Make this rule default" and checked state on rule 1 | Uses native Polaris `<s-switch>` |
| 2 | PPB quantity options default rule toggle activation | Toggle switch on rule 2 | Calls `setQtyOptionsDefaultRuleId("rule-2")` and marks dirty | Sets rule 2 as default |
| 3 | PPB quantity options default rule toggle deactivation | Toggle switch off on active default rule | Calls `setQtyOptionsDefaultRuleId(null)` and marks dirty | Clears default rule |
| 4 | FPB quantity options default rule toggle rendering | `DiscountBundleQuantityOptions` with normalized options where option 1 is default | Renders `<s-switch>` with label "Make this rule default" and checked state on option 1 | Uses native Polaris `<s-switch>` |
| 5 | FPB quantity options default rule toggle activation | Toggle switch on option 2 | Calls `pricingState.setBundleQuantityDefaultRule("rule-2")` | Sets option 2 as default |
| 6 | FPB quantity options default rule toggle deactivation | Toggle switch off on active default option | Calls `pricingState.setBundleQuantityDefaultRule(null)` | Clears default rule |

## Acceptance Criteria
- [ ] All listed test cases pass
