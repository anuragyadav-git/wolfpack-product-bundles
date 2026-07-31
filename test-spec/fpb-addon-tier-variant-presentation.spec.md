---
schema_version: 1
id: fpb-addon-tier-variant-presentation
title: FPB Add-On Tier Variant Presentation
type: test-spec
status: active
summary: Verify cached FPB add-on steps adopt the active tier's saved variant presentation.
last_audited: 2026-07-30
owners:
  - storefront
domains:
  - bundles
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/full-page/methods/product-processing-methods.js
related_docs:
  - docs/competitor-analysis/fpb-feature-to-storefront-matrix.md
tags:
  - fpb
  - add-ons
  - parity
keywords:
  - displayVariantsAsIndividualProducts_addons
  - active tier
---

# Test Spec: FPB Add-On Tier Variant Presentation
**Spec ID:** fpb-addon-tier-variant-presentation  **Created:** 2026-07-30

## Purpose
Verify cached add-on product data does not prevent the current eligible tier from controlling grouped versus individual variant presentation.

## Test Cases
### ActiveTierPresentation
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Cached products, active tier switches to individual variants | Non-empty step cache and active tier with `displayVariantsAsIndividualProducts_addons=true` | Step presentation refreshes to individual variants | Reproduces the live Compact parity gap. |

## Acceptance Criteria
- [ ] The focused unit test passes.
- [ ] Widget assets are rebuilt.
- [ ] Live Compact storefront renders each eligible variant separately.
