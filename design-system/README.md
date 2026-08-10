---
schema_version: 1
id: design-system-overview
title: Wolfpack Bundle Template Design System
type: documentation
status: active
summary: Canonical runtime-backed design-system package for all FPB and PPB template contracts.
last_audited: 2026-08-10
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
  - app/lib/settings-language-runtime.ts
  - design-system/scripts/extract-copy-registry.mjs
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

This package is the canonical source for all template-family contracts and their
auditable configuration, copy, state, fixture, and QA inventories.

- Family coverage: FPB (Standard, Classic, Compact, Horizontal) and PPB (Grid, List, Vertical Slots, Horizontal Slots)
- Primary shared source: `app/assets/widgets/shared/template-design-system.ts`
- Runtime contract adapters: template registries and full-page preset helpers
- Runtime copy extraction: `design-system/scripts/extract-copy-registry.mjs` derives exact IDs, labels, paths, defaults, and placeholders from `app/lib/settings-language-runtime.ts`
- Artifact set: foundations, shared components, family contracts, templates, copy, fixtures, and QA matrix
