---
schema_version: 1
id: fpb-summary-sidebar-slot-count
title: FPB Summary Sidebar Slot Count
type: test-spec
status: active
summary: Verifies mobile and desktop summary slot rendering does not over-provision an extra empty slot.
last_audited: 2026-07-23
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - tests/unit/assets/fpb-summary-sidebar-slots.test.ts
  - tests/unit/assets/fpb-summary-row-skeleton-count.test.ts
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - summary
  - mobile-slot
  - desktop-slot
keywords:
  - summary slot count
  - compact horizontal
  - mobile footer
  - desktop sidebar
