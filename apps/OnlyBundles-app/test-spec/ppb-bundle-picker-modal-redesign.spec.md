---
schema_version: 1
id: ppb-bundle-picker-modal-redesign
title: Test Spec: PPB Bundle Picker Modal Redesign
type: test-spec
status: active
summary: Verifies modal-card presentation, grouped variants, picker dismissal, restoration, and regression behavior without PPB product details.
last_audited: 2026-08-28
owners:
  - Aditya Awasthi
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/product-page
  - app/assets/widgets/shared
related_docs:
  - design-jobs/ppb-bundle-picker-modal-redesign-20260821/implementation-handoff.md
tags:
  - ppb
keywords:
  - bundle-picker
---

# Test Spec: PPB Bundle Picker Modal Redesign
**Spec ID:** ppb-bundle-picker-modal-redesign  **Created:** 2026-08-21

## Purpose

Confirm that Horizontal Slots and Vertical Slots share one behaviorally complete picker while Product List and Product Grid retain their existing behavior. PPB product images and titles remain informational and do not open product details. Tests cover semantics, state transitions, and mutations only; visual geometry remains a Chrome QA responsibility.

## Test Cases

### Modal-card presentation state

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Validation disabled | Selected quantity 1, validation disabled | Presentation resolves to `quantity` | Modal templates ignore the card-selector visibility setting |
| 2 | Validation enabled below maximum | Selected quantity 1, maximum 3 | Presentation resolves to `quantity` | Increment remains available through quantity 3 |
| 3 | Maximum one reached | Selected quantity 1, maximum 1 | Presentation resolves to `maximum-reached` with quantity 1 | No intermediate quantity state |
| 4 | Maximum greater than one reached | Selected quantity 3, maximum 3 | Presentation resolves to `maximum-reached` with quantity 3 | Localized `Added xN` semantics |
| 5 | Over-maximum attempt | Increment selected quantity at configured maximum | No selection mutation occurs and validation feedback is returned | Existing quantity validator remains authoritative |
| 6 | Activate reached state | Activate `Added xN` for selected product | Entire selected quantity is removed from the originating category and slot | One mutation, not repeated decrements |
| 7 | Unselected product | Quantity is zero | Presentation resolves to `add` | Add remains independent from variant choice |

### Grouped variants and card activation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Grouped multi-variant product | Render modal card on desktop and mobile | Native selector is present with an accessible name | Mobile may visually hide the label, not its name |
| 2 | Single-variant product | Render modal card | No unnecessary variant selector is exposed | Add remains available when sellable |
| 3 | Select grouped variant | Change selector to a different variant | Active variant identity, image, price, compare-at context, and availability update | Selection state and add call count remain unchanged |
| 4 | Unavailable variant | Select an unavailable option | Card state reflects unavailability and Add cannot mutate selection | Existing inventory semantics remain authoritative |
| 5 | Product image activation | Click or keyboard-activate the image | No product-details surface opens and no selection mutates | Image is informational |
| 6 | Title activation | Activate or click title text | Product details does not open | Title is informational, not an implicit control |
| 7 | Card-background activation | Activate or click non-control card area | Product details does not open | No card-wide click target |
| 8 | Add activation | Activate Add | Exactly one selection mutation occurs without opening details | Independent primary card action |

### Layer ownership, focus, and scroll

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Forward Tab at final picker control | Picker topmost, focus final control, press Tab | First visible picker control receives focus | Default traversal is prevented |
| 2 | Reverse Tab at first picker control | Picker topmost, focus first control, press Shift+Tab | Final visible picker control receives focus | Default traversal is prevented |
| 3 | Variant selector owns keyboard | Picker and variant selector open, press Escape | Variant selector closes; picker stays open | Only the top layer dismisses |
| 4 | Picker dismissal | Close final PPB sheet | Document scroll styles are restored | Lock persists while any PPB sheet remains |
| 5 | Exact picker focus restoration | Close picker opened from empty or filled slot | Focus returns to the exact originating slot control | Works after rerender |

### Filled-slot identity and removal

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Long selected title | Filled Horizontal or Vertical slot with long product name | Complete title remains the programmatic name; Vertical follows EB's visible normal wrapping with no WPB height cap while Horizontal retains its existing clamp | Visual wrapping is verified in Chrome, not Jest |
| 2 | Remove semantics | Activate the filled-slot cross badge | Exactly the represented selection is removed without opening replacement | Product-specific accessible name; no visible Remove copy required |
| 3 | Remove focus recovery | Remove a filled slot among adjacent slots | Same-index empty slot or previous valid slot receives focus | Existing keyboard behavior preserved |
| 4 | Vertical filled-row activation | Activate the image, title, or background of a filled Vertical slot | No picker opens and no selection mutates | EB parity: only empty slots open the picker; each cross removes one represented unit |
| 5 | Horizontal filled-slot replacement | Activate a filled Horizontal slot | Picker opens with the represented selection as the replacement target | Horizontal behavior remains unchanged |

### Progression, restoration, capacity, and failure

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Invalid Next or Done | Activate progression before satisfying rule | Action remains operable and localized dismissible toast explains the rule | No selection mutation |
| 2 | Toast recovery | Dismiss toast, satisfy the rule, activate progression | Progression succeeds without stale error state | Body-owned feedback |
| 3 | Close and reopen | Select products, close picker, reopen same slot/step | Current selections and active step restore | No duplicate mutation |
| 4 | Session restoration | Reload with stored valid selections | Variant, quantity, slot, pricing, and selected-card state restore | Existing storage contract unchanged |
| 5 | Open-ended capacity | Satisfy and exceed a minimum rule | Capacity remains one slot ahead | Existing minimum-rule behavior preserved |
| 6 | Exact capacity | Satisfy an exact rule | No overflow slot appears | Removal restores the exact empty slot |
| 7 | Failed product loading | Product request rejects or returns unusable data | Recoverable localized error state is exposed and picker can close/reopen | No fabricated copy |

### Shared-template and in-page regression

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Horizontal Slots | Run all modal behaviors with `PDP_MODAL/MODAL` | Shared behavior passes with horizontal slot ownership | No template fork |
| 2 | Vertical Slots | Run all modal behaviors with `PDP_MODAL/SIMPLIFIED` | Shared behavior passes with vertical slot ownership | No template fork |
| 3 | Product List | Render and mutate an in-page list card | Existing quantity-selector and selection behavior is unchanged | Modal-only override does not apply |
| 4 | Product Grid | Render and mutate an in-page grid card | Existing quantity-selector and selection behavior is unchanged | Modal-only override does not apply |

### Chrome-only footer geometry

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Fixture summary | Open picker at 1440, 390, and 360 widths | Icon and count remain aligned; pill shrink-wraps content and stays inside footer | CSS geometry is not unit-tested |
| 2 | Long summary content | Count 123, final price $12,345.67, compare-at $19,999.99 | Pill grows with content, remains contained, and produces zero page overflow | Direct Chrome DOM stress only |

## Acceptance Criteria

- [ ] All listed test cases pass
- [ ] The pure card-presentation helper covers `add`, `quantity`, and `maximum-reached`
- [ ] Existing selection, pricing, inventory, persistence, slot, and cart tests remain green
- [ ] Existing Escape, arrow navigation, initial focus, and exact focus restoration tests remain green
- [ ] Horizontal and Vertical use the shared picker behavior; Product List and Grid remain unchanged
- [ ] No PPB product card constructs or opens a product-details surface
- [ ] Tests assert behavior only and do not inspect CSS or class placement
