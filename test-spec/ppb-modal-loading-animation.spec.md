# Test Spec: PPB Modal Loading Animation

**Spec ID:** ppb-modal-loading-animation
**Created:** 2026-08-22

## Purpose
Verify that product card skeletons inside the PPB drawer modal product grid are replaced by the merchant-configured loading GIF (when present) or the default CSS loading spinner (when no GIF is set), providing a unified loading experience consistent with the merchant's settings.

## Test Cases

### ModalProductsLoadingSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render modal loading with custom merchant GIF | `loadingGif: "https://cdn.shopify.com/custom-loader.gif"` | Product grid contains `.bw-bs-modal-loading` with `<img class="bundle-loading-overlay__gif">` having `src="https://cdn.shopify.com/custom-loader.gif"`; no `.skeleton-loading` cards | Verifies custom GIF rendering |
| 2 | Render modal loading without custom GIF (null/undefined) | `loadingGif: null` | Product grid contains `.bw-bs-modal-loading` with `.bundle-loading-overlay__spinner`; no `.skeleton-loading` cards | Verifies fallback to default CSS spinner |
| 3 | Skeletons removed from modal loading | `renderModalProductsLoading(0)` | DOM query for `.product-card.skeleton-loading` inside modal returns 0 elements | Skeletons replaced completely |
| 4 | Safe handling when productGrid element is missing | `modal.querySelector('.product-grid')` is `null` | Method executes gracefully without throwing | Null-safe execution |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] No product card skeletons rendered inside the modal
- [x] Merchant's `loadingGif` URL correctly rendered when available
- [x] Default CSS loading spinner rendered when `loadingGif` is not set
