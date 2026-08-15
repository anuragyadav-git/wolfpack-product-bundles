---
schema_version: 1
id: fpb-configuration-matrix
title: FPB Configuration Matrix
type: configuration-matrix
status: active
summary: Canonical FPB configuration values and their template behavior.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
source_paths:
  - design-system/00-inventory/configuration-registry.yaml
  - design-system/00-inventory/template-registry.yaml
  - app/lib/bundle-config/template-selection.ts
  - app/assets/widgets/shared/template-design-system.js
related_docs:
  - app/assets/widgets/full-page/templates/registry.js
  - app/assets/widgets/full-page/methods/runtime-cart-settings-methods.js
tags:
  - fpb
  - config
keywords:
  - preset
  - STANDARD
  - CLASSIC
  - COMPACT
  - HORIZONTAL
---

# FPB Configuration Matrix

## Required axis

- `bundleDesignPresetId`: `STANDARD | CLASSIC | COMPACT | HORIZONTAL`
- Preset-specific layout is resolved through shared contract only.

## Template mapping

- `STANDARD` → `fpb.contracts.STANDARD`
- `CLASSIC` → `fpb.contracts.CLASSIC`
- `COMPACT` → `fpb.contracts.COMPACT`
- `HORIZONTAL` → `fpb.contracts.HORIZONTAL`

## Scope and behavior

- Any value outside the set must fail validation or fall back via explicit policy in the shared resolver.
- Contract changes must update:
  - `app/lib/bundle-config/template-selection.ts`
  - `app/assets/widgets/shared/template-design-system.js`
  - registries in `design-system/00-inventory/*`
