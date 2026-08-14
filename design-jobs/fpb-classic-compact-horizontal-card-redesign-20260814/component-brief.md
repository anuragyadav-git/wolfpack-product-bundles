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
Artifact revision: 1
Artifact status: complete

## Identity

- Job ID: fpb-classic-compact-horizontal-card-redesign-20260814
- Revision: 1
- Product family: Full Page Bundle (FPB)
- Template or preset: Classic, Compact, and Horizontal; Standard is frozen reference only
- Component: Storefront catalog product cards and preset-owned responsive card grid presentation
- Implementation mode: design-director

## Problem and goal

- User-provided problem: Redesign FPB Classic, Compact, and Horizontal product cards in independent loops while preserving the shared widget behavior and keeping Standard frozen.
- Primary user action: Browse products, inspect variants and pricing, add or remove a product, and adjust quantity without card geometry shifting.
- Design goal: Apply conservative Wolfpack polish while retaining the reference hierarchy, orientation, and interactions for each preset.
- Success signal: Each preset has an approved, preset-owned responsive card direction; all required states are stable at 1440x900, 1280x800, 768x1024, 390x844, and 360x800; Standard and shared surfaces do not change.

## Scope

- In scope: Classic, Compact, and Horizontal preset-owned raw CSS for card anatomy, responsive arrangement, orientation, gaps, sizing, spacing, typography, alignment, borders, and control consistency.
- Out of scope: Standard CSS; shared product-card renderer; product loading, filtering, pagination, selection, pricing, variants, validation, cart flow; summary renderers; mobile summary drawer; product modal/drawer; timeline; shared base and responsive rules; APIs, schema, persistence, copy, new merchant settings, runtime styling, and new abstractions.
- Merchant-configurable values: Reuse existing card, typography, color, radius, image-fit, spacing, and control tokens only; add no settings.
- Business logic constraints: Preserve the existing DOM, classes, data attributes, selection states, variant identity, prices, inventory handling, and cart behavior. Existing grouped and individual variant behavior remains authoritative.
- Accessibility constraints: Keep visible focus, keyboard activation, usable touch targets, semantic controls, and non-expanding hover/focus/selected states.
- Repository-observed ownership: `app/assets/widgets/full-page-css/templates/classic/*.css`, `app/assets/widgets/full-page-css/templates/compact/overrides.css`, and `app/assets/widgets/full-page-css/templates/horizontal/overrides.css`; generated extension CSS is produced by the asset minifier. Standard and shared styles are read-only baselines.

## Evidence and approval

- User facts: Run Classic, then Compact, then Horizontal; reuse C01-C15 as the behavior ledger; use one conservative direction per preset; acquire explicit direction approval before implementation; keep transient captures in `/private/tmp`.
- Screenshot facts: Pending fresh comparable EB and Wolfpack captures.
- Repository facts: The shared shell caps Classic at four columns, Compact at three, and Horizontal at two; all card grids require equal heights within each row and state changes must not grow cards.
- Assumptions: Existing authenticated EB and Wolfpack fixtures remain safe test data; current plan-defined scope is approved for design discovery but not yet a direction approval.
- Open decisions: One explicit approval decision for the three controlled directions after measured evidence is assembled.
- Scope status: complete
- Approved by and at: User-provided implementation plan, 2026-08-14
