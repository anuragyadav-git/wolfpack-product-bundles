---
schema_version: 1
id: foundation-iconography
title: Iconography Foundation
type: design-foundation
status: active
summary: Shared icon policy and sizing semantics for bundle templates.
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
  - app/assets/widgets/full-page/templates/registry.js
  - app/assets/widgets/product-page/templates/registry.js
related_docs:
  - design-system/01-foundations/spacing-and-density.md
  - design-system/03-fpb/family-contract.md
tags:
  - iconography
  - accessibility
  - controls
keywords:
  - icon
  - size
  - semantic
---

# Iconography Foundation

## Tokenized Sources

- Use semantic icon names, not template-embedded classes.
- Icon set and size should be shared where behavior/meaning matches.

## Functional Rules

- Every informational icon must have an accessible label or associated text.
- Decorative icons should be hidden from accessibility tree.
- Icon-only actions need explicit accessible labels.

## Sizing

- Define small, default, and emphasized icon scales as density-aware semantic values.
- Do not encode icon size inline inside adapters; map through tokenized variables.
