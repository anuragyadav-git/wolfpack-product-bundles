---
schema_version: 1
id: default-product-discount-tip
title: Default Product Discount Tip
type: test-spec
status: active
summary: Defines dismissible Polaris banner behavior for the pre-selected product discount tip.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/DefaultProductDiscountTipBanner.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsDefaultProducts.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.defaultProducts.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - banner
  - bundle-settings
keywords:
  - discount tip
  - pre selected product
---

# Test Spec: Default Product Discount Tip

**Spec ID:** default-product-discount-tip  **Created:** 2026-08-14

## Purpose

Ensure the Pre Selected Product discount tip uses the native dismissible Polaris banner in both FPB and PPB Admin configure flows.

## Test Cases

### Discount tip dismissal

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial FPB render | Tip has not been dismissed | Dismissible `s-banner` is rendered | Existing copy is preserved |
| 2 | Dismiss FPB tip | Banner emits dismiss | Local dismissed state becomes true | Does not dirty bundle state |
| 3 | Initial PPB render | Tip has not been dismissed | Dismissible `s-banner` is rendered | Existing copy is preserved |
| 4 | Dismiss PPB tip | Banner emits dismiss | Local dismissed state becomes true | Does not dirty bundle state |
| 5 | Render after dismissal | Local dismissed state is true | Discount tip is absent | Dismissal lasts for the mounted page session |
| 6 | Shared ownership | FPB and PPB render | Both flows use the same shared banner component | FPB markup is the source of truth |

## Acceptance Criteria

- [x] FPB and PPB use `s-banner` with native dismissal.
- [x] Dismissing the tip removes it without changing bundle dirty state.
- [x] Existing tip copy is unchanged.
- [x] FPB and PPB consume one shared banner component.
- [x] Focused behavior tests pass.
