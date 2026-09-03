---
schema_version: 1
id: shared-component-modal
title: Shared Component - Modal
type: component-contract
status: active
summary: Shared modal/tray overlay contract for PPB and FPB flows.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
  - full-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.js
  - app/assets/widgets/product-page/templates/cascade-template.js
  - app/assets/widgets/product-page/templates/modal-slot-template.js
related_docs:
  - design-system/01-foundations/z-index-and-overlays.md
  - design-system/01-foundations/motion.md
tags:
  - component
  - modal
  - tray
keywords:
  - overlay
  - close
  - accessibility
---

# Modal

## Required Behaviors

- Focus-trap and close controls
- Backdrop handling
- Esc/overlay dismiss policy
- Route-adaptive content sizing
- Deterministic open/close transitions

## Contract

- Overlay behavior must be shared and not duplicated as template-specific logic.
