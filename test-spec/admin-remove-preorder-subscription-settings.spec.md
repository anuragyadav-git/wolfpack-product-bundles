---
schema_version: 1
id: admin-remove-preorder-subscription-settings
title: Admin Remove Pre-order and Subscription Settings
type: test-spec
status: active
summary: Verifies FPB and PPB no longer expose, persist, serialize, or execute the removed pre-order and subscription integration setting.
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
  - prisma/schema.prisma
  - app/lib/bundle-formatter.server.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
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

Ensure the removed integration controls cannot be rendered, accepted by save parsers, persisted, emitted to storefront configuration, or used by either widget.

## Test Cases

### BundleSettingsIntegrationRemoval

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB Bundle Settings renders | Selling-plan state enabled | No integration heading, switch, options, or blocked warning; neighboring variant selector remains | UI removal only |
| 2 | PPB Bundle Settings renders | Selling-plan state enabled | No integration heading, switch, options, or blocked warning; neighboring quantity and variant controls remain | UI removal only |
| 3 | FPB save receives obsolete integration field | `individualSellingPlanSelection` form entry | Parsed save data omits the field | No hidden persistence after UI removal |
| 4 | PPB save receives obsolete integration field | `individualSellingPlanSelection` form entry | Parsed Bundle Settings data omits the field | No hidden persistence after UI removal |
| 5 | Proxy runtime formats a bundle containing stale field data | Bundle record with `individualSellingPlanSelection` | Storefront JSON omits the field | Old rows cannot reactivate removed behavior |
| 6 | Metafield runtime receives stale field data | Bundle config with `individualSellingPlanSelection` | `bundle_ui_config` omits the field | Runtime contract removal |
| 7 | Database contract is generated | Prisma `Bundle` model | `individualSellingPlanSelection` is absent | Direct persistence removal |

## Acceptance Criteria

- [x] FPB integration controls are absent.
- [x] PPB integration controls are absent.
- [x] Neighboring settings remain rendered.
- [x] FPB and PPB save parsers ignore the removed field.
- [x] Proxy and metafield storefront configurations omit the removed field.
- [x] The direct Prisma persistence column is removed.
