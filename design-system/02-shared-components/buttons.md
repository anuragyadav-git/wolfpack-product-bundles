---
schema_version: 1
id: shared-component-buttons
title: Shared Component - Buttons
type: component-contract
status: active
summary: Shared button behavior and states for FPB/PPB storefront templates.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.ts
  - app/assets/widgets/full-page/methods/selection-navigation-methods.ts
  - app/assets/widgets/full-page/methods/selection-methods.ts
  - app/assets/widgets/product-page-css/base/inpage-shared-footer.css
  - app/assets/widgets/product-page-css/templates/inpage-cascade.css
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
- A minimum 44px interactive block size for product actions, quantity controls,
  navigation controls, icon-only remove controls, and primary checkout actions

## Contract

- Families share behavior and state semantics.
- Template adapters may adjust density and arrangement, not business behavior.
- Compact visual treatment must not reduce the interactive target below 44px.
