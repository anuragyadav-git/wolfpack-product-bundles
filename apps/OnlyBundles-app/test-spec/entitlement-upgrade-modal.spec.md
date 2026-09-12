# Test Spec: Entitlement Upgrade Modal
**Spec ID:** entitlement-upgrade-modal  **Created:** 2026-09-12

## Purpose
Verify that when a merchant on the Free plan attempts to save or publish a bundle that exceeds plan entitlements (e.g. 1 active bundle limit, premium template, advanced design, step limit), the app presents a polite, non-intrusive Polaris modal (`<s-modal>`) instead of an aggressive critical error banner. Verify that the modal provides clear remediation actions: primary "View plans", secondary "Save as draft" (which saves changes without error), and "Keep editing" (dismiss).

## Test Cases

### Subscriptions Alert Helpers (`subscription-alerts.test.ts`)
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Public bundle limit reached | `{ code: "LIMIT_REACHED", entitlement: "bundle.public.limit" }` | Returns public limit heading and description keys, with `viewPlans` and `saveAsDraft` actions | Non-aggressive tone |
| 2 | Premium template used | `{ code: "ENTITLEMENT_REQUIRED", entitlement: "bundle.template.premium" }` | Returns premium template heading and description keys, with `viewPlans` and `saveAsDraft` actions | Clear feature context |
| 3 | Advanced design used | `{ code: "ENTITLEMENT_REQUIRED", entitlement: "design.advanced" }` | Returns advanced design heading and description keys, with `viewPlans` and `saveAsDraft` actions | Clear feature context |
| 4 | Step limit reached | `{ code: "LIMIT_REACHED", entitlement: "bundle.steps.limit" }` | Returns step limit heading and description keys, with `viewPlans` and `saveAsDraft` actions | Clear feature context |
| 5 | Fallback entitlement required | `{ code: "ENTITLEMENT_REQUIRED" }` | Returns growth required heading and description keys | Polite fallback |

### EntitlementUpgradeModal Component (`entitlement-upgrade-modal.test.ts`)
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render modal open with public limit failure | `open: true, failure: { code: "LIMIT_REACHED", entitlement: "bundle.public.limit" }` | Renders `<s-modal>` with heading, description, `s-button[slot="primary-action"]` ("View plans"), and `s-button[slot="secondary-actions"]` ("Save as draft") | Zero layout shift |
| 2 | Render modal closed | `open: false` | Modal overlay remains closed | Managed via ref sync |
| 3 | Click "Save as draft" | User clicks secondary action | Calls `onSaveAsDraft` callback | Triggers draft save |
| 4 | Click "View plans" | User clicks primary action | Calls `onViewPlans` or navigates to `/app/billing/plans` | Clear path to upgrade |
| 5 | Modal hide event | Polaris modal fires `hide` | Calls `onClose` callback | Synchronizes state |

### Save Flow Suppression of Error Banner (`ppb-fetcher-effects-entitlement.test.ts` / configure save)
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Save fails with entitlementFailure | Response `{ success: false, entitlementFailure: { code: "LIMIT_REACHED" } }` | Does NOT call `setOperationAlert`; triggers modal state | Banner is suppressed to prevent layout shift |
| 2 | Save fails with system error (no entitlementFailure) | Response `{ success: false, error: "DATABASE_ERROR" }` | Calls `setOperationAlert` with system error | Genuine errors still show |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] No unit tests assert on CSS or styling properties
- [ ] 0 TypeScript errors and 0 ESLint errors introduced
