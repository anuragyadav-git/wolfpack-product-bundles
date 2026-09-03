---
schema_version: 1
id: shared-skeleton-contract
title: Shared Skeleton Contract
type: design-system-component
status: active
summary: Defines content-shaped loading placeholders shared by all eight bundle templates.
last_audited: 2026-08-07
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb
  - ppb
source_paths:
  - app/assets/widgets/shared/loading-overlay.ts
  - app/assets/widgets/shared/default-loading-animation.ts
related_docs:
  - design-system/01-foundations/motion.md
tags:
  - loading
  - skeleton
keywords:
  - partial-hydration
  - reduced-motion
---

# Skeleton

## Anatomy

- Product-card skeleton mirrors media, title, price, and action geometry.
- Row skeleton mirrors thumbnail, copy, price, and quantity geometry.
- Slot skeleton preserves the final slot dimensions.
- Summary skeleton preserves the final summary width and expected row count.

## States

| State | Visual contract | Interaction contract |
|---|---|---|
| Initial | Content-shaped neutral placeholders | All shopping controls remain unavailable |
| Partial hydration | Resolved regions replace only their matching placeholders | Available controls become operable independently |
| Complete | Skeleton owner is hidden and removed after transition | Focus order contains only final controls |
| Error | Skeleton is replaced by the relevant error contract | Retry remains keyboard operable |

## Responsive and accessibility

- Skeleton geometry follows the active family and template adapter; it cannot introduce a separate layout.
- Loading owners expose status semantics without announcing every animated child.
- Reduced-motion mode removes shimmer and uses a static surface transition.
- Hidden skeletons must have zero rendered geometry and must not remain focusable.
