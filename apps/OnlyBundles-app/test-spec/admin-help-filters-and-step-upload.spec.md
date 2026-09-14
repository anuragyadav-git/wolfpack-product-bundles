---
schema_version: 1
id: admin-help-filters-and-step-upload
title: Admin Help Filters and Step Upload Test Spec
type: test-spec
status: active
summary: Verifies independent Add-ons help actions, visible dashboard filter labels, and direct Step Config image uploads.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
  - dashboard
  - shopify-files
source_paths:
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonProductsCard.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupConfigCard.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard.tsx
  - apps/OnlyBundles-app/app/routes/app/app.dashboard/DashboardBundlesPanel.tsx
  - apps/OnlyBundles-app/app/components/shared/AssetUpload.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - polaris
keywords:
  - add-ons help
  - dashboard filters
  - step image drop zone
---

# Test Spec: Admin Help, Filters, and Step Upload

**Spec ID:** admin-help-filters-and-step-upload  **Created:** 2026-09-11

## Purpose

Keep the affected Admin flows Shopify-native by separating informational and navigational actions, exposing filter purposes visibly, and making the Step Config media tile the direct upload target.

## Test Cases

### AdminHelpFiltersAndStepUpload

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Add-ons information | Render Add-Ons with Bundles card | A dedicated info trigger controls a Polaris popover containing the supporting image and explanation | Independent from navigation |
| 2 | Add-ons setup guide | Render Add-Ons with Bundles card | A separate external link points to the configured setup article | Opens in a new tab |
| 3 | Dashboard filters | Render the bundles panel | Status and Type are visible labels and existing filter choices remain available | Side-by-side placement is verified in Chrome, not Jest |
| 4 | Compact upload composition | Render AssetUpload with compact content | The supplied preview is inside the one native drop zone and the default separate preview is omitted | Preserves Shopify Files API behavior |
| 5 | Step image upload | Render FPB or PPB Step Config | The icon tile is the native drop zone, Replace and the conditional large drop zone are absent, and removal remains a separate action | No nested interactive control |

## Acceptance Criteria

- [x] All behavior tests pass.
- [x] The configured Add-ons article opens separately from the information popover.
- [x] Dashboard Status and Type labels are visible and both selects remain functional.
- [x] The FPB Step Config card has one direct image drop zone and no Replace action.
- [x] The PPB Step Config card has one direct image drop zone and no Replace action.
- [x] Desktop 1280x800 and the Chrome host's minimum real 500x844 window show no overflow, overlap, or misplaced controls.
- [ ] Exact 390x844 real-window QA; the direct Chrome host clamps both `innerWidth` and `outerWidth` to 500px and viewport emulation is prohibited.

## PPB Step Config Verification

- The Agent-store `Preview RCA PPB 2026-09-04` fixture rendered one compact
  upload target beside Step Title after cache-bypassing reloads at 1280x800 and
  the Chrome host's minimum real 500x844 window.
- Neither viewport showed a Replace action, second drop zone, overlap, clipping,
  or horizontal overflow. No viewport emulation was used.
