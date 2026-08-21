---
schema_version: 1
id: storefront-design-director-interaction-contract-template
title: Interaction Contract Template
type: design-job-template
status: active
summary: Defines pointer, keyboard, focus, state, error, and motion behavior for interactive regions.
last_audited: 2026-08-21
owners:
  - Aditya Awasthi
domains:
  - interaction-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/interaction-contract.md
related_docs:
  - .agents/skills/storefront-design-director/references/interaction-and-accessibility.md
tags:
  - template
keywords:
  - keyboard
  - focus
---

# Interaction Contract

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 6
Artifact status: complete

| Control ID | Role | Accessible name | Pointer action | Keyboard action | State update | Focus behavior | Disabled or busy | Error recovery | Motion |
|---|---|---|---|---|---|---|---|---|---|
| opener | button | Existing slot label | Opens picker | Enter/Space | closed -> loading/loaded | First picker control receives focus | Existing rules | Reopen preserves state | Existing sheet motion |
| close | button | Existing localized close label | Closes | Enter/Space | open -> closed | Exact opener restored | Always available | n/a | Existing close motion |
| category | tab/button | Existing category label | Changes catalog | Enter/Space | category transition | Focus remains logical | Busy prevents duplicate request | Existing error feedback | Reduced motion respected |
| image-details | button-like media control | Localized Open product details plus product identity | Opens stacked details | Enter/Space | details becomes topmost | Details initial control receives focus; exact image restored on close | Unavailable only when details data cannot resolve | Close without mutation | Magnifier reveal respects reduced motion |
| title | text | Product title | No activation | No activation | none | Not separately tabbable | n/a | n/a | none |
| native-variant | select | Localized Select variant | Changes active variant context | Native select keys | identity/image/price/availability only | Stays on selector | Unavailable options disabled per inventory policy | Choose another variant | none |
| add | button | Localized Add plus product | Adds active variant once | Enter/Space | quantity 0 -> selected | Stays in rerendered card context | Disabled when unavailable | Select sellable variant | Existing card transition |
| quantity | grouped buttons | Product-specific decrease/increase/remove names | Changes quantity below maximum | Enter/Space | quantity changes within bounds | Remains on corresponding control | Increase disabled at limit | Decrease or remove | Stable action region |
| maximum-reached | button | Localized Added xN plus product | Removes full selected quantity | Enter/Space | quantity N -> 0 | Returns to Add action | n/a | Add again | Stable action region |
| filled-slot cross badge | button | Localized Remove plus the complete product name | Removes only the represented selected product | Enter/Space | one removal mutation | Returns focus to the same-index empty slot or previous valid slot | n/a | Re-add from reopened slot | Compact visual cross; 44px target; stops propagation so replacement does not open |
| details-submit | button | Localized Add or Update plus product | Commits local variant/quantity | Enter/Space | adds or updates originating slot once | Returns to exact image trigger after close | Disabled for unavailable variant | Select sellable variant or cancel | Existing sheet close motion |
| previous-next | button | Existing localized label | Changes step | Enter/Space | step transition | New context remains labelled | Existing validity rules | Existing toast/message | Reduced motion respected |

## State transitions

Open captures the exact slot opener. Successful loading renders the catalog. Selecting a native variant never mutates `selectedProducts`; Add is the only card-level add mutation. Quantity Validation resolves modal-card presentation as `add`, `quantity`, or `maximum-reached`. Details maintains local edits until Add/Update, then commits once to the originating slot; cancellation commits nothing. Reopen restores existing widget state.

## Modal and overlay behavior

The picker and details sheet each expose a labelled modal-dialog contract. Only the topmost sheet contains Tab/Shift+Tab. Escape, its own backdrop, close, or mobile handle swipe dismisses exactly one layer. Focus returns to the precise triggering image after details closes and to the precise slot opener after the picker closes. Document scroll remains locked until the final PPB sheet closes. Horizontal/Vertical have no nested variant drawer in revision 2.

## Responsive replacement and reduced motion

Desktop rail and mobile current-title controls are mutually exclusive and share state. Reduced motion suppresses nonessential sheet/card movement without altering timing-sensitive business behavior.

## Business-rule invariants

Do not change pricing, inventory, subscriptions, validation rules, cart payloads, restoration, or localization. The filled-slot cross badge reuses the localized `removeProductFromFooterText` accessible-name contract and performs the existing single removal mutation. Visual title clamping never changes the complete programmatic name. No new hardcoded merchant-facing copy is introduced.
