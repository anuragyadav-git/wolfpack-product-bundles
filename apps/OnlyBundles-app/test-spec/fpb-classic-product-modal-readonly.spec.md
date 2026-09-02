# Test Spec: FPB Classic Product Modal Read-only Quick View
**Spec ID:** fpb-classic-product-modal-readonly  **Created:** 2026-07-05

## Purpose
Verify Classic storefront product-card quick view can open the product modal as a read-only EB-style detail view while preserving the existing actionable modal path for non-read-only usage.

## Test Cases
### ProductModalReadOnly
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Read-only quick view add path | Product modal opened with `{ readOnly: true }`, then add path is invoked | Widget selection update is not called and modal stays open | Prevents image/title quick view from acting like product add |
| 2 | Actionable modal add path | Product modal opened without read-only option, then add path is invoked | Widget selection update receives selected quantity and modal closes | Preserves existing non-read-only modal behavior |
| 3 | Background scroll while details are open | Open product details, then attempt to scroll the storefront | Storefront offset does not change until the modal closes | Modal content remains independently scrollable |

## Acceptance Criteria
- [x] Read-only quick-view modal does not mutate bundle selection.
- [x] Existing actionable modal behavior remains available.
- [x] Storefront background scrolling is locked while product details are open and restored after close.
- [x] Visual parity is verified through Chrome DevTools MCP, not CSS/source-grep tests.
