---
schema_version: 1
id: bundle-settings-slot-icon-step-config-parity
title: Bundle Settings Slot Icon and Step Config Parity
type: test-spec
status: active
summary: Verifies independent slot-icon and step-image persistence with native Shopify asset uploads.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - bundle-configure
  - polaris-app-home
source_paths:
  - app/components/shared/AssetUpload.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsQuantity.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - asset-upload
  - bundle-settings
keywords:
  - productSlotIconUrl
  - stepImage
---

# Test Spec: Bundle Settings Slot Icon and Step Config EB Parity
**Spec ID:** bundle-settings-slot-icon-step-config-parity  **Issue:** [bundle-settings-slot-icon-step-config-parity-1]  **Created:** 2026-06-02

## Purpose

Verify that Bundle Settings Slot Icon uses the dedicated bundle-level `productSlotIconUrl` field in FPB and PPB, while Step Setup Step Config remains an independent per-step `stepImage` upload.

## Test Cases

### Slot Icon
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB Change Icon | click Slot Icon Change Icon | reveals the dedicated native asset drop zone | no section navigation |
| 2 | FPB Reset | click Slot Icon Reset | clears `productSlotIconUrl` | does not clear `stepImage` |
| 3 | FPB save | slot icon URL | submits and persists `productSlotIconUrl` | bundle-level field |
| 4 | PPB Change Icon | click Slot Icon Change Icon | reveals the dedicated native asset drop zone | block exists under quantity validation |
| 5 | PPB Reset | click Slot Icon Reset | clears `productSlotIconUrl` | does not clear `stepImage` |

### Step Config
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 6 | FPB Step Config upload | per-step image URL | updates `stepImage` | independent control |
| 7 | PPB Step Config upload | per-step image URL | updates `stepImage` | independent control |

### Storefront Propagation
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 8 | Bundle formatter | saved `productSlotIconUrl` | emits bundle-level URL | public config |
| 9 | Metafield sync | bundle-level slot icon URL | writes URL into `bundle_ui_config` | Shopify metafield |
| 10 | PPB empty slot | public config has slot icon URL | renders uploaded image instead of default plus SVG | EB behavior |
| 11 | FPB empty slot | public config has slot icon URL | renders uploaded image instead of default plus SVG | EB behavior |

## Acceptance Criteria

- [x] Slot Icon controls match EB structure in both configure editors
- [x] Slot Icon never navigates to Step Setup
- [x] Slot Icon never mutates Step Config `stepImage`
- [x] Step Config remains persisted independently
- [x] Selected Slot Icon renders in PPB empty slots
- [x] Selected Slot Icon renders in FPB empty slots
