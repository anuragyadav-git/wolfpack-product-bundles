---
schema_version: 1
id: storefront-design-director-interaction-contract-template
title: Interaction Contract Template
type: design-job-template
status: active
summary: Defines pointer, keyboard, focus, state, error, and motion behavior for interactive regions.
last_audited: 2026-08-03
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

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 2
Artifact status: complete

| Control ID | Role | Accessible name | Pointer action | Keyboard action | State update | Focus behavior | Disabled or busy | Error recovery | Motion |
|---|---|---|---|---|---|---|---|---|---|
| IC-01 PPB dropdown | Native `select` with visible `label` | Shopify option/group label or configured Variant label | Open and choose value | Native browser select keys | Calls existing PPB variant callback once; updates current value | Remains on select after change | Unavailable `option` disabled; no selector-owned busy state | Existing widget hydration/stock owner handles failure | Native only |
| IC-02 PPB pill/color/image choice | Native radio input inside one named group | Shopify option-value label; unavailable suffix in accessible name | Select available value | Native Tab into group and arrow/Space behavior | Checked state and persistent selected label update; callback fires once | Focus remains on selected radio; visible ring on its visual label | Disabled radio cannot activate | Existing product state remains unchanged if invalid value is rejected | State transitions may fade only when motion allowed |
| IC-03 FPB intrinsic option choice | One named radio group per Shopify option dimension, presented through the existing FPB button capability | Visible option-group and value text | Select available value | Native radio-group keyboard behavior | Existing combination resolver selects the matching available variant and delegates one update | Focus remains on chosen value after rerender where possible | Unavailable combination value remains disabled and visible | If a combination is invalid, keep last valid selection and existing feedback | No layout-affecting motion |
| IC-04 FPB dropdown trigger | Existing button/listbox or drawer trigger where current policy owns that presentation | Visible group label plus current value | Open options; select one | Enter/Space opens; Arrow keys traverse; Enter selects; Escape closes | Updates existing variant once and collapses/dismisses | Trigger retains/restores focus on close unless selection rerender preserves chosen option | Unavailable values cannot activate | Last valid value remains; existing feedback owns failure | Open/close transition respects reduced motion |
| IC-05 PPB color tooltip | Supplemental tooltip | Same canonical Shopify option-value label as its control | Hover on fine pointer | Focus on owning radio | No business state update | Tooltip follows owning focus without moving focus | Not rendered unless color mode and merchant-enabled | Persistent selected label remains if tooltip unavailable | No delayed essential information; reduced motion removes transition |
| IC-06 FPB details trigger | Existing product-details button/card affordance | Product-specific details name | Open existing FPB modal/sheet | Enter/Space | No variant mutation | Initial focus follows existing modal owner | Disabled only by existing card state | Close and retry through existing modal behavior | Existing modal transition only |
| IC-07 modal/sheet close | Existing close button, backdrop, or Escape path | Explicit Close product details/selector name | Close | Enter/Space or Escape | Preserve last committed selector state | Restore focus to exact trigger | Never hidden while modal open | Existing modal remains open when an in-modal selection error needs recovery | Reduced-motion close is immediate/nonessential |
| IC-08 FPB drawer option | Existing drawer option control | Full variant/value label and price where present | Select and dismiss | Enter/Space | Updates variant once through shared FPB state | Selection returns focus through trigger/rerender contract | Unavailable control remains visible and disabled | Invalid choice leaves drawer/product state stable | Existing drawer motion reduced when requested |
| IC-09 quantity control | Existing decrement/increment control | Product-specific quantity action | Change quantity | Native button activation | Existing quantity state and limits | Focus stays on activated control | Limit state disabled through existing logic | Existing stock feedback | Unchanged |
| IC-10 Add action | Existing card/modal Add button | Product-specific Add action | Add selected variant | Native button activation | Existing bundle selection/cart state | Existing focus behavior | Disabled when selection/stock rules block | Existing toast/status owner | Unchanged |

## State transitions

1. Hydrated multi-variant product enters its configured presentation with one valid current value; a single-variant product renders no selector.
2. Choosing an available value resolves through the existing family owner. Exactly one active variant is produced, then the existing image, price, compare-at price, stock, quantity clamp, selection summary, and Add eligibility update.
3. Choosing a disabled/unavailable value produces no callback, mutation, card click, Add action, or modal open.
4. A selection rerender preserves the selector's footprint and returns or retains focus on the chosen control when that control still exists.
5. Missing Shopify swatch media changes presentation to the neutral labeled state only; it cannot change which variants are available or selected.
6. PPB color tooltip enablement adds supplemental hover/focus text only. It never replaces the persistent selected label or accessible name.
7. PPB fail-closed hydration suppresses usable selector/Add state; stale product or variant data cannot remain interactive.

## Modal and overlay behavior

- FPB product-details and PPB slot-picker overlays retain their existing trigger, dialog name, initial focus, focus containment, scroll lock, close button, Escape, backdrop, and exact-trigger focus return.
- No nested product-details modal is added inside the PPB slot picker.
- The existing FPB mobile selector drawer is mutually exclusive with its inline replacement. Opening it sets an expanded relationship on the trigger; closing or selecting restores the trigger/selected-control focus contract.
- Selector controls do not create a new body scroll lock. Modal/drawer owners remain solely responsible.
- If an in-overlay selection becomes invalid because live availability changes, keep the overlay open, preserve the last valid variant, focus the affected group or existing feedback, and allow another selection.

## Responsive replacement and reduced motion

- Shared state lives with the family selector owner, not in separate desktop/mobile copies. If the existing FPB policy replaces the inline control with a drawer, only one interactive tree is exposed at a time.
- Narrow reflow preserves source and focus order. Visual columns cannot reorder values.
- Sticky CTAs remain separately focusable and cannot cover the last selector row, focused ring, modal action, or virtual-keyboard recovery path.
- No selector depends on animation. With `prefers-reduced-motion: reduce`, transitions are removed or made effectively immediate while selected, focus, expanded, and unavailable feedback remains visible.

## Business-rule invariants

- Shopify-hydrated option, swatch, variant, price, and availability data remain authoritative.
- FPB and PPB retain their existing variant-combination resolution and callback contracts; presentation cannot write a second variant state.
- Add and quantity controls remain the only selection/cart mutations outside choosing the active variant.
- Variant-control activation must stop card-level Add/details handlers from also firing.
- Unavailable values remain visible and disabled; unavailable data is never filtered merely to improve fit.
- Unit tests cover semantics, event count, state/data flow, invalid/unavailable behavior, and overlay lifecycle only. CSS classes, properties, element placement, and pixel geometry are prohibited test assertions and belong to Chrome QA.
