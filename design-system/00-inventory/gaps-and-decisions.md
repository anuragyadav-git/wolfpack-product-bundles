---
schema_version: 1
id: design-system-gaps-decisions
title: Design System Gaps and Decisions
type: design-system
status: active
summary: Tracks unresolved gaps while the full FPB/PPB design-system migration proceeds.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb
  - ppb
source_paths:
  - wolfpack-bundle-template-design-system-plan.md
related_docs:
  - wolfpack-bundle-template-design-system-plan.md
tags:
  - gaps
  - decisions
keywords:
  - fpb
  - ppb
  - migration
---

# Gaps and Decisions

1. Default, selected, and quantity desktop/mobile Chrome coverage is complete across all 8 templates; loading, validation, discount, error, keyboard, and content-stress evidence remains pending.
2. Template family contracts are centralized but selector-heavy renderers still contain some legacy preset-branch behavior that should be reduced in later passes.
3. The 88-field FPB/PPB/shared storefront language inventory is generated from runtime source. Non-language merchant content fields such as bundle, step, category, box, and banner text still require source-backed classification.
4. Color token foundations were expanded to a concrete semantic contract (`01-foundations/design-tokens.json`); full color-family registry coverage is still pending for all 25+ mutable theme controls.
