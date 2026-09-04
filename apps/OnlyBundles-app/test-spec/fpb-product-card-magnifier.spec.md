# Test Spec: FPB Product Card Magnifier SVG
**Spec ID:** fpb-product-card-magnifier  **Created:** 2026-09-04

## Purpose
Ensure that the product card magnifier icon rendered in FPB templates when product details are enabled is a proper SVG icon element rather than empty spans or CSS pseudo-element hacks, with consistent rendering behavior across all templates.

## Test Cases

### ProductCardMagnifierSvg
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Renders SVG magnifier icon when product details enabled | `productDetailsEnabled: true` | `.bw-product-card__magnifier svg` exists with `aria-hidden="true"`, circle, and path elements | Clean SVG icon inside magnifier element |
| 2 | Does not render magnifier overlay when product details disabled | `productDetailsEnabled: false` | `.bw-product-card__image-overlay` is null | No overlay or magnifier when modal disabled |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Magnifier SVG correctly centered and visible across all 4 FPB presets
