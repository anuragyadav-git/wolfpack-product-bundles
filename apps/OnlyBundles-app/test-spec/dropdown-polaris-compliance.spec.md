# Test Spec: Dropdown Polaris Compliance
**Spec ID:** dropdown-polaris-compliance  **Created:** 2026-09-12

## Purpose
Audit and enforce Shopify Polaris Web Component guidelines across all `<s-select>` dropdowns in configure pages (Full-Page Bundle & Product-Page Bundle) and Dashboard. Ensure dropdowns use Polaris native attributes (`placeholder`, `label`) rather than displaying dummy `<s-option value="" disabled>` items that duplicate placeholder or label copy in the option list itself.

## Test Cases
### DropdownPolarisCompliance
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB Step rule type select | `PpbStepRulesList` renders rule type select | `placeholder` attribute provided on `<s-select>`, no `<s-option value="" disabled>` rendered | Prevents showing "Type" as option in dropdown |
| 2 | PPB Step rule operator select | `PpbStepRulesList` renders rule operator select | `placeholder` attribute provided on `<s-select>`, no `<s-option value="" disabled>` rendered | Prevents showing "Condition" as option in dropdown |
| 3 | FPB Step rule type select | `StepSetupRuleModeContent` renders step rule type select | `placeholder` attribute provided on `<s-select>`, no `<s-option value="" disabled>` rendered | Prevents showing "Type" as option in dropdown |
| 4 | FPB Step rule operator select | `StepSetupRuleModeContent` renders step rule operator select | `placeholder` attribute provided on `<s-select>`, no `<s-option value="" disabled>` rendered | Prevents showing "Condition" as option in dropdown |
| 5 | PPB Discount type select | `PpbDiscountRulesPanel` renders discount type dropdown | `label` prop on `<s-select>`, no external `<p>` label tag | Adheres to Polaris native label composition |
| 6 | Option selection event delegation | User changes select value in rule row | `updateConditionRule` / `updateStepConditionRule` called with new value | Ensures change dispatch works as expected |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] No regression errors in existing unit tests
- [ ] Clean lint run on all modified files
