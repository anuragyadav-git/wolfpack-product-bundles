---
schema_version: 1
id: foundation-breakpoints
title: Responsive Breakpoints Foundation
type: design-foundation
status: active
summary: Canonical viewport and transformation breakpoints for DS validation.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/full-page/css/bundle-widget-full-page.css
  - app/assets/widgets/product-page/css/bundle-widget.css
related_docs:
  - design-system/08-qa/visual-comparison-rubric.md
  - design-system/03-fpb/responsive-contract.md
  - design-system/04-ppb/responsive-contract.md
tags:
  - responsive
  - breakpoints
  - testing
keywords:
  - mobile
  - tablet
  - desktop
---

# Breakpoints Foundation

## Standard Validation Set

Per plan, validate at:

- 320×720
- 360×800
- 390×844
- 414×896
- 768×1024
- 1024×768
- 1280×800
- 1440×900
- 1536×960

## Breakpoint Method

- Test one pixel below, exact, and one pixel above each critical transformation point.
- Validate both desktop and mobile states for each family/template adapter.

## Source Control Rule

- Breakpoint-specific behavior must be driven by shared responsive contracts, not duplicated per template.
