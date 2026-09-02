---
schema_version: 1
id: foundation-accessibility
title: Accessibility Foundations
type: design-foundation
status: active
summary: Baseline accessibility contracts for controls, states, and copy behavior.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.js
  - app/assets/widgets/shared/components/product-card.js
  - app/assets/widgets/full-page/methods/selection-navigation-methods.js
related_docs:
  - design-system/08-qa/accessibility-matrix.md
  - design-system/01-foundations/color.md
  - design-system/01-foundations/typography.md
tags:
  - accessibility
  - a11y
  - semantics
keywords:
  - labels
  - focus
  - contrast
  - announcements
---

# Accessibility Foundations

## Required Controls

- Semantic controls for all interactive elements.
- Explicit focus-visible outlines.
- Error and helper text associations with controls.
- Accessible names for icon-only controls.

## State Semantics

Every state transition should expose predictable status where applicable (loading, disabled, selected, error, warning, complete).

## Motion and Sensory Alternatives

- Respect reduced-motion preference.
- Remove motion-only cues and keep explicit text/state semantics.

## Copy and Language

- Copy must preserve localization support where configured.
- Avoid icon-only success/error-only confirmation states.
