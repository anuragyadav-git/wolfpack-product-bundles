---
schema_version: 1
id: settings-design-eb-parity
title: Settings Design Runtime Parity
type: test-spec
status: active
summary: Verifies Settings Design persistence and shared runtime mappings for contextual component controls.
last_audited: 2026-08-23
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-design
  - widget-runtime
source_paths:
  - app/lib/settings-design-runtime.ts
  - app/lib/settings-design-contract.ts
related_docs:
  - internal docs/EB Settings Design Reference.md
tags:
  - tdd
  - design-settings
keywords:
  - contextual colors
  - pageCustomization
---

# Test Spec: Settings Design EB Parity
**Spec ID:** settings-design-eb-parity  **Issue:** [eb-settings-design-parity-1]  **Created:** 2026-06-04

## Purpose

Pin the Settings -> Design mapper against the observed Easy Bundles pageCustomization contract before wiring Wolfpack saves and CSS output.

## Test Cases

### buildSettingsDesignRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Inherited semantic colors fan out | Shop Brand primary/secondary pairs and inherited color fields | `pageCustomization` maps actions to primary and shells/inactive states to secondary | Shared with Admin preview resolution |
| 2 | `stylePresets` stores design state | Color, typography, corners, and images | `stylePresets.colors`, `stylePresets.typography`, `stylePresets.corners`, and `stylePresets.images` are complete | Expert-mode toggle is removed |
| 3 | Typography maps labels and storefront numeric columns | Primary/secondary/body font size and weight | PageCustomization font paths receive `px` strings; DB runtime fields receive numeric sizes and weights | `Bold -> 700`, `Regular -> 400` |
| 4 | Button and card/cart radius logic follows EB | Sharp/Base/Round and base px values | Button radius paths use `0px`, `{base}px`, or `40px`; card image radius is `max(2, base - 2)` | Product card/cart supports Sharp/Base only in EB UI |
| 5 | Image fit maps to FPB and PPB paths | Cover/Contain/Fill | `productCard.productImageFit`, `mixAndMatchConfig.productCard.productCardImageFit`, and runtime direct column are lowercase | CSS should emit same object-fit value |
| 6 | Component colors override inherited fields | Explicit general/product/cart/upsell values | Explicit target values replace Shop Brand resolution while `stylePresets` keeps semantic anchors | Override presence is authoritative |
| 7 | Runtime update is usable for both bundle types | Any design payload | Save action can upsert identical runtime payload into `product_page` and `full_page` rows | EB behavior is store-level |

### generateCSSVariables

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB EB direct variable aliases are emitted | Design settings containing mapped fields | CSS contains `--product-card-*`, `--tabs-*`, `--footer-*`, and empty-state aliases | Required for PPB template parity |
| 2 | PPB consolidated bridge is emitted | Same settings | CSS contains `body[wpb-mix-consolidated-design="true"]` bridge to `--wpbMix-*` vars | EB sets this body attr on current PPB templates |
| 3 | PDP_INPAGE font adjustment is emitted | Same settings | CSS includes `calc(... - 2px)` rules for `body[wpbmix-template-type="PDP_INPAGE"]` | EB Product List/Grid behavior |

## Acceptance Criteria

- [ ] Tests fail before the mapper/CSS changes.
- [ ] Tests pass after implementation.
- [ ] Save action writes design runtime to both `product_page` and `full_page` rows.
- [ ] Chrome e2e confirms Admin save affects both FPB and PPB storefront variables.
