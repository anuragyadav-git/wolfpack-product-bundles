---
schema_version: 1
id: foundation-radii-borders-shadows
title: Radii, Borders, and Shadows Foundation
type: design-foundation
status: active
summary: Shared geometry and contour system for cards, controls, and overlays.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - design-system/01-foundations/design-tokens.json
related_docs:
  - design-system/01-foundations/spacing-and-density.md
  - design-system/01-foundations/color.md
tags:
  - radii
  - borders
  - shadows
keywords:
  - geometry
  - contours
  - selected-state
---

# Radii, Borders, and Shadows Foundation

## Required Geometry Classes

- card radius / button radius / input radius
- border width for default/selected/error states
- progress track radius
- overlay radius and blur family
- selected-state inset and halo treatment

## Selection Geometry Rule

Selected state must not alter external component dimensions.

- Use inset and box-shadows/outline offsets designed to preserve layout box size.
- Keep touch targets independent from border thickness toggles.

## Shadows

- Keep shadow definitions semantic (elevation family) rather than per-template literals.
- Avoid heavy shadows when high contrast mode is required unless tokenized.
