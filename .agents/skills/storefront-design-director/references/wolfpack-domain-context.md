---
schema_version: 1
id: storefront-design-director-wolfpack-context
title: Wolfpack Storefront Domain Context
type: skill-reference
status: active
summary: Supplies Wolfpack product-family and architecture safeguards without hard-coding current source paths.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - wolfpack-storefront
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/wolfpack-domain-context.md
related_docs:
  - AGENTS.md
tags:
  - wolfpack
keywords:
  - fpb
  - ppb
---

# Wolfpack Domain Context

Discover current architecture every time.

FPB includes Standard, Classic, Compact, and Horizontal. PPB includes Grid, List, Vertical Slots, and Horizontal Slots.

Common slices include product cards, step navigation, summary sidebar, mobile tray or footer, discount progress, variants, quantities, product modal, total, CTA, feedback, banners, gifts, and default-included states.

Preserve selection, pricing, inventory, validation, and cart logic. Reuse semantic markup, classes, variables, and token owners. Use Wolfpack names; no competitor names in code. Avoid parallel systems, duplicated behavior, runtime-injected static CSS, specificity escalation, misplaced mobile styles, merchant-token bypass, and unrelated changes.

Non-regression:

- Shared FPB: Standard, Classic, Compact, Horizontal.
- Shared PPB: Grid, List, Vertical Slots, Horizontal Slots.
- Shared primitive: both families where applicable.
- Template-only: target plus one sibling baseline.
- Mobile-only: desktop unchanged.
- Desktop-only: mobile replacement unchanged.

Follow repository rules for Chrome evidence, cache bypass, desktop and mobile, generated builds, and user-owned servers.
