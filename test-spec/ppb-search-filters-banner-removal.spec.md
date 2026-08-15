---
schema_version: 1
id: ppb-search-filters-banner-removal
title: PPB Search Filters Banner Removal Test Spec
type: test-spec
status: active
summary: Verifies the promotional Search filters banner is absent while neighboring PPB quantity settings remain available.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-settings
source_paths:
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.quantity.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - ppb
  - banner-removal
keywords:
  - search-filters
  - quantity-settings
---

# Test Spec: PPB Search Filters Banner Removal

**Spec ID:** ppb-search-filters-banner-removal  **Created:** 2026-08-14

## Purpose

Remove the unsupported promotional Search filters banner without removing the surrounding quantity-validation or variant-selector controls.

## Test Cases

### PpbQuantitySettings

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Bundle Settings renders | Standard PPB configure context | Search filters heading and promotional copy are absent | Banner removal |
| 2 | Neighboring controls render | Standard PPB configure context | Quantity validation and Variant Selector remain visible | Regression guard |

## Acceptance Criteria

- [x] Search filters banner is absent.
- [x] Neighboring settings remain rendered.
- [ ] Focused tests and lint pass.
