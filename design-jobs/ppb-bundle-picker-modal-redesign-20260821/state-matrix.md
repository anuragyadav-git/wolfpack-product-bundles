---
schema_version: 1
id: storefront-design-director-state-matrix-template
title: State Matrix Template
type: design-job-template
status: active
summary: Records complete behavioral and evidence coverage for every applicable component state.
last_audited: 2026-08-21
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/state-matrix.md
related_docs:
  - .agents/skills/storefront-design-director/references/state-coverage-catalog.md
tags:
  - template
keywords:
  - states
  - assertions
---

# State Matrix

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 8
Artifact status: complete

| State ID | Trigger | Data precondition | Visible result | Available interaction | Accessibility | Desktop | Mobile | Screenshot | Automated assertion | Approval |
|---|---|---|---|---|---|---|---|---|---|---|
| closed | Close/Escape/backdrop | Any | Sheet absent | Slot opener | Focus restored | Same | Same | No | Lifecycle regression | approved |
| loading | Open or category fetch | Request pending | Existing loading feedback | Close | Busy state remains perceivable | Fixed regions | Fixed regions | No | Existing loading test | approved |
| loaded | Request succeeds | Products | Scrollable cards | Select/details/nav | Dialog labelled; tab contained | 4-5 intrinsic cols | 2 cols | Yes | Open/focus behavior | approved |
| empty | Request succeeds | No products | Existing empty feedback | Close/back | Feedback readable | Centered | Centered | No | Existing empty behavior | approved |
| fetch-error | Request fails | Error | Existing retry/error feedback | Retry/close | Error perceivable | Same | Same | No | Existing error test | approved |
| selected | Select product | Available product | Existing selected/check/quantity state | Change/remove/next | State not color-only | Stable card | Stable card | Yes | Selection regression | approved |
| filled-slot-identity | Render selected slot | Selected product with short or long title | Vertical renders live EB's intrinsic full-width row with 60px minimum, no maximum, 50px media, visible title wrapping, no price, and inline 20px circular-cross visual; Horizontal retains its bounded tile | Remove one unit or open an empty slot | Remove remains a product-specific named native button; Vertical row is inert and Horizontal retains replacement activation | Orientation-owned presentation | Same orientation-owned presentation | Yes | Exact Vertical computed styles, complete-name semantics, inert-row behavior, and one-unit removal assertions | approved |
| validation-error | Advance invalid | Requirement unmet | Existing toast/message | Correct selection | Error announced/focus not obscured | Footer visible | Footer visible | Yes | Existing validation test | approved |
| nested-drawer | Details/variant control | Eligible product | Nested layer above picker | Complete/close nested | Escape closes top layer only | Picker retained | Picker retained | No | Layer regression | approved |
| close-reopen | Close then reopen | Prior state | Restored selection/category | Continue | Opener focus round-trip | Same | Same | No | Restore regression | approved |
| add | Unselected card | Sellable active variant, quantity 0 | Separate localized Add action | Add or open details from image | Add has product-specific name | Same | Same | Yes | One Add mutation | approved |
| quantity-disabled-validation | Select product | Validation disabled, quantity > 0 | Inline decrement/count/increment | Edit quantity or remove | Named quantity group | Same | Same | Yes | Pure helper returns quantity | approved |
| quantity-below-maximum | Select/increment | Validation enabled, quantity below maximum | Inline controls remain | Increment up to maximum | Disabled state only at boundary | Same | Same | Yes | Boundary mutation test | approved |
| maximum-reached | Reach configured maximum | Validation enabled, quantity equals maximum | Check and localized `Added xN` replaces controls | Activate to remove all | Pressed state and full action name | Same | Same | Yes | Pure helper plus remove-all | approved |
| grouped-variant | Change native selector | Multiple grouped variants | Identity, image, price, compare-at, availability update | Add stays separate | Label visible desktop / accessible mobile | Label visible | Label visually hidden | Yes | Zero Add mutations | approved |
| unavailable-variant | Select unavailable option where exposed | Variant unavailable | Availability context updates; Add blocked | Choose another variant | Disabled/unavailable conveyed in name and state | Same | Same | No | Inventory regression | approved |
| details-add | Activate card image | Unselected product | Editable stacked details sheet | Gallery/variant/quantity/Add | Topmost labelled modal | 88dvh max sheet | 88dvh max sheet | Yes | Add once to originating slot | approved |
| details-update | Activate image for selected product | Existing selection | Current variant/quantity restored; Update action | Edit and update | Action announces Update | Same | Same | Yes | In-place update, no duplicate | approved |
| details-cancel | Dismiss details | Unsaved local edits | Picker remains unchanged | Resume selection | Focus returns to exact image | Same | Swipe also available | No | No mutation | approved |
| replacement | Open from filled slot | Slot replacement target | Add/Update replaces exact slot | Confirm or cancel | Target context retained | Same | Same | No | No capacity growth | approved |
| open-ended-capacity | Add beyond minimum | Minimum operator | One empty slot remains ahead | Continue adding | Slot labels remain unique | Same | Same | No | Existing capacity regression | approved |
| exact-capacity | Reach exact rule | Exact operator | No overflow slot | Remove/replace/advance | Rule feedback operable | Same | Same | No | Existing capacity regression | approved |
| session-restored | Reload | Valid stored state | Variant, quantity, slot and selected-card state restore | Continue/edit | Restored state perceivable | Same | Same | No | Persistence regression | approved |
| topmost-details | Open details over picker | Two PPB layers | Details alone handles Escape/backdrop/swipe/Tab | Dismiss details | Picker stays inert; focus exact | Same | Swipe on handle | No | Layer ownership tests | approved |

## Not applicable

| Catalog state | Reason |
|---|---|
| Reordering | PPB slot picker does not reorder products. |
| Gift/default-included | Existing upstream rules are preserved but not redesigned. |
| Variant drawer | Horizontal/Vertical use an inline native selector at every viewport in revision 2. |

## Coverage

- Required: closed, loading, loaded, empty, fetch-error, add, quantity-disabled-validation, quantity-below-maximum, maximum-reached, grouped-variant, unavailable-variant, validation-error, details-add, details-update, details-cancel, replacement, open-ended-capacity, exact-capacity, session-restored, topmost-details, close-reopen
- Covered: all required states
- Missing: none
- Status: complete
