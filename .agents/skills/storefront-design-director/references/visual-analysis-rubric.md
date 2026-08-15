---
schema_version: 1
id: storefront-design-director-visual-analysis
title: Visual Analysis Rubric
type: skill-reference
status: active
summary: Provides a confidence-labeled rubric for decomposing storefront references into implementable design evidence.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/visual-analysis-rubric.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - visual-analysis
keywords:
  - geometry
  - confidence
---

# Visual Analysis Rubric

For each observation record reference ID, component region, state, viewport, value or relationship, evidence source, confidence, and implementation relevance.

Confidence is high when directly measurable in comparable evidence or computed style, medium when consistent but indirect, and low when inferred from a crop, raster artifact, unknown viewport, or incomplete state.

## Layout and geometry

Analyze boundaries, container width, grid or flex structure, columns, rows, alignment, stacking, sticky or fixed behavior, overflow, scroll ownership, whitespace, widths, heights, min and max constraints, padding, gaps, margins, image ratios, controls, borders, radii, icons, progress geometry, line clamping, and scroll regions.

## Typography and surfaces

Analyze family or fallback, hierarchy, size, weight, line height, letter spacing, casing, truncation, wrapping, numerical alignment, price formatting, background, text, borders, selection, status colors, disabled, focus, hover, shadow, gradient, and merchant-configurable values.

## Content and interaction

Identify primary task, actions, progress, pricing, variants, quantity, empty guidance, discounts, recovery, click and tap targets, hover, focus, selected, pressed, disabled, loading, expansion, modal behavior, keyboard, touch, scroll, motion, and reduced motion.

## Responsive and accessibility

Analyze resize, reflow, reorder, collapse, replacement, horizontal scroll, truncation, sticky changes, safe areas, orientation, narrow-width stress, semantic roles, names, focus order, state announcements, contrast risk, color-independent state, keyboard completion, errors, and target size.

Classify each gap as visual, behavioral, responsive, accessibility, content, data, or ownership. Never convert low-confidence raster inference into an exact token without approval.
