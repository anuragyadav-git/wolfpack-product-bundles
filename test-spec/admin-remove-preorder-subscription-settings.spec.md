---
schema_version: 1
id: admin-remove-preorder-subscription-settings
title: Admin Remove Pre-order and Subscription Settings
type: test-spec
status: active
summary: Verifies FPB and PPB Bundle Settings no longer expose pre-order and subscription integration controls.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-settings
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSummaryText.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.quantity.tsx
related_docs: []
tags:
  - admin-ui
  - bundle-settings
keywords:
  - pre-order
  - subscription
---

# Test Spec: Admin Remove Pre-order and Subscription Settings

**Spec ID:** admin-remove-preorder-subscription-settings  **Created:** 2026-08-13

## Purpose

Ensure the removed integration controls cannot be rendered from either bundle settings surface.

## Test Cases

### BundleSettingsIntegrationRemoval

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB Bundle Settings renders | Selling-plan state enabled | No integration heading, switch, options, or blocked warning; neighboring variant selector remains | UI removal only |
| 2 | PPB Bundle Settings renders | Selling-plan state enabled | No integration heading, switch, options, or blocked warning; neighboring quantity and variant controls remain | UI removal only |

## Acceptance Criteria

- [ ] FPB integration controls are absent.
- [ ] PPB integration controls are absent.
- [ ] Neighboring settings remain rendered.
