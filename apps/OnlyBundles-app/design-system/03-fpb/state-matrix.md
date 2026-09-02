---
schema_version: 1
id: fpb-state-matrix
title: FPB State Matrix
type: state-matrix
status: active
summary: Required storefront and admin states for FPB template families.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
source_paths:
  - design-system/03-fpb/family-contract.md
  - design-system/00-inventory/state-registry.yaml
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
  - app/assets/widgets/full-page/methods/side-panel-methods.js
related_docs:
  - design-system/00-inventory/state-coverage.csv
  - design-system/08-qa/accessibility-matrix.md
tags:
  - fpb
  - states
keywords:
  - summary mode
  - side panel
  - mobile tray
---

# FPB State Matrix

## Core FPB States

- `summary mode`
- `selection flow`
- `skeleton loading`
- `validation messaging`
- `discount messaging`
- `mobile drawer/slot rendering`
- `sidebar progress`

## Template coverage

- `STANDARD`, `CLASSIC`, `COMPACT`, and `HORIZONTAL` share all base states through contract resolution.
- Preset-specific layout variations are expressed through `fpb.summary` and `fpb.discountProgress` contract data.

## Evidence references

- `app/assets/widgets/full-page/methods/responsive-layout-methods.js`
- `app/assets/widgets/full-page/methods/side-panel-methods.js`
- `design-system/00-inventory/state-registry.yaml`

## Unfinished

- Add per-template interaction assertions after runtime visual verification for all desktop/mobile breakpoints.
