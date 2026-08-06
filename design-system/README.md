---
schema_version: 1
id: design-system-overview
title: Wolfpack Bundle Template Design System
type: documentation
status: active
summary: Canonical documentation shell for all FPB and PPB template contracts.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - template-design-system
source_paths:
  - app/assets/widgets/shared/template-design-system.ts
  - app/assets/widgets/shared/full-page-preset.ts
  - app/assets/widgets/full-page/templates/registry.ts
  - app/assets/widgets/product-page/templates/registry.ts
related_docs:
  - wolfpack-bundle-template-design-system-plan.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - fpb
  - ppb
  - templates
keywords:
  - design-system
  - template contracts
  - storefront
---

# Wolfpack Template Design System

This package is the canonical source for all template-family contracts.

- Family coverage: FPB (Standard, Classic, Compact, Horizontal) and PPB (Grid, List, Vertical Slots, Horizontal Slots)
- Primary shared source: `app/assets/widgets/shared/template-design-system.ts`
- Runtime contract adapters: template registries and full-page preset helpers
- Planned artifact set: foundations, shared components, family contracts, templates, copy, fixtures, QA matrix
