---
schema_version: 1
id: ppb-compare-at-price-visibility
title: "Test Spec: PPB Compare-at Price Visibility"
type: test-spec
status: active
summary: Verifies that PPB always renders available compare-at prices without a bundle visibility setting.
last_audited: 2026-08-21
owners:
  - Wolfpack Product Bundles
domains:
  - admin-configure
  - storefront
systems:
  - product-page-bundle
source_paths:
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.tsx
  - app/assets/widgets/shared/components/product-card.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - ppb
  - compare-at-price
keywords:
  - compareAtPrice
  - Bundle Settings
---

# Test Spec: PPB Compare-at Price Visibility

**Spec ID:** ppb-compare-at-price-visibility  **Created:** 2026-06-02

## Purpose

Keep PPB compare-at visibility product-driven: show it whenever product or
variant data supplies a valid compare-at price, and do not expose or save a
separate bundle visibility setting.

## Test Cases

### PpbCompareAtPriceVisibility

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | PPB settings surface | Persisted setting true or false | No compare-at visibility control renders | Visibility is not merchant-configurable |
| 2 | PPB save transport | Submitted `showCompareAtPrices` field | Field is ignored and not written | Removes bundle-level ownership |
| 3 | Sale product | Current and compare-at product prices | Both prices render | Product data is the visibility gate |
| 4 | Regular product | Current price without compare-at data | Only current price renders | No fabricated strike price |
| 5 | Variant changes to sale variant | Variant provides compare-at data | Compare-at text updates immediately | Stale flags cannot suppress it |
| 6 | Storefront DTO | Persisted setting false or absent | Capability flag remains enabled | Runtime does not inherit bundle configuration |

## Acceptance Criteria

- [x] PPB does not expose or save a compare-at visibility control.
- [x] Product and variant compare-at data renders whenever present.
- [x] Products without compare-at data render only their current price.
- [x] Persisted legacy values cannot disable storefront compare-at visibility.
- [x] Focused behavior tests pass.
