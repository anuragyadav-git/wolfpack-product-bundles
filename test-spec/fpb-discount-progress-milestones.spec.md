---
schema_version: 1
id: fpb-discount-progress-milestones
title: FPB Discount Progress Milestones
type: test-spec
status: active
summary: Verifies FPB stepped discount progress calculation, milestone states, and transition continuity.
last_audited: 2026-08-13
owners:
  - storefront
domains:
  - bundles
systems:
  - full-page-widget
source_paths:
  - app/assets/widgets/full-page/methods/step-footer-methods.ts
  - app/assets/widgets/shared/components/discount-progress.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - storefront
  - discount-progress
keywords:
  - milestone
  - progress animation
---

# Test Spec: FPB Discount Progress Milestones
**Spec ID:** fpb-discount-progress-milestones  **Created:** 2026-06-12

## Purpose
Verify FPB stepped discount progress exposes real tier copy, deterministic checkpoint states, segment-based progress, and rebuild-safe transitions.

## Test Cases
### FullPageStepFooterMethods.getDiscountProgressMilestones
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Quantity rule without custom tier text | Quantity threshold 3, percentage discount 10 | Milestone title `3 Pack`, subTitle `Save 10%` | Uses actual pricing rule values |
| 2 | Custom tier text configured | Rule has `tierText` and `tierSubtext` | Configured values are preserved | Merchant copy wins over generated fallback |
| 3 | Two quantity tiers | Thresholds 2 and 4; quantities 0 through 4 | Progress is 0, 25, 50, 75, 100 | Interpolates within each checkpoint segment |
| 4 | Amount tiers | Amount thresholds 1000 and 2000 | Uses current bundle amount for segment progress | Quantity does not affect amount tiers |
| 5 | Mixed condition types | Quantity tier followed by amount tier | A condition type without a previous matching tier starts from zero | Avoids combining unlike units |
| 6 | Milestone state | Current value before, at, and beyond thresholds | Each milestone is active, reached, or pending | Exactly one next milestone is active |
| 7 | DOM rebuild continuity | Existing rendered fill and a new target | Transition begins at the visible fill and ends at target | Reduced motion updates immediately |

## Acceptance Criteria
- [ ] Milestone fallback title uses the quantity threshold as a pack label.
- [ ] Milestone fallback subtitle uses the actual discount value from the pricing rule.
- [ ] Configured merchant tier text still takes precedence.
- [ ] Checkpoints are evenly positioned by rule order.
- [ ] Progress interpolates within the active tier segment without jumping at reached thresholds.
- [ ] Add, remove, and rapid successive updates begin from the currently visible fill.
- [ ] Reduced-motion users receive the final progress value without animation.
