---
schema_version: 1
id: ppb-drawer-redesign
title: PPB Drawer Redesign Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for the shared responsive PPB drawer system.
last_audited: 2026-08-20
owners:
  - storefront
domains:
  - product-page-bundles
systems:
  - storefront-widget
source_paths:
  - app/assets/widgets/shared/drawer-layer-manager.ts
  - app/assets/widgets/shared/variant-selector.ts
  - app/assets/widgets/product-page/methods/modal-state-methods.ts
  - app/assets/widgets/product-page/templates/cascade-template.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - ppb
  - drawers
keywords:
  - focus restoration
  - nested overlays
---

# Test Spec: PPB Drawer Redesign

**Spec ID:** ppb-drawer-redesign  **Created:** 2026-08-20

## Purpose

Protect drawer disclosure, dismissal, focus, scroll ownership, selection, slot
replacement, and capacity behavior while leaving layout verification to Chrome.

## Test Cases

### DrawerLayerManager

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Open modal drawer | First registered layer | Document scrolling locks | Selected summary does not register a layer |
| 2 | Nested overlay Escape | Picker with variant selector above it | Only variant selector closes | Picker remains registered and scroll stays locked |
| 3 | Close final layer | Last registered layer closes | Original root/body overflow restores | Exact prior inline values are preserved |
| 4 | Focus restoration | Trigger remains connected | Exact trigger regains focus | Uses prevent-scroll focus when supported |

### DrawerGesturesAndSelection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid downward swipe | Sufficient vertical distance or velocity | Drawer dismisses | Horizontal dominance never dismisses |
| 2 | Invalid swipe | Upward, horizontal, or short slow gesture | Drawer resets | No selection mutation |
| 3 | Variant choice | Available variant option | Choice commits and drawer closes immediately | No Apply action |
| 4 | Handle activation | Click, Enter, or Space | Drawer closes | Semantic button supplies keyboard activation |

### SummaryAndSlots

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Summary keyboard toggle | Enter or Space on summary button | Native click toggles and `aria-expanded` follows | No empty-state toast |
| 2 | Summary rerender | Add or remove while open | Open state persists while quantity remains | Final removal collapses |
| 3 | Empty summary | Zero selected quantity | Informative pill remains closed | Drawer body is absent |
| 4 | Filled-slot replacement | Activate a specific selected slot | Only that slot becomes replacement target | Existing selection hooks are preserved |
| 5 | Capacity rules | Minimum and exact quantity rules | Minimum retains one reachable slot; exact has no overflow | Existing persistence remains unchanged |
| 6 | Trusted progress markup | Internal condition markup and arbitrary HTML | Internal markup renders; arbitrary input remains escaped | Existing trusted-render boundary |

## Acceptance Criteria

- [ ] Drawer layers share one topmost-only Escape and scroll-lock owner.
- [ ] Picker, product details, and variant selector restore exact trigger focus.
- [ ] Variant selection commits immediately and exposes no Apply action.
- [ ] Selected summary never locks page scrolling or opens when empty.
- [ ] Existing slot replacement, capacity, persistence, and trusted-markup tests pass.
- [ ] Styling is verified in Chrome rather than source-inspection unit tests.
