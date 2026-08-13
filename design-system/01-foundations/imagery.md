---
schema_version: 1
id: foundation-imagery
title: Imagery Foundation
type: design-foundation
status: active
summary: Shared image and media handling rules for bundle cards and thumbnails.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/components/product-card.js
  - app/assets/widgets/product-page/components/product-selector.js
  - app/assets/widgets/product-page/methods/selection-data-methods.js
related_docs:
  - design-system/02-shared-components/product-media.md
  - design-system/05-copy/placeholder-contract.md
tags:
  - imagery
  - product-media
  - responsive
keywords:
  - media
  - aspect-ratio
  - image-fallback
---

# Imagery Foundation

## Baseline Constraints

- Maintain product image aspect semantics across family adapters.
- Preserve responsive behavior through intrinsic ratios and `object-fit` contracts.
- Define minimum thumbnail geometry for touch and desktop modes.

## Required Behaviors

- Missing image fallback must exist and remain non-breaking.
- Placeholder state should be deterministic and accessible.
- Lazy loading behavior should be shared by family where feasible.

## QA Notes

- Validate image geometry and fallback on small screens (390×844 and 320×720).
