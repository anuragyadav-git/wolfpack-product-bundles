---
schema_version: 1
id: fpb-copy-matrix
title: FPB Copy Matrix
type: copy-matrix
status: active
summary: FPB copy surfaces and contract ownership.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
source_paths:
  - design-system/00-inventory/copy-registry.yaml
  - app/assets/widgets/full-page/methods/runtime-cart-settings-methods.js
related_docs:
  - design-system/05-copy/placeholder-contract.md
  - design-system/05-copy/fallback-rules.md
tags:
  - fpb
  - copy
keywords:
  - addToCart
  - labels
  - localization
---

# FPB Copy Matrix

## Canonical FPB Copy Surfaces

- Add-to-cart CTA text in product cards.
- Selected/summary labels where present in shared runtime.

## Control points

- Copy entries must map to `copy-registry.yaml`.
- UI adapters must not hard-code new merchant-facing copy.

## Localization

- Copy surfaces requiring localization should pass through existing fallback chain and locale-aware resolution.
