---
schema_version: 1
id: foundation-typography
title: Typography Foundation
type: design-foundation
status: active
summary: Shared semantic typography contract across full-page and product-page bundle templates.
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
  - design-system/01-foundations/accessibility-foundations.md
  - design-system/01-foundations/color.md
tags:
  - typography
  - design-foundation
keywords:
  - semantics
  - headings
  - body
  - price
---

# Typography Foundation

## Required Semantic Roles

- page title
- subtitle
- step/category title
- body
- product title
- product meta
- price primary
- price original
- badge
- progress message
- summary title
- summary value
- button
- helper
- validation/error
- modal title

## Device-Level Requirements

Each role should define:

- desktop size/line-height/weight
- mobile size/line-height/weight
- wrapping and max line behavior
- truncation rule
- semantic meaning and accessible announcement expectations

## Scope Controls

- Typography role names remain business semantic.
- Template adapters may consume density aliases but must not create template-specific custom font systems.

## Next Evidence Actions

- Map each semantic role to exact runtime class or inline style paths in current templates.
- Confirm all role usage in desktop and mobile matrices.
