---
schema_version: 1
id: storefront-design-director-token-geometry
title: Design Token and Geometry Guide
type: skill-reference
status: active
summary: Converts measured evidence into semantic tokens, merchant ownership, and explicit geometry tolerances.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - design-systems
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/design-token-and-geometry-guide.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/design-tokens.json
tags:
  - tokens
keywords:
  - geometry
  - merchant-configurable
---

# Design Token and Geometry Guide

Use semantic groups: color, typography, spacing, size, radius, border, shadow, z-index, motion, breakpoint, and component-specific aliases.

Every token records name, value, unit, source, confidence, merchant-configurable boolean, owner, and notes. Source is reference-observed, repository-existing, user-defined, or recommendation.

Reuse repository and merchant token ownership before adding aliases or primitives. Never hard-code a merchant-configurable value in the handoff.

Record exact values only from comparable screenshots, computed style, or explicit requirements. Use ranges or recommendations for low-confidence inference. Distinguish content-driven dimensions from true fixed primitives. Prefer intrinsic and responsive CSS constructs for storefront layout. Define tolerance per assertion; major component boundaries should usually remain within about 4 CSS pixels unless approved otherwise.

Record card stability, image ratio, wrapping, indicator bounds, button size, summary width, scroll region, sticky offset, safe-area padding, and state-transition layout shift.
