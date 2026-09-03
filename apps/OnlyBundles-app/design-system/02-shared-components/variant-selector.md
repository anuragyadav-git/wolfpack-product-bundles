---
schema_version: 1
id: shared-component-variant-selector
title: Shared Component - Variant Selector
type: component-contract
status: active
summary: Shared variant selection behavior for product bundles across FPB and PPB.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/variant-selector.js
  - app/assets/widgets/shared/variant-selector-policy.js
related_docs:
  - design-system/01-foundations/iconography.md
  - design-system/08-qa/accessibility-matrix.md
tags:
  - component
  - variant
  - swatch
keywords:
  - selector
  - option
  - selection
---

# Variant Selector

## Required Behaviors

- Render selected/unselected state with stable keys
- Support required variants and out-of-stock blocking semantics
- Preserve default variant initialization
- Keep rendering behavior aligned to business rules in shared runtime

## Contract

- This component must not diverge between template adapters.
- Adapter-level changes are layout-only (swatch grid/tile count/placement).
