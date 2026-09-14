# Test Spec: FPB Media Ownership Simplification
**Spec ID:** fpb-media-ownership-simplification  **Created:** 2026-09-10

## Purpose

Keep the FPB Images & GIFs section limited to bundle-level storefront media,
with Step Setup as the sole owner of the canonical step icon.

## Test Cases

### FpbImagesGifsPanel

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Promo banner editor | Desktop and mobile banner drafts | Both upload actions update their route-owned values and mark the draft dirty | Preserve bundle-level banner behavior |
| 2 | Retired media metadata | Open Images & GIFs | No redundant FORMAT summary is rendered | The native drop zones already constrain accepted files |
| 3 | Retired per-step media | Steps contain old `imageUrl` and `bannerImageUrl` values | No per-step media controls are rendered and no step field is changed | Step Setup owns `stepImage` |

### FpbSaveBoundary

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Client serialization | Step contains canonical `stepImage` plus retired media keys | Keeps `stepImage`; omits `imageUrl` and `bannerImageUrl` | Prevents dead fields from crossing the route boundary |
| 2 | Direct route request | FPB or PPB saved step contains retired media keys | Database write omits both retired keys and persists `timelineIconUrl` from `stepImage` | The shared step record has one canonical image owner |
| 3 | Storefront metafield sync | Stored step contains all three media keys | Publishes canonical `stepImage` only | Removes the retired storefront ABI |

### FpbStorefront

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Bundle promo banner | Desktop and mobile banner URLs | Responsive bundle banner element is created | Preserve the useful bundle-level surface |
| 2 | Step content render | Active FPB step | No separate step-banner renderer runs | Avoids a second banner system |

## Acceptance Criteria

- [x] Promo Banner and Floating Promo Badge remain available in FPB Images & GIFs.
- [x] FORMAT and the per-step media editor are absent.
- [x] Step Setup → Step Config remains the sole step-icon editor.
- [x] Retired per-step media keys are neither saved nor published.
- [x] Focused and full verification pass.
