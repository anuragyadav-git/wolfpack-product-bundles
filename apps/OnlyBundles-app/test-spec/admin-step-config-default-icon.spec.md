---
schema_version: 1
id: admin-step-config-default-icon
title: Admin Step Config Default Icon
type: test-spec
status: active
summary: Verifies that Admin Step Config uses storefront timeline fallback icons and the replacement action.
last_audited: 2026-08-13
owners:
  - Wolfpack Product Bundles
domains:
  - admin-ui
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/DefaultStepTimelineIcon.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupConfigCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - step-config
keywords:
  - default step icon
  - replace action
---

# Test Spec: Admin Step Config Default Icon
**Spec ID:** admin-step-config-default-icon  **Created:** 2026-08-13

## Purpose

Verify that the shared Admin Step Config empty state uses the same type-aware default icon as the storefront step timeline and exposes the requested replacement action.

## Test Cases

### DefaultStepTimelineIcon

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Regular step has no uploaded image | regular step | shopping-bag timeline icon | Storefront regular-step fallback |
| 2 | Included step has no uploaded image | `isDefault: true` | lock timeline icon | Storefront included-step fallback |
| 3 | Gift step has no uploaded image | `isFreeGift: true` | gift-box timeline icon | Storefront gift-step fallback |

### Step Config Action

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 4 | Step has no uploaded image | `stepImage: null` | action text is `Replace` | Picker remains available |

## Acceptance Criteria

- [ ] Empty Step Config previews match storefront timeline defaults by step type.
- [ ] The Step Config picker action reads `Replace` without requiring an uploaded image.
- [ ] FPB and PPB use the same shared default-icon component.
