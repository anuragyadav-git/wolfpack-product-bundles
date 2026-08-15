---
schema_version: 1
id: fpb-step-capacity-card-interaction
title: FPB Step Capacity Card Interaction
type: test-spec
status: active
summary: Verifies that completed FPB steps keep all product cards interactive while attempted over-selection remains rule-validated.
last_audited: 2026-08-13
owners:
  - storefront
domains:
  - bundle-rules
systems:
  - storefront-widget
source_paths:
  - app/assets/widgets/full-page/methods/product-grid-methods.ts
  - app/assets/widgets/full-page/methods/selection-navigation-methods.ts
  - tests/unit/assets/fpb-step-capacity-card-interaction.test.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - validation
keywords:
  - exact-quantity
  - product-card
---

# Test Spec: FPB Step Capacity Card Interaction
**Spec ID:** fpb-step-capacity-card-interaction  **Created:** 2026-08-13

## Purpose
Verify that returning to a completed FPB step does not proactively lock the remaining product cards. The existing attempted-update validation continues to reject quantities beyond the configured step rule and show its toast.

## Test Cases

### CompletedStepProductCards
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Revisit completed exact-quantity step | Three products with two selected under `quantity = 2` | All three product cards remain available and passive grid rendering does not run attempted-update validation | Visual state is verified in Chrome, not through CSS assertions |
| 2 | Attempt to exceed exact quantity | Add another product after the step total reaches two | Selection is unchanged and the existing rule toast explains the limit | Covered by the shared condition validator regression suite |

## Acceptance Criteria
- [x] Completed-step rendering keeps every product card available.
- [x] Attempted over-selection remains blocked before state mutation.
- [x] The existing validation toast remains the user-facing explanation.
