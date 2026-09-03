---
schema_version: 1
id: storefront-design-director-component-brief-template
title: Component Brief Template
type: design-job-template
status: active
summary: Captures the problem, scope, constraints, and success criteria for one storefront component design job.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/component-brief.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - template
keywords:
  - scope
  - component-brief
---

# Component Brief

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 4
Artifact status: complete

## Identity

- Job ID: fpb-classic-compact-horizontal-card-redesign-20260814
- Revision: 1
- Product family: Full Page Bundle (FPB)
- Template or preset: Standard, Classic, Compact, and Horizontal
- Component: All widget-owned storefront layout surfaces, with first priority on product-card pricing and action alignment
- Implementation mode: design-director

## Problem and goal

- User-provided problem: Identify and correct minute placement or alignment defects across all four FPB templates, with extra attention to pricing.
- Primary user action: Browse products, inspect variants and pricing, add or remove a product, and adjust quantity without card geometry shifting.
- Design goal: Preserve each template's established Wolfpack identity while removing measured alignment instability and accidental state-dependent movement.
- Success signal: At a fixed viewport, title, variant, price, and action geometry remains invariant when a product changes between default and selected-quantity states; all widget-owned surfaces remain unclipped and aligned at required widths.

## Scope

- In scope: Standard, Classic, Compact, and Horizontal raw CSS governing cards, pricing/action rows, grids, timeline, navigation, summary/sidebar, mobile tray, modal, and other widget-owned placement surfaces. Shared raw CSS is in scope only when the same measured defect exists in every preset.
- Out of scope: Visual redesign; product loading, filtering, pagination, selection, pricing calculations, variants, validation, cart flow; APIs, schema, persistence, copy, new merchant settings, runtime styling, and new abstractions.
- Merchant-configurable values: Reuse existing card, typography, color, radius, image-fit, spacing, and control tokens only; add no settings.
- Business logic constraints: Preserve the existing DOM, classes, data attributes, selection states, variant identity, prices, inventory handling, and cart behavior. Existing grouped and individual variant behavior remains authoritative.
- Accessibility constraints: Keep visible focus, keyboard activation, usable touch targets, semantic controls, and non-expanding hover/focus/selected states.
- Repository-observed ownership: `app/assets/widgets/full-page-css/templates/{standard,classic,compact,horizontal}/`; shared owners under `app/assets/widgets/full-page-css/` only for confirmed cross-template defects. Generated extension CSS is produced by the asset minifier and is never edited directly.

## Evidence and approval

- User facts: Audit all four FPB templates and all widget-owned surfaces, prioritize minute pricing placement, use the Wolfpack contract as baseline, retain C01-C15, and keep transient captures in `/private/tmp`.
- Screenshot facts: Pending fresh comparable EB and Wolfpack captures.
- Repository facts: The shared shell caps Classic at four columns, Compact at three, and Horizontal at two; all card grids require equal heights within each row and state changes must not grow cards.
- Assumptions: Existing authenticated EB and Wolfpack fixtures remain safe test data; current plan-defined scope is approved for design discovery but not yet a direction approval.
- Open decisions: None. The user explicitly approved the broader four-template scope and Wolfpack-contract baseline on 2026-09-03.
- Scope status: complete
- Approved by and at: Aditya Awasthi, 2026-09-03
