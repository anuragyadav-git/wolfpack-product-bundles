---
schema_version: 1
id: fpb-classic-addon-sidebar-stacking
title: FPB Add-on Sidebar Tier Progression
type: test-spec
status: active
summary: Verifies add-on summaries show the active highest tier and remaining locked tiers without duplicating superseded eligible messages.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/validation-addons-methods.js
  - tests/unit/assets/fpb-addons-gifting-step-separation.test.ts
related_docs:
  - internal docs/EB Free Gift Add Ons Behavior Spec.md
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - add-ons
  - parity
keywords:
  - highest eligible add-on tier
  - add-on summary messages
---

# Test Spec: FPB Classic Add-on Sidebar Stacking
**Spec ID:** fpb-classic-addon-sidebar-stacking  **Created:** 2026-07-05

## Purpose
Verify the storefront add-on summary matches EB tier progression: show the active highest eligible tier plus higher locked tiers, suppress lower eligible tiers once superseded, and preserve highest-eligible-tier business logic for products, pricing, and cart lines.

## Test Cases
### AddonTierSummaryState
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Multiple ineligible tiers | Two quantity tiers at 1 and 2 selected paid products, zero selected | Returns two ineligible summary states in tier order | Supports stacked sidebar messages |
| 2 | Mixed eligible and ineligible tiers | Two quantity tiers at 1 and 2 selected paid products, one selected | Returns tier 1 eligible and tier 2 ineligible | UI can show stacked status cards |
| 3 | Multiple eligible tiers | Two quantity tiers, two selected paid products | Returns only tier 2 eligible; tier 1 is suppressed | Matches current live EB summary behavior |
| 4 | Highest eligible tier remains active discount | Two quantity tiers, two selected paid products | Active line discount remains the highest eligible tier | Preserves business/cart behavior |

## Acceptance Criteria
- [x] Summary state exposes all locked tiers before qualification.
- [x] Summary state exposes the active tier and higher locked tiers during progression.
- [x] Summary state suppresses lower eligible tiers after a higher tier qualifies.
- [x] Existing active add-on discount evaluation still uses the highest eligible tier.
- [x] No CSS/source-grep tests are added.
