---
schema_version: 1
id: storefront-variant-selector-redesign
title: Storefront Variant Selector Redesign
type: test-spec
status: active
summary: Defines behavior coverage for the approved Direction A variant selectors across FPB and PPB storefront surfaces.
last_audited: 2026-09-12
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-widgets
source_paths:
  - apps/OnlyBundles-app/app/assets/widgets/shared/variant-selector.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page/variant-selector-modes.ts
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - variants
  - accessibility
keywords:
  - Direction A
  - intrinsic matrix
---

# Test Spec: Storefront Variant Selector Redesign

**Spec ID:** storefront-variant-selector-redesign  **Created:** 2026-09-11

## Purpose

Verify the data flow, semantics, and interaction behavior of the approved adaptive intrinsic selector matrix without asserting CSS, class names, or element placement.

## Test Cases

### FPB variant selection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Many primary values | Product with at least twelve values | Every value is represented directly and no overflow disclosure control exists | Presentation is verified in Chrome |
| 2 | Mixed availability | Available and unavailable variants | Unavailable values remain present with disabled semantics and cannot change the variant | No filtering for fit |
| 3 | Multiple dimensions | Product with two option dimensions | Each dimension has one labeled radio group in Shopify option order | Current combination resolution is retained |
| 4 | Available value activation | Enabled radio value | Product fields update and the callback fires exactly once | Event does not reach card behavior |
| 5 | Repeated instances | Same product rendered twice | Radio IDs and group names are unique per rendered instance | Prevents card/modal collisions |
| 6 | Native dropdown | FPB dropdown presentation | Every variant, including unavailable variants, is present; unavailable options are disabled | Existing mobile drawer policy is retained |
| 7 | Modal swatch source | Shopify option-value swatch and an ordinary color-like label | Canonical color or image data is used when present; a color-like label without Shopify swatch data remains a neutral labeled control | No name-based color inference |

### PPB variant selection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Repeated selector instances | Same product rendered in card and picker | IDs and radio names are unique per instance | No cross-instance selection |
| 2 | Shopify color swatch | Canonical `ProductOptionValue.swatch.color` | Canonical color and Shopify label are used | No inferred mappings |
| 3 | Missing swatch | Option value without canonical media | Neutral labeled control remains selectable | No variant-image fallback |
| 4 | Unavailable option | Disabled variant | Value remains present, disabled, and never calls the callback | Applies to every non-dropdown mode |
| 5 | Available activation | Enabled value | Callback fires exactly once and selected-value announcement updates | Existing delegated owner applies product changes |
| 6 | Native dropdown | Dropdown configuration | Visible label is associated with a unique select; unavailable options stay disabled | Native semantics |
| 7 | Sequential multi-option activation | Select a new Size, then a new Color | The second activation resolves from the newly selected size and yields the exact combined variant | Subtitle, image, price, and checked states follow the combined variant |
| 8 | Compact two-dimensional color swatches | Product with seven Size values without canonical swatches and four Color values with canonical Shopify colors | Size renders as one native select and Color renders as one swatch radio group | Applies only to multi-dimensional swatch modes |
| 9 | Requested swatch kind is absent | Multi-dimensional image-swatch configuration where neither dimension provides canonical Shopify swatch images | Each dimension renders as one native select | Do not substitute variant images or color values |
| 10 | Compact two-dimensional pills | The same Size × Color product configured as pills | The lower-card-height dimension remains pills and every additional dimension uses a labeled native select | Keeps the selected visual mode while bounding card height |
| 11 | Explicit dropdown remains native | The same Size × Color product configured as dropdown | One labeled native select renders per dimension | The adaptive visual-mode policy does not rewrite dropdown semantics |
| 12 | Sequential in-page multi-option activation | Change Size, then Color on a Product Grid/List card | The in-page card rebuilds from the first selection so the second change resolves the exact Size × Color variant | Prevents a stale sibling select from reverting the first dimension |

## Acceptance Criteria

- [x] Every source value is directly represented; no value-count cap or overflow disclosure remains.
- [x] Unavailable values remain visible with native disabled semantics and cannot mutate selection.
- [x] Non-dropdown option dimensions expose one labeled, uniquely named radio group each.
- [x] Repeated card, modal, and picker instances cannot share control IDs or group names.
- [x] An available activation emits exactly one variant-change callback and preserves current product data flow.
- [x] Sequential changes across option dimensions resolve the exact combined variant instead of reverting another dimension.
- [x] Multi-dimensional PPB swatch modes use one native select for dimensions without the requested canonical Shopify swatch kind and retain swatches for mapped dimensions.
- [x] Multi-dimensional pill mode retains one pill group and compacts every additional dimension to a labeled native select.
- [x] Explicit dropdown mode retains one labeled native select per Shopify option dimension.
- [x] Shopify swatch data remains authoritative; missing media is neutral and labeled.
- [x] Single-variant products render no redundant selector.
- [x] Visual wrapping, focus containment, card stability, and overflow are verified through direct Chrome QA only.
