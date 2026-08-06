---
schema_version: 1
id: copy-localization
title: Copy Localization
type: copy-contract
status: active
summary: Localization behavior for merchant-configurable and localizable copy.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - copy-management
source_paths:
  - design-system/05-copy/placeholder-contract.md
  - app/assets/widgets/full-page/methods/runtime-cart-settings-methods.js
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.js
related_docs:
  - design-system/05-copy/fallback-rules.md
tags:
  - copy
  - i18n
  - locale
keywords:
  - localization
  - locale
  - locales
---

# Copy Localization

## Rule

- Merchant-editable copy remains locale aware where supported by runtime.
- Locale fallback should still preserve existing copy behavior with safe defaults.

## Scope

- FPB and PPB copy fields listed in `copy-registry.yaml`.
- Default copy remains stable across locales where a locale value is missing.
