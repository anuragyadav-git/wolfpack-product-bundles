---
schema_version: 1
id: storefront-design-director-responsive-contract
title: Responsive Design Contract
type: skill-reference
status: active
summary: Replaces vague responsive intent with explicit region-level transformations and viewport evidence.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - responsive-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/responsive-design-contract.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/responsive-contract.md
tags:
  - responsive
keywords:
  - viewport
  - overflow
---

# Responsive Design Contract

Screenshot-unobserved responsive recommendations remain at `RESPONSIVE_CONTRACT`. Label them as recommendations rather than screenshot facts, persist accepted conservative defaults as assumptions, and retain the stage until the responsive contract is approved or covered by an applicable recorded delegation. When a finding also owns interaction, accessibility, state, or browser-test behavior, update those affected artifacts before any forward transition.

For every component region and breakpoint range define size behavior, layout mode, order, visibility, replacement component, scroll behavior, sticky or fixed behavior, text wrapping or clamping, image fitting, control sizing, spacing, safe-area behavior, orientation behavior, minimum viable width, and overflow policy.

| Viewport | Purpose |
|---|---|
| 320 x 720 | Narrow mobile stress |
| 360 x 800 | Baseline mobile |
| 390 x 844 | Primary mobile |
| 414 x 896 | Wide mobile |
| 768 x 1024 | Tablet portrait |
| 1024 x 768 | Small desktop or tablet landscape |
| 1280 x 800 | Desktop |
| 1440 x 900 | Primary desktop |
| 1536 x 960 | Wide desktop |

Override this matrix when project evidence requires it. Test one pixel below, at, and one pixel above critical transformations. Test component container widths when merchant placement constrains a widget more than the viewport.

Use explicit resize, reflow, reorder, collapse, replace, scroll, clamp, and sticky or fixed contracts. Verify no unintended overflow, clipping, overlap, or unexpected text wrap; preserve safe-area access and opposite-viewport non-regression.
