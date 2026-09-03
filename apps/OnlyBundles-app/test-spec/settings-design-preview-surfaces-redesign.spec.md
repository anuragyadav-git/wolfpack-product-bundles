---
schema_version: 1
id: settings-design-preview-surfaces-redesign
title: Settings Design Preview Surfaces Redesign Test Spec
type: test-spec
status: superseded
summary: Records the retired modular synthetic preview surfaces superseded by the isolated production-renderer frame.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-design
  - design-preview
source_paths:
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/root/settings-design-preview-frame/route.tsx
related_docs:
  - test-spec/settings-design-production-renderer-preview.spec.md
tags:
  - tdd
  - superseded
keywords:
  - preview-surfaces
  - production-renderer
---

# Test Spec: Settings Design Preview Surfaces Redesign
**Spec ID:** settings-design-preview-surfaces-redesign  **Created:** 2026-08-22

## Purpose
Historical specification for modular handcrafted surfaces. The live preview now routes all eight templates and their supported states through the isolated production renderer; use the replacement production-renderer spec for acceptance.

## Test Cases
### SettingsDesignPreviewSurfacesSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Standard FPB surface render | `template: "standard"`, surfaces: `navigation`, `categories`, `product-card`, `cart-summary` | Timeline navigation, accordion categories, 3-column product grid, and sidebar summary render with storefront fidelity | Desktop & mobile |
| 2 | Classic FPB surface render | `template: "classic"`, surfaces: `categories`, `product-card`, `cart-summary` | Pill categories, 4-column product grid, and slot-based summary sidebar render | Slot summary empty states |
| 3 | Compact FPB surface render | `template: "compact"`, surfaces: `navigation`, `product-card`, `cart-summary` | Compact dot timeline, compact cards, and compact slot summary render | Compact layout |
| 4 | Horizontal FPB surface render | `template: "horizontal"`, surfaces: `navigation`, `categories`, `product-card`, `cart-summary` | Continuous bar horizontal timeline, underline categories, horizontal product rows render | 2-column row tracks |
| 5 | Product List PPB surface render | `template: "product-list"`, surfaces: `bundle-header`, `navigation`, `product-card`, `cart-summary` | Bundle header, step flow number badges, cascade product rows with variant selector, and PDP footer drawer render | In-page layout |
| 6 | Product Grid PPB surface render | `template: "product-grid"`, surfaces: `bundle-header`, `categories`, `product-card`, `cart-summary` | Bundle header, category tabs, fluid product grid tiles, and PDP checkout footer render | Responsive grid |
| 7 | Horizontal Slots PPB surface render | `template: "horizontal-slots"`, surfaces: `bundle-header`, `product-slots`, `product-picker`, `cart-summary` | Horizontal slot cards with uniform empty/filled sizing & slot icon formatting, bottom-sheet modal picker, and PDP footer render | Slot cards contract |
| 8 | Vertical Slots PPB surface render | `template: "vertical-slots"`, surfaces: `bundle-header`, `product-slots`, `product-picker`, `cart-summary` | Vertical slot stack with uniform row height & slot icon formatting, bottom-sheet modal picker render | Vertical stack contract |
| 9 | Overlay surfaces across templates | Surfaces: `loading`, `validation`, `upsell` across FPB & PPB | Loading screen (spinner / custom GIF), condition toast alert, and upsell product card render | Shared overlays |
| 10 | Interactive state updates | Quantity changes, progress stepping, mobile summary expansion | State updates reflect in surface DOM without full page refresh | Interactive preview |

## Acceptance Criteria
- [x] Superseded by `settings-design-production-renderer-preview`.
- [x] Retired preview-surface components are removed from the live implementation.
