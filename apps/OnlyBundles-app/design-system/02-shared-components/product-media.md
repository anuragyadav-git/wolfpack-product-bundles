---
schema_version: 1
id: shared-component-product-media
title: Shared Component - Product Media
type: component-contract
status: active
summary: Shared image and media behavior used by product rows and cards.
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
  - app/assets/widgets/full-page/shared/summary-pricing-display.js
  - app/assets/widgets/shared/engine/cart-lines.js
related_docs:
  - design-system/01-foundations/imagery.md
  - design-system/01-foundations/motion.md
tags:
  - component
  - media
  - image
keywords:
  - thumbnail
  - fallback
  - layout
---

# Product Media

## Required Behaviors

- Deterministic image source fallback
- Stable aspect and resize behavior by design token
- Lazy or optimized loading strategy documented in source evidence
- Accessibility-friendly alt text source chain

## Contract Notes

- Aspect or size changes must be controlled by density and geometry tokens.
