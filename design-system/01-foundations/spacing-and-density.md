---
schema_version: 1
id: foundation-spacing-and-density
title: Spacing and Density Foundation
type: design-foundation
status: active
summary: Shared spacing scale and density-mode system for FPB/PPB templates.
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
  - design-system/01-foundations/motion.md
related_docs:
  - design-system/01-foundations/breakpoints.md
  - design-system/03-fpb/compact/README.md
  - design-system/04-ppb/list/README.md
tags:
  - spacing
  - density
  - layout
keywords:
  - grid
  - gap
  - compact
  - comfortable
---

# Spacing and Density Foundation

## Density Modes

- `comfortable`
- `standard`
- `compact`

Density mode should be applied as alias shifts to spacing tokens, not copied raw per template.

## Required Spacing Tokens

Minimum required families:

- gutter
- section gap
- control gap
- inset
- control padding
- card gap
- summary padding
- badge offset

## Non-Goals

- Do not add hardcoded distances per-template unless constrained by physical system limits.
- Do not use fixed pixel tables for component-level spacing in source render logic.

## Next Evidence Actions

- Capture current viewport-sensitive spacing from existing template render states.
- Validate each spacing token against desktop/mobile visual evidence.
