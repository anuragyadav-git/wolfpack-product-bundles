---
schema_version: 1
id: shared-empty-state-contract
title: Shared Empty State Contract
type: design-system-component
status: active
summary: Defines initial, filtered, and unavailable empty states for all bundle templates.
last_audited: 2026-08-07
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb
  - ppb
source_paths:
  - app/assets/widgets/shared/components/selected-product-slots.ts
  - app/assets/widgets/full-page/methods/product-grid-methods.ts
related_docs:
  - design-system/02-shared-components/feedback.md
tags:
  - empty-state
  - recovery
keywords:
  - filtered-empty
  - unavailable
---

# Empty State

| State | Trigger | Required result |
|---|---|---|
| Initial selection | No selected shopper products | Preserve summary anatomy and show the configured empty representation |
| Filtered empty | Search or category filter has no matches | Keep filter context and expose a clear/reset action |
| Unavailable | Configured products exist but none are sellable | Explain unavailability and prevent progression |
| Empty slot | A required slot has no selection | Preserve slot order and expose its selection action |

Empty states use localized copy, cannot fabricate merchant marketing text, and cannot be represented by color alone. Desktop and mobile keep the same semantic state while template adapters may change composition.
