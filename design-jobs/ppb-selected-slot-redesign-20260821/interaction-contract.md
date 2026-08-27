---
schema_version: 1
id: ppb-selected-slot-interaction-contract
title: PPB Selected Slot Interaction Contract
type: design-job-artifact
status: complete
summary: Defines Revision 4 replacement, removal, focus, keyboard, and recovery behavior for PPB Vertical Slots.
last_audited: 2026-08-24
owners:
  - wolfpack
domains:
  - interaction-design
systems:
  - product-page-bundle
source_paths:
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/state-matrix.md
tags:
  - ppb
  - interaction
keywords:
  - replacement-target
  - focus
---

# Interaction Contract

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: complete

| Control ID | Role | Accessible name | Pointer action | Keyboard action | State update | Focus behavior | Disabled or busy | Error recovery | Motion |
|---|---|---|---|---|---|---|---|---|---|
| CT-REPLACE | Focusable exact-slot replacement control; must not semantically contain CT-REMOVE | Existing product and slot context, equivalent to “Replace [product]” through existing localization/name construction | Open shared picker for this exact instance | Enter and Space open picker once | Set replacement target before opening | Picker dismissal returns to this exact slot if it remains | Non-interactive default slot is not focusable | Failed picker load leaves selection unchanged and returns/reveals recovery focus | Short restrained feedback only |
| CT-REMOVE | Native button | Existing localized “Remove this product” plus product/slot context where available | Stop propagation and remove exact instance | Native Enter/Space | Remove one targeted instance and recompute capacity | Focus same-index empty slot if rendered; otherwise next surviving slot, previous slot, then step heading | Absent for non-removable default state; busy prevents duplicate activation | Failure leaves item present and exposes existing error feedback | No required movement |
| CT-EMPTY | Native button | Existing saved slot label/number and step context | Open picker without replacement target | Native Enter/Space | Preserve selections; clear replacement target | Picker dismissal returns to same empty slot | Locked/disabled only when existing rules require it | Failed picker load leaves slot reachable | Same restrained feedback |
| CT-PICKER-CLOSE | Existing picker close owners | Existing picker contract | Chevron/backdrop as already defined | Escape/close control | No slot mutation | Return to invoking slot | Topmost-overlay rules apply | Selection remains unchanged | Existing reduced-motion contract |
| CT-PICKER-SELECT | Existing picker product action | Existing product action name | Commit selection/replacement through current rules | Native activation | Replace exact target or fill empty target | After picker completion, return to resulting filled slot | Existing validation/capacity rules | Existing picker feedback; original selection remains on failure | Existing picker contract |

## State transitions

~~~text
empty slot activation
  -> picker opens with no replacement target
  -> valid selection
  -> same-index filled slot

filled slot activation
  -> picker opens with exact replacement target
  -> valid selection
  -> only same-index product changes

remove activation
  -> only exact selected instance is removed
  -> capacity recomputes
  -> focus lands on same-index recovery target when available
~~~

Selection updates must not reorder unrelated instances or reset compatible selections in another step.

## Modal and overlay behavior

- This component does not add an overlay.
- The existing shared picker remains the sole modal owner.
- Only the topmost overlay owns Escape, backdrop dismissal, focus containment, and body scroll lock.
- Picker open/close and nested product-details or variant overlays continue to follow their existing contracts.
- The invoking exact slot is the focus-return target.

## Responsive replacement and reduced motion

- Vertical Slots keeps the existing shared controls and event owners; CSS changes do not replace the semantic tree.
- Focus order follows DOM/slot order regardless of visual column count.
- No interaction requires hover, swipe, animation, or precise pointer movement.
- Reduced motion removes position/scale transitions; visible state and focus feedback remain.

## Business-rule invariants

- Minimum rules retain reachable capacity.
- Exact rules expose no overflow capacity.
- Quantity validation remains owned by picker product cards and does not create slot quantity controls.
- Replacement targets the clicked filled instance.
- Removal targets the clicked instance.
- Persistence, price calculation, discount calculation, cart payloads, and step navigation are unchanged.
- Price and variant display remain outside the Vertical slot-row contract.
- Horizontal Slots behavior and presentation remain unchanged.
