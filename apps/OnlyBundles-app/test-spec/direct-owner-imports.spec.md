---
schema_version: 1
id: direct-owner-imports
title: Direct Owner Imports Test Spec
type: test-spec
status: active
summary: Preserves offer, design-preview, theme-color, attribution, and add-on behavior while removing compatibility re-exports.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - architecture
systems:
  - module-ownership
source_paths:
  - app/lib/specific-link-offer.ts
  - app/routes/app/app.settings/design-preview-model.ts
  - app/routes/app/app.settings/design-preview-state.ts
  - app/lib/shop-brand-colors.ts
  - app/routes/app/app.attribution/AttributionDateRangeControls.tsx
related_docs:
  - internal docs/Architecture/State Management.md
tags:
  - tdd
  - ownership
keywords:
  - direct imports
  - compatibility re-exports
---

# Test Spec: Direct Owner Imports

**Spec ID:** direct-owner-imports  **Created:** 2026-09-10

## Purpose

Remove pass-through module exports while preserving behavior through the
modules that actually own each contract.

## Test Cases

### Owner Behavior

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Specific-link URL | Destination and valid offer token | URL contains the canonical `wpb_offer` query parameter | Constant comes from the offer contract owner |
| 2 | Offer eligibility | Required and optional specific-link policies | Eligibility decisions and reason codes remain unchanged | Routes import the query key directly |
| 3 | Design preview transitions | Supported template, viewport, scenario, and interaction actions | Preview state and derived model remain unchanged | Tests import model/state owners directly |
| 4 | Theme-color inheritance | Valid Shopify brand colors | Generated storefront CSS preserves the existing color cascade | Type comes from the brand-color owner |
| 5 | Attribution backfill modal | Valid and invalid date-window input | Existing submit and validation behavior remains unchanged | Modal comes from its component owner |
| 6 | Add-on tier editor | Existing tier drafts and callbacks | Tier editing behavior remains unchanged | Draft type comes from its route-owned type module |

## Acceptance Criteria

- [x] Focused owner behavior tests pass.
- [x] Typecheck and modified-file ESLint pass.
- [x] Knip reports no unused or unresolved module boundary.
- [x] Graphify and `git diff --check` pass.
