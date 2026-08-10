---
schema_version: 1
id: ppb-vertical-slots-template
title: PPB Vertical Slots Adapter
type: template-contract
status: active
summary: PPB Vertical Slots template contract.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.ts
  - app/assets/widgets/product-page/templates/modal-slot-template.ts
  - app/assets/widgets/product-page-css/base/bottom-sheet-modal.css
related_docs:
  - design-system/02-shared-components/buttons.md
  - design-system/04-ppb/responsive-contract.md
tags:
  - ppb
  - vertical
  - template
keywords:
  - VERTICAL_SLOTS
---

# PPB Vertical Slots

- Contract source: `TemplateDesignSystem.ppb.contracts.VERTICAL_SLOTS`.
- Runtime selection: `PDP_MODAL + VERTICAL_SLOTS`.
- Empty and filled selection slots stack vertically in the product form and
  open the shared product-selection modal.
- Modal step tabs, close control, product actions, quantity controls, and footer
  navigation retain the shared 44px minimum interaction target.
- Modal product cards keep equal row heights when selection state changes.
- Desktop uses the full-width modal presentation; mobile uses the shared
  bottom-sheet shell with a two-column product grid and safe-area-aware footer.
