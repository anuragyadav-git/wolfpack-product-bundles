---
schema_version: 1
id: shared-component-buttons
title: Shared Component - Buttons
type: component-contract
status: active
summary: Shared button behavior and states for FPB/PPB storefront templates.
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
  - app/assets/widgets/full-page/methods/selection-navigation-methods.js
  - app/assets/widgets/full-page/methods/selection-methods.js
related_docs:
  - design-system/01-foundations/color.md
  - design-system/01-foundations/typography.md
  - design-system/02-shared-components/product-card.md
tags:
  - component
  - button
  - shared
keywords:
  - cta
  - primary
  - secondary
  - disabled
---

# Buttons

## Required Behaviors

- Primary action invocation
- Secondary and alternative action styles
- Disabled and loading states
- Selected-state styling without size shift
- Icon + label combinations

## Contract

- Families share behavior and state semantics.
- Template adapters may adjust density and arrangement, not business behavior.
