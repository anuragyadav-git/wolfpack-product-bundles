---
schema_version: 1
id: ppb-selected-slot-state-matrix
title: PPB Selected Slot State Matrix
type: design-job-artifact
status: complete
summary: Defines required behavioral and content states for Horizontal and Vertical PPB selected slots.
last_audited: 2026-08-21
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/component-anatomy.md
tags:
  - ppb
  - states
keywords:
  - selected-slot
  - state-matrix
---

# State Matrix

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 2
Artifact status: complete

| State ID | Trigger | Data precondition | Visible result | Available interaction | Accessibility | Desktop | Mobile | Screenshot | Automated assertion | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| ST-01 | Capacity exposes an unfilled instance | Minimum/open capacity remains | Existing configured visual and saved slot label/number | Open picker without replacement target | Native button and descriptive name | Equal outer geometry to filled tile/row | Same | Required both orientations | Activation opens correct step and leaves replacement target empty | required |
| ST-02 | Shopper selects a product | Valid selected instance | Media, title, optional variant, price, optional compare-at, remove | Replace exact instance; remove exact instance | Replacement and removal have distinct names and focus stops | Tile or row by orientation | Tile or row by orientation | Required both orientations | Rendered instance maps to exact step and selection key | approved direction |
| ST-03 | Pointer enters replacement or remove target | Pointer-capable device | Quiet affordance without geometry change | Target remains operable | Not used as sole state cue | Applies | Not required on touch | Optional desktop | No behavior assertion beyond target ownership | approved direction |
| ST-04 | Keyboard focuses replacement or remove | Keyboard navigation | Visible merchant-color focus treatment, unclipped | Enter/Space follows native/helper contract | Focus order is replace then remove for each slot | Applies | Applies with hardware keyboard | Required | Keyboard activation calls only the focused action | approved direction |
| ST-05 | Pointer/key activation is in progress | Enabled target | Subtle non-overshooting feedback; no layout shift | Completes intended action once | Reduced motion may remove transition | Applies | Applies | Optional | One activation produces one event | approved direction |
| ST-06 | Long product and variant names | Identity exceeds ordinary length | Title clamps to two lines; variant to one line; price/actions remain visible | Replace/remove unchanged | Full accessible name remains available | No row-height divergence | No overflow | Required at 320 and 1280 | Content does not alter instance targeting | approved direction |
| ST-07 | Compare-at exceeds payable price | Existing product pricing supplies both | Payable price emphasized; compare-at shown in same group | Unchanged | Price relationship remains understandable to assistive tech | Compact | Compact | Required | Compare-at visibility follows data, not PPB config | approved direction |
| ST-08 | Image absent or loading | No usable image URL or slow response | Existing placeholder/fallback occupies reserved media geometry | Unchanged | Alt policy remains product-derived or intentionally empty for decorative fallback | Stable | Stable | Required missing-image | Rendering remains operable before image load | approved direction |
| ST-09 | Session restores product no longer selectable | Persisted selection exists but product/variant unavailable | Identity remains visible with existing unavailable status and remove access | Remove available; replacement available when current rules allow | Status not color-only | Stable | Stable | Required | Reload restoration preserves exact instance and recovery action | approved direction |
| ST-10 | Step supplies compulsory product | Non-removable default selection | Same identity anatomy plus existing included status; no remove | No replacement/removal unless current business contract permits | Non-interactive state is not falsely focusable | Stable | Stable | Required if fixture supports | Default cannot be removed | existing behavior |
| ST-11 | Gift unlocks and is selected | Current free-gift rules satisfied | Same identity anatomy plus existing gift/ribbon treatment | Existing gift replacement/removal rules only | Gift status has text alternative | Stable | Stable | Optional | Gift targeting remains isolated | existing behavior |
| ST-12 | Selection meets minimum but open capacity remains | Minimum operator permits further selection | Filled instances plus one reachable empty slot | Empty opens picker | Logical order follows slot order | Intrinsic grid | Intrinsic grid | Required | One reachable empty remains | existing behavior |
| ST-13 | Exact rule is satisfied | Selected count equals exact capacity | Filled instances only; no overflow empty slot | Replace/remove remain | No hidden focusable overflow slot | Stable | Stable | Required | No extra slot is exposed | existing behavior |
| ST-14 | Slot product data is not ready | Default or restored data pending | Geometry-matched non-jumping loading representation | Busy slot does not activate prematurely | Busy state is exposed when interactive owner is unavailable | Stable | Stable | Required | Loading completion preserves ordering | approved direction |
| ST-15 | Shopper activates remove | Removable filled instance | Only targeted instance disappears; capacity-derived empty state recomputes | Focus moves to logical surviving/replacement control | Change is announced once by existing selection feedback | No sibling height jump | No sibling height jump | Required | Other selected instances are unchanged | existing behavior |
| ST-16 | User preference or 200%+ zoom | Reduced motion or enlarged text | No required motion; content reflows without action overlap | All actions remain reachable | Logical reading/focus order preserved | Reflow allowed | Reflow allowed | Required | Behavior independent of animation | approved direction |

## Not applicable

| Catalog state | Reason |
|---|---|
| Quantity selector states | Slot summaries represent selected instances and do not introduce inline quantity controls. Quantity behavior remains in the picker/product-card owner. |
| Variant required/selection controls | Variant selection remains in the existing variant selector or picker, not inside the slot. |
| Error message inside slot | Validation and request errors remain owned by existing picker/widget feedback; the slot must not invent parallel errors. |
| Slot-owned scrolling | Selected slots stay in normal flow. |
| Expanded/collapsed | Slots do not disclose nested content. |
| Drag/reorder | Reordering is not supported by current PPB slot behavior. |

## Coverage

- Required: 16 applicable states
- Covered: 16
- Missing: 0
- Status: complete
