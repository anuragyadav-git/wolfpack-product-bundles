---
schema_version: 1
id: foundation-motion
title: Motion Foundation
type: design-foundation
status: active
summary: Motion, transitions, and reduced-motion replacements for bundle templates.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/full-page/methods/selection-methods.js
  - app/assets/widgets/product-page/methods/selection-methods.js
related_docs:
  - design-system/01-foundations/accessibility-foundations.md
  - design-system/01-foundations/spacing-and-density.md
tags:
  - motion
  - animations
  - accessibility
keywords:
  - transition
  - reduced-motion
  - hover
---

# Motion Foundation

## Required Motion Types

- hover lift
- selection pulse/transition
- quantity morph
- modal open/close
- tray expand/collapse
- progress fill
- toast enter/exit
- skeleton shimmer

## Reduced Motion Policy

When reduced-motion is active, transitions must fallback to minimal timed changes with no movement-based focus loss.

## Source Rules

- Animation duration and easing must be tokenized, not template hard-coded.
- Motion tokens are shared by both families and are applied through semantic selectors.
