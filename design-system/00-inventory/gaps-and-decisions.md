---
schema_version: 1
id: design-system-gaps-decisions
title: Design System Gaps and Decisions
type: design-system
status: resolved
summary: Records the evidence-backed closure of the FPB and PPB design-system migration gaps.
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
  - design-system/08-qa/reports/2026-08-10-storefront-template-release.md
tags:
  - gaps
  - decisions
keywords:
  - fpb
  - ppb
  - migration
---

# Gaps and Decisions

1. Desktop and mobile Chrome coverage is complete across all 8 templates for loading, empty, selected, quantity, validation, discount, modal/drawer, recoverable error, accessibility, and content-stress states. The release evidence is recorded in `design-system/08-qa/reports/2026-08-10-storefront-template-release.md`.
2. Template-family decisions resolve through `template-design-system.ts` contracts. Remaining literal template IDs are adapter entry points or registry accessors rather than parallel rendering policy.
3. The runtime language inventory remains generated from source, and the copy registry now also classifies current merchant-authored bundle, step, category, gift, add-on, and summary content fields. Schema-only fields without a current storefront surface are not presented as visible copy.
