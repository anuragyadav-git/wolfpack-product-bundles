---
schema_version: 1
id: shopify-product-option-swatches
title: Shopify Product Option Swatches
type: test-spec
status: active
summary: Verifies that PPB color and image swatches use Shopify ProductOptionValue swatch data without a parallel merchant color map.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - storefront
  - admin
systems:
  - ppb-widget
  - shopify-storefront-api
source_paths:
  - app/assets/widgets/product-page/
  - app/routes/api/api.storefront-products.tsx
  - app/routes/api/api.storefront-collections.tsx
  - app/lib/bundle-config/variant-selector-config.ts
  - prisma/schema.prisma
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - swatches
  - variants
keywords:
  - ProductOptionValue.swatch
  - color
  - image
---

# Test Spec: Shopify Product Option Swatches

**Spec ID:** shopify-product-option-swatches  **Created:** 2026-08-31

## Purpose

Ensure PPB variant selectors consume Shopify's canonical option-value color and
image swatches and remove Wolfpack's duplicate color-map persistence and Admin
editing surface.

## Test Cases

### ShopifyProductOptionSwatches

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Direct Storefront hydration | Product options contain color and image swatches | Compact option-value swatches reach the widget product DTO | Shopify is the source of truth |
| 2 | Signed product proxy hydration | App-proxy Storefront response contains swatches | Product response preserves canonical swatches | No custom resolver endpoint |
| 3 | Signed collection proxy hydration | Collection product contains swatches | Deduplicated product preserves canonical swatches | Same DTO as direct products |
| 4 | Variant association | Variant selected option matches a Shopify option value | Matching color or image is resolved | Match by option name and value |
| 5 | Missing Shopify swatch | Selected option has no swatch | Neutral labeled control | No inferred or legacy fallback color |
| 6 | Product normalization | Hydrated grouped product has option values and selected options | Canonical data survives normalization | Required by every PPB template |
| 7 | Color tooltip | Canonical color swatch with tooltip enabled | Tooltip describes the Shopify option value on hover and focus | Existing accessible behavior retained |
| 8 | Image swatch | Canonical image swatch | Shopify swatch image renders | Variant-image substitution removed |
| 9 | Admin configuration | Color mode selected | Tooltip control and Shopify-source guidance render; color-map editor does not | Polaris web components only |
| 10 | Persistence | Category selector configuration is saved | Only selector mode and tooltip flag persist | `variantColorMap` removed |

## Acceptance Criteria

- [ ] All listed test cases pass
- [ ] Storefront GraphQL operations validate against Shopify 2026-07
- [ ] `variantColorMap` is removed from Prisma and all runtime/Admin contracts
- [ ] No compatibility fallback or option-name color guessing is introduced
- [ ] Widget and SDK builds pass
- [ ] Desktop and 390x844 Chrome QA pass after the required tunnel restart
