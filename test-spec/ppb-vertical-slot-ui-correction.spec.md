# Test Spec: PPB Vertical Slot UI Correction
**Spec ID:** ppb-vertical-slot-ui-correction  **Created:** 2026-08-22

## Purpose
Ensure that PPB vertical slot templates (`VERTICAL_SLOTS` preset and `data-ppb-slot-orientation="vertical"`) render slot cards with structural parity to the reference design: uniform card tiles with centered image thumbnails on top, centered product titles below, hidden intra-card prices (aggregated in the footer CTA), and top-right positioned remove badges.

## Test Cases
### PPBVerticalSlotRendering
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Create empty state vertical slot card | `createEmptyStateCard(step, 0, 0)` with vertical layout | Button with `.step-box.bw-slot-card.bw-slot-card--empty`, visual slot icon, and step label | Symmetrical tile dimensions |
| 2 | Create filled state vertical slot card | `createSelectedProductCard(item, 0)` with vertical layout | Element with `.bw-slot-card--filled`, top remove badge, image wrapper, and centered title | Price hidden inside slot |
| 3 | Remove button in filled vertical slot | Click remove badge | Dispatches `removeProductFromSelection` with correct variant ID and step index | Interactive callback verified |
| 4 | Preview surface vertical slot rendering | Render `ProductSlotsSurface` with `orientation="vertical"` | Renders uniform slot cards with filled product and empty slots | Reflects authentic layout |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Raw widget JS passes syntax checks (`node --check`)
- [ ] CSS builds within Shopify 100 KB limit
