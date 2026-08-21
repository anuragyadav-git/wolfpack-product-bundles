---
schema_version: 1
id: ppb-bundle-picker-modal-redesign
title: Test Spec: PPB Bundle Picker Modal Redesign
type: test-spec
status: active
summary: Verifies modal-card presentation, grouped variants, product details, layered dismissal, restoration, and regression behavior for the shared PPB picker.
last_audited: 2026-08-21
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

Confirm that Horizontal Slots and Vertical Slots share one behaviorally complete picker and product-details flow while Product List and Product Grid retain their existing behavior. Tests cover semantics, state transitions, and mutations only; visual geometry remains a Chrome QA responsibility.

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
| 5 | Product image activation | Activate the image control | Product details opens for the active variant | Trigger identity is retained for focus restoration |
| 6 | Title activation | Activate or click title text | Product details does not open | Title is informational, not an implicit control |
| 7 | Card-background activation | Activate or click non-control card area | Product details does not open | No card-wide click target |
| 8 | Add activation | Activate Add | Exactly one selection mutation occurs without opening details | Independent primary card action |

### Product-details editing

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Add from details | Open unselected product, choose variant and quantity, activate Add | Product is added once to the originating slot | Uses selected variant and quantity |
| 2 | Update from details | Open an existing selected product, change variant or quantity, activate Update | Originating slot is updated in place | No duplicate selected record |
| 3 | Exact-slot replacement | Open details from a replacement flow and confirm | Existing slot selection is replaced | Capacity does not grow |
| 4 | Cancel details | Change local variant or quantity, then dismiss | No selection mutation occurs | Picker state remains intact |
| 5 | Reopen details | Reopen an existing selection | Current variant and quantity are restored | Uses originating selection identity |

### Layer ownership, focus, and scroll

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Forward Tab at final picker control | Picker topmost, focus final control, press Tab | First visible picker control receives focus | Default traversal is prevented |
| 2 | Reverse Tab at first picker control | Picker topmost, focus first control, press Shift+Tab | Final visible picker control receives focus | Default traversal is prevented |
| 3 | Details owns keyboard | Picker and details open, press Tab | Picker does not move focus or prevent default | Topmost details layer traps focus |
| 4 | Topmost Escape | Picker and details open, press Escape | Details closes; picker stays open | Focus returns to the exact image trigger |
| 5 | Topmost backdrop | Picker and details open, activate details backdrop | Details closes; picker stays open | Underlying backdrop does not also dismiss |
| 6 | Topmost swipe | Swipe details beyond the dismissal threshold | Details closes; picker stays open | Mobile only; one layer is removed |
| 7 | Picker dismissal | Close final PPB sheet | Document scroll styles are restored | Lock persists while any PPB sheet remains |
| 8 | Exact picker focus restoration | Close picker opened from empty or filled slot | Focus returns to the exact originating slot control | Works after rerender |

### Filled-slot identity and removal

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Long selected title | Filled Horizontal or Vertical slot with long product name | Complete title remains the programmatic name while visible text wraps and clamps only at the approved height cap | Visual wrapping/clamping is verified in Chrome, not Jest |
| 2 | Remove semantics | Activate the filled-slot cross badge | Exactly the represented selection is removed without opening replacement | Product-specific accessible name; no visible Remove copy required |
| 3 | Remove focus recovery | Remove a filled slot among adjacent slots | Same-index empty slot or previous valid slot receives focus | Existing keyboard behavior preserved |

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
- [ ] Horizontal and Vertical use the shared modal behavior; Product List and Grid remain unchanged
- [ ] Tests assert behavior only and do not inspect CSS or class placement
