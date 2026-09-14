# Test Spec: Template Gating & Modal Dismiss Revert
**Spec ID:** template-gating-and-modal-revert  **Created:** 2026-09-12

## Purpose
Verify that:
1. Server-side entitlement validation (`assertTemplateSelectionAllowed`) strictly blocks selection and saving of the 6 gated templates on the Free plan, while allowing the 2 standard free templates (`LIST`/`PDP_INPAGE` for PPB, `STANDARD`/`FBP_SIDE_FOOTER` for FPB).
2. The `updateBundleDesignTemplate` route handlers for both PPB and FPB reject gated templates with HTTP 403 and `EntitlementDeniedError` when invoked by Free plan shops.
3. Both PPB and FPB template selection dialogs display the Growth upgrade conversion callout at the top of the modal and gate the 3 non-standard templates for Free plan users (disabling selection and displaying the Growth badge).
4. When `EntitlementUpgradeModal` is dismissed or closed without saving, the changes that triggered the modal (e.g. status changed to ACTIVE/UNLISTED or excess steps) are reverted to their original or draft values.

## Test Cases

### TemplateEntitlementGate
| # | Scenario | Input | Expected Output | Notes |
| 1 | Free plan PPB standard template allowed | `{ bundleType: "PRODUCT_PAGE", designPresetId: "LIST", designTemplate: "PDP_INPAGE", entitlements: Free }` | Does not throw | Standard PPB template |
| 2 | Free plan PPB default (nulls) allowed | `{ bundleType: "PRODUCT_PAGE", designPresetId: null, designTemplate: null, entitlements: Free }` | Does not throw | Defaults to standard |
| 3 | Free plan PPB GRID template blocked | `{ bundleType: "PRODUCT_PAGE", designPresetId: "GRID", designTemplate: "PDP_INPAGE", entitlements: Free }` | Throws `EntitlementDeniedError` (`bundle.template.premium`) | Gated PPB template 1 |
| 4 | Free plan PPB HORIZONTAL_SLOTS blocked | `{ bundleType: "PRODUCT_PAGE", designPresetId: "HORIZONTAL_SLOTS", designTemplate: "PDP_MODAL", entitlements: Free }` | Throws `EntitlementDeniedError` (`bundle.template.premium`) | Gated PPB template 2 |
| 5 | Free plan PPB VERTICAL_SLOTS blocked | `{ bundleType: "PRODUCT_PAGE", designPresetId: "VERTICAL_SLOTS", designTemplate: "PDP_MODAL", entitlements: Free }` | Throws `EntitlementDeniedError` (`bundle.template.premium`) | Gated PPB template 3 |
| 6 | Free plan FPB standard template allowed | `{ bundleType: "FULL_PAGE", designPresetId: "STANDARD", designTemplate: "FBP_SIDE_FOOTER", entitlements: Free }` | Does not throw | Standard FPB template |
| 7 | Free plan FPB CLASSIC template blocked | `{ bundleType: "FULL_PAGE", designPresetId: "CLASSIC", designTemplate: "FBP_SIDE_FOOTER", entitlements: Free }` | Throws `EntitlementDeniedError` (`bundle.template.premium`) | Gated FPB template 1 |
| 8 | Free plan FPB COMPACT template blocked | `{ bundleType: "FULL_PAGE", designPresetId: "COMPACT", designTemplate: "FBP_SIDE_FOOTER", entitlements: Free }` | Throws `EntitlementDeniedError` (`bundle.template.premium`) | Gated FPB template 2 |
| 9 | Free plan FPB HORIZONTAL template blocked | `{ bundleType: "FULL_PAGE", designPresetId: "HORIZONTAL", designTemplate: "FBP_SIDE_FOOTER", entitlements: Free }` | Throws `EntitlementDeniedError` (`bundle.template.premium`) | Gated FPB template 3 |
| 10 | Growth plan allows all templates | All 8 templates with Growth entitlements | Does not throw | Growth plan includes all |
| 11 | Fails closed on missing entitlements | Gated template with null entitlements | Throws `EntitlementDeniedError` | Security fail-closed |

### ServerActionTemplateGating
| # | Scenario | Input | Expected Output | Notes |
| 1 | PPB action rejects gated template on Free plan | `handleUpdateBundleDesignTemplate` with `bundleDesignPresetId="GRID"`, Free plan | Returns 403 JSON with `error` and `entitlementFailure` | Server action security |
| 2 | FPB action rejects gated template on Free plan | `handleUpdateBundleDesignTemplate` with `bundleDesignPresetId="CLASSIC"`, Free plan | Returns 403 JSON with `error` and `entitlementFailure` | Server action security |
| 3 | PPB action accepts standard template on Free plan | `handleUpdateBundleDesignTemplate` with `bundleDesignPresetId="LIST"`, Free plan | Returns 200 JSON `{ success: true }` | Standard template allowed |

### ModalDismissRevert
| # | Scenario | Input | Expected Output | Notes |
| 1 | Dismiss reverts status to original DRAFT | Modal open on `bundle.public.limit`, original status was DRAFT, user closes modal | `setBundleStatus` called with DRAFT, `clearEntitlementFailure` called | Status change reverted |
| 2 | Dismiss reverts status to DRAFT if original was ACTIVE | Modal open on `bundle.public.limit`, original status was ACTIVE, user closes modal | `setBundleStatus` called with DRAFT, `clearEntitlementFailure` called | Cannot stay active |
| 3 | Dismiss restores steps on `bundle.steps.limit` | Modal open on `bundle.steps.limit`, user closes modal | `stepsState.setSteps` called with original steps | Step additions reverted |

### TemplateModalEntitlementRedirection
| # | Scenario | Input | Expected Output | Notes |
| 1 | PPB Next with gated template on Free plan | `handleTemplateNext` invoked with gated template and `isFreePlan: true` | `setIsSelectTemplateModalOpen(false)`, `setEntitlementFailure(...)` called, no `templateSaveError` | Client-side immediate transition to upgrade modal |
| 2 | PPB fetcher receives 403 entitlementFailure | `templateFetcher.data = { success: false, error: "ENTITLEMENT_REQUIRED", entitlementFailure: {...} }` | `setIsSelectTemplateModalOpen(false)`, `setEntitlementFailure(...)` called, `templateSaveError` is null | Server-response transition to upgrade modal |
| 3 | FPB Next with gated template on Free plan | `handleTemplateNext` invoked with gated template and `isFreePlan: true` | `setIsSelectTemplateModalOpen(false)`, `setEntitlementFailure(...)` called, no `templateSaveError` | Client-side immediate transition to upgrade modal |
| 4 | FPB fetcher receives 403 entitlementFailure | `templateFetcher.data = { success: false, error: "ENTITLEMENT_REQUIRED", entitlementFailure: {...} }` | `setIsSelectTemplateModalOpen(false)`, `setEntitlementFailure(...)` called, `templateSaveError` is null | Server-response transition to upgrade modal |
| 5 | Gated card click invokes onUpgradeRequired | User clicks gated template option card | `onUpgradeRequired` called | Automatic transition to regular upgrade modal |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Zero TypeScript errors
- [x] Zero ESLint errors on modified files
