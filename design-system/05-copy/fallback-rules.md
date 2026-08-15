---
schema_version: 1
id: copy-fallback-rules
title: Copy Fallback Rules
type: copy-contract
status: active
summary: System-first fallback rules for template copy.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - copy-management
source_paths:
  - app/assets/widgets/full-page/methods/runtime-cart-settings-methods.js
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.js
related_docs: []
tags:
  - copy
  - fallback
  - i18n
keywords:
  - fallback
  - localizable
---

# Fallback Rules

- Use config-provided copy first, else theme defaults.
- Avoid hardcoded merchant-facing strings in new adapters.
