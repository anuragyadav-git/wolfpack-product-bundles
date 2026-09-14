---
schema_version: 1
id: fpb-two-dimensional-variant-selectors
title: FPB Two-Dimensional Variant Selectors
type: test-spec
status: active
summary: Verifies compact Shopify-native multi-dimensional selector behavior across FPB cards and product modals.
last_audited: 2026-09-12
owners:
  - engineering
domains:
  - storefront
  - bundle-configure
systems:
  - full-page-bundle
source_paths:
  - apps/OnlyBundles-app/app/assets/widgets/shared/variant-selector.ts
  - apps/OnlyBundles-app/app/assets/widgets/full-page/modal/variant-methods.ts
  - apps/OnlyBundles-app/app/lib/bundle-config/configure-validation.ts
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - variants
  - selectors
keywords:
  - two-dimensional variants
  - Shopify swatches
---

# Test Spec: FPB Two-Dimensional Variant Selectors
**Spec ID:** fpb-two-dimensional-variant-selectors  **Created:** 2026-09-11

## Purpose

Verify that FPB preserves the merchant's category selector mode and presents multi-dimensional variants through compact coordinated controls without changing Shopify variant-selection semantics.

## Test Cases

### Category contract

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB category uses a configured mode | `full_page` category with `color_swatch` | Runtime category contains the canonical mode and tooltip flag | Uses the existing `StepCategory` fields |
| 2 | FPB category uses invalid mode | FPB configure payload with an unsupported value | Validation rejects the category field | Same validation as PPB |

### Storefront selector

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 3 | Two-dimensional pill selector with an explicit primary | Color x Size product with Color configured as primary | Color uses pills; Size uses a labeled native select | Merchant ownership is preserved |
| 4 | Two-dimensional pill selector without an explicit primary | Size with seven values x Color with four values | The four-value Color dimension uses pills; Size uses a labeled native select | Minimizes card height without hiding values |
| 5 | Two-dimensional color swatch | Shopify color swatches plus Size | Color stays visual; Size uses a labeled native select | Never infer a color from its name |
| 6 | Two-dimensional image swatch | Shopify image swatches plus Size | Image stays visual; Size uses a labeled native select | Shopify swatch data is authoritative |
| 7 | Coordinated selection | Change either compact control | Exact compatible variant becomes active and all controls synchronize | Existing price/image/inventory callback remains single-fire |
| 8 | Product has no meaningful variants | One variant or no options | No selector is rendered | Card still owns an empty stable selector region |
| 9 | Review integration hydrates beside a mixed selector fixture | Judge.me badge HTML for each product | Badge mounts in the card identity region | It must not become an unowned card-grid child |
| 10 | Product-card reading order | Any configured selector mode | Selector controls precede price content and the Add or quantity control in the rendered card | Visual and keyboard order stay aligned |
| 11 | Modal product description has no meaningful content | Empty text or sanitized empty markup | Description region is hidden; meaningful text remains visible | Prevents an empty description from separating modal identity and controls |

## Acceptance Criteria

- [x] FPB runtime output contains the saved canonical category selector configuration.
- [x] Invalid FPB selector configuration is rejected.
- [x] Two-dimensional pill, color-swatch, and image-swatch modes use one visual dimension plus compact native selects for remaining dimensions.
- [x] Without an explicit primary option, a pill selector makes the dimension with the fewest distinct values visual.
- [x] Shopify swatch metadata is the only swatch source.
- [x] Unavailable values remain disabled and named.
- [x] Variant changes preserve the existing exact variant, price, image, availability, and inventory update flow.
- [x] Every product-card selector precedes price and Add or quantity controls in semantic DOM order.
- [x] Empty modal descriptions are hidden without hiding meaningful product copy.
- [x] All listed behavior tests pass.
