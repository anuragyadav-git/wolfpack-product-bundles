---
schema_version: 1
id: storefront-design-director-visual-comparison
title: Visual Comparison Rubric
type: skill-reference
status: active
summary: Combines pixel evidence with semantic review and per-region tolerances for storefront visual QA.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - visual-testing
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/visual-comparison-rubric.md
related_docs:
  - .agents/skills/storefront-design-director/scripts/compare_images.py
tags:
  - visual-diff
keywords:
  - mismatch-ratio
  - tolerance
---

# Visual Comparison Rubric

Use automated evidence and semantic review. One global mismatch percentage cannot approve a design.

Stabilize dynamic fixture data and media before proposing a visual-diff mask. Pin the fixture product, media, state, and loading conditions when possible. A mask is a last resort after stabilization is shown unavailable, never the first response to a dynamic image difference.

Record dimensions, compared pixels, mismatch ratio, changed-region bounds, mask, channel tolerance, allowed ratio, engine, and diff path. Dimension mismatch fails. Setup or dependency failure is blocked.

Use strict budgets for deterministic captures. Mask or widen tolerance only for approved dynamic imagery. Review hierarchy, boundaries, spacing, alignment, wrapping, state clarity, affordance, responsive transformation, visual weight, and unintended change.

Every mask approval records stable ID, PNG path, reason, approver, and a positive rectangle. A dynamic subregion such as product media may sit inside the component, but the browser plan must confirm that it does not cover pixels or geometry exercised by the case assertions. `compare_images.py` blocks any non-zero mask pixel outside approved rectangles, a fully masked comparison, or a dimension mismatch between mask and baseline.

Default guidance: major boundaries within about 4 CSS pixels unless approved, no unexpected wrap, no horizontal overflow, no clipped focus or indicator, and no unapproved state-transition shift.

Each failure records expected, actual, measured delta, evidence, assertion, severity, canonical owner, correction, regression scope, and retest cases.

Use `BLOCKER`, `HIGH`, `MEDIUM`, `LOW`, or `ACCEPTED`. `ACCEPTED` requires an intentional approved deviation. Feedback without a measured difference is incomplete.
