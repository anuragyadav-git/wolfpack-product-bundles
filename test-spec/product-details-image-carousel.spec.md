---
schema_version: 1
id: product-details-image-carousel
title: Product Details Image Carousel
type: test-spec
status: active
summary: Verifies multi-image hydration and carousel navigation for the FPB storefront product-details overlay.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - storefront
systems:
  - widget-runtime
source_paths:
  - app/routes/api/api.storefront-products.tsx
  - app/routes/api/api.storefront-collections.tsx
  - app/assets/bundle-modal-component.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - product-modal
  - carousel
keywords:
  - product images
  - desktop modal
  - mobile drawer
---

# Test Spec: Product Details Image Carousel

**Spec ID:** product-details-image-carousel  **Created:** 2026-08-13

## Purpose

Ensure product and collection hydration retain Shopify product images and the
FPB desktop modal/mobile drawer exposes navigation only when more than one
distinct image is available.

## Test Cases

### StorefrontProductImages

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Direct product hydration | Product with two Shopify images | Both images are returned in source order | Used by product-ID steps |
| 2 | Collection product hydration | Collection product with two Shopify images | Both images are returned in source order | Used by collection categories |
| 3 | FPB overlay navigation | Product with two distinct images | Navigation is visible and advances/wraps the active image | Same component owns desktop and mobile |
| 4 | Mobile image swipe | Horizontal gesture over the image | Left/right swipe advances/reverses; short or vertical gestures do nothing | Does not conflict with drawer dismissal |

## Acceptance Criteria

- [x] Direct-product and collection-product payloads preserve multiple images.
- [x] The carousel is inactive for a single distinct image.
- [x] Previous/next navigation cycles through distinct images.
- [x] Mobile horizontal image swipes navigate without triggering on vertical gestures.
- [x] Desktop modal and mobile drawer use the same shared implementation.
