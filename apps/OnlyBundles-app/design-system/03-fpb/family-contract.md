---
schema_version: 1
id: fpb-family-contract
title: FPB Family Contract
type: family-contract
status: active
summary: Defines FPB contract-resolved behavior shared across four presets.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
source_paths:
  - app/assets/widgets/shared/template-design-system.js
  - app/assets/widgets/full-page/templates/registry.js
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
  - app/assets/widgets/full-page/methods/side-panel-methods.js
related_docs:
  - design-system/README.md
  - test-spec/fpb-all-template-summary.spec.md
tags:
  - fpb
  - family-contract
  - presets
keywords:
  - full-page
  - presets
  - standard
  - classic
  - compact
  - horizontal
---

# FPB Family Contract

- Source: shared template contract under `TemplateDesignSystem.fpb.contracts`.
- Canonical presets: `STANDARD`, `CLASSIC`, `COMPACT`, `HORIZONTAL`.
- Runtime helper: `TemplateDesignSystem.fpb.resolveContract` and `resolvePresetId`.
