---
schema_version: 1
id: fpb-bundle-settings-admin-parity
title: FPB Bundle Settings Admin Parity
type: test-spec
status: active
summary: Covers the current FPB Bundle Settings surface and retained direct settings save contracts after selling-plan integration removal.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - full-page-bundle-settings
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
related_docs: []
tags:
  - fpb
  - bundle-settings
keywords:
  - bundle settings
  - selling plan
---

# Test Spec: FPB Bundle Settings Admin Parity
**Spec ID:** fpb-bundle-settings-admin-parity  **Issue:** [fpb-bundle-settings-admin-parity-1]  **Created:** 2026-06-05

## Purpose
Lock the EB-observed FPB Bundle Settings Admin surface and direct configuration save contract before parity implementation.

## Test Cases
### BundleSettingsSurface
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Selling-plan controls are removed | FPB configure Bundle Settings | No Pre-order & Subscription Integration heading, switch, options, or blocked warning is rendered | Current WPB product decision 2026-08-13 |
| 2 | WPB-only redirect control is not exposed | FPB configure route source | Bundle Settings section does not contain Redirect to checkout after adding to cart | EB FPB section does not show this control |

### BundleSettingsSaveContract
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Removed individual selling plan config is ignored | `individualSellingPlanSelection` form data | FPB parsing, persistence, metafield sync, and storefront runtime omit the field | Current WPB product decision 2026-08-13 |
| 2 | Quantity validation and product slots keep existing contract | Existing direct settings form data | Metafield sync still receives `validateQuantityPerProduct` and `productSlotsEnabled` | Regression guard |

## Acceptance Criteria
- [x] Surface contract tests fail before implementation and pass after implementation
- [x] Save contract tests fail before implementation and pass after implementation
- [x] Focused route tests pass
- [x] Modified files pass ESLint
- [x] Chrome Admin E2E verifies the Bundle Settings section after hard reload
