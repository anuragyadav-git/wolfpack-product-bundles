---
schema_version: 1
id: ppb-mobile-drawers
title: PPB Mobile Drawers Test Spec
type: test-spec
status: active
summary: Verifies responsive PPB drawer behavior and trusted discount-variable markup rendering.
last_audited: 2026-08-20
owners:
  - storefront
domains:
  - product-page-bundles
systems:
  - storefront-widget
source_paths:
  - app/assets/widgets/shared/variant-selector.ts
  - app/assets/widgets/shared/components/discount-progress.ts
  - app/assets/widgets/product-page/methods/footer-modal-state-methods.ts
  - app/assets/widgets/product-page-css/base/mobile-drawers.css
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - ppb
  - mobile
  - drawer
keywords:
  - bundle-conditions-text
  - variant-drawer
---

# Test Spec: PPB Mobile Drawers

**Spec ID:** ppb-mobile-drawers  **Created:** 2026-08-20

## Purpose

Ensure PPB drawers remain usable at mobile widths and condition/discount variable
spans render as styled markup instead of visible HTML source.

## Test Cases

### PPBMobileDrawers

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Default progress message | Arbitrary HTML-like text | Message remains escaped | Preserves the shared renderer security default |
| 2 | Trusted PPB template message | Internal condition span markup | Span renders as markup | Prevents literal `bundle-conditions-text` source |
| 3 | Open mobile variant drawer | Mobile dropdown trigger | Root and body scrolling are locked | Keeps the drawer as the only scroll owner |
| 4 | Close with Escape | Open variant drawer | Drawer closes, scrolling restores, and focus returns | Keyboard and assistive-technology compatibility |
| 5 | Narrow mobile selected drawer | Selected products at 320px width | Drawer and rows remain within the viewport | Chrome visual/geometry verification only |

## Acceptance Criteria

- [ ] Shared discount messages remain escaped by default.
- [ ] PPB trusted template spans render without visible HTML source.
- [ ] Mobile variant drawers expose a close control and restore trigger focus.
- [ ] Mobile drawers lock background scrolling and own vertical overflow.
- [ ] PPB selected, variant, and bundle-builder drawers do not create horizontal overflow at 320px or 390px.
