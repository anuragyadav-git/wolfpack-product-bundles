---
schema_version: 1
id: fpb-upsell-direction
title: FPB Upsell Direction
type: design-direction
status: approved
summary: Selects the unified app-embed-owned renderer direction.
last_audited: 2026-08-13
owners: [Aditya Awasthi]
domains: [storefront-design]
systems: [fpb-upsell]
source_paths: [app/storefront/app-embed.ts]
related_docs: [design-jobs/fpb-product-page-upsell-shared-runtime-20260813/visual-audit.md]
tags: [fpb]
keywords: [direction]
---

# Direction Comparison

Artifact job ID: fpb-product-page-upsell-shared-runtime-20260813
Artifact revision: 1
Artifact status: approved

- Direction A — Unified app-embed renderer: one runtime, one placement anchor, multiple offers, container-driven layout. Selected.
- Direction B — Mode-specific Liquid blocks: rejected because it duplicates ownership and cannot reliably consume saved targeting/localization state.
- Direction C — Preset-owned destination integrations: rejected because the feature belongs to product pages and must remain identical across FPB presets.

Approval: the user supplied Direction A as the implementation plan and requested end-to-end implementation on 2026-08-13.
