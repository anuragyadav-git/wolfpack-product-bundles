---
schema_version: 1
id: admin-inline-field-validation
title: Admin Inline Field Validation
type: test-spec
status: active
summary: Defines single-owner Polaris field validation behavior across Admin configure, create, dashboard, and attribution forms.
last_audited: 2026-09-12
owners:
  - engineering
domains:
  - admin
systems:
  - validation
source_paths:
  - app/routes/app/_shared/bundle-configure/
  - app/routes/app/app.bundles.create/route.tsx
  - app/routes/app/app.dashboard/DashboardActionModals.tsx
  - app/routes/app/app.attribution/AttributionDateRangeControls.tsx
  - app/routes/app/shared/CountryTargetingSection.tsx
related_docs:
  - internal docs/Shopify Integration/Polaris Web Components Reference.md
tags:
  - polaris
  - validation
  - tdd
keywords:
  - inline errors
  - error ownership
---

# Test Spec: Admin Inline Field Validation
**Spec ID:** admin-inline-field-validation  **Created:** 2026-09-12

## Purpose
Ensure all Admin UI field and field-group validations appear inline directly below the corresponding input or field group without layout shifts, detached summaries, duplicate banners, or misplaced error messages across both Full-Page Bundle (FPB) and Product-Page Bundle (PPB) configure flows, Dashboard modals, and settings.

## Test Cases
### AdminInlineFieldValidation
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Dashboard bundle rename error | `renameError = "Enter a bundle name."` in `DashboardActionModals` | Text field has `error`, no critical banners rendered in modal | Verifies no duplicated banner above field |
| 2 | Bundle subscription configuration validation | `validationErrors = { "subscriptions.oneTimePurchase.title": "..." }` | Affected input receives `error`, no detached summary `<s-text tone="critical">` at bottom | Verifies inline Polaris error ownership |
| 3 | Step resources error placement in FPB & PPB | Step has no products/collections | Details card does NOT render `steps.${step.id}.resources` under step name; Category card renders it inline with matching control ID | Prevents misplaced resource error under name field |
| 4 | Offer delivery error section routing | `path = "offerDelivery.priority"` | `sectionForPath` returns `"offer_delivery"` | Ensures navigation routes to the correct section |
| 5 | Discount rules empty error placement | `validationErrors = { "discount.rules": "..." }` | Discount pricing card renders error with `id="configure-discount-rules"` | Ensures rules error has inline placement |
| 6 | Free gift addons title & reference errors | `validationErrors = { "addons.products.title": "...", "addons.gifting.stepName": "..." }` | Input fields receive `error` and matching `id` | Verifies Polaris inline errors |
| 7 | Offer delivery inline field errors | `validationErrors = { "offerDelivery.priority": "...", "offerDelivery.startsAt": "..." }` | Input fields receive `error` and matching `id` | Verifies Polaris inline errors |
| 8 | Dashboard rename operation failure | Rename persistence fails after valid input | Critical operation banner renders and text field has no field error | Operation errors are not field validation |
| 9 | Invalid attribution range | End date precedes start date | End date field alone owns the range error | No duplicate message on both dates |
| 10 | Country selection is missing | Country targeting enabled with no country | Search field owns the error | No duplicate critical text block |
| 11 | Create-bundle operation failure | Valid name submission fails server-side | Critical operation banner renders and name field has no field error | Merchant-safe operation feedback |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] No regression errors in existing unit tests
- [ ] Clean lint run on all modified files
- [ ] No unit test asserts CSS, class names, or visual placement
