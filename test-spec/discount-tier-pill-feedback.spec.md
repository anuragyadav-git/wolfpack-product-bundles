---
schema_version: 1
id: discount-tier-pill-feedback
title: Discount Tier Pill Feedback
type: test-spec
status: active
summary: Defines behavioral coverage for reusable FPB, PPB, SDK, and Design-preview discount-tier feedback.
last_audited: 2026-08-21
owners:
  - engineering
domains:
  - storefront
  - admin
systems:
  - bundle-widgets
  - design-settings
source_paths:
  - app/assets/widgets/shared/discount-tier-feedback.ts
  - app/storefront/sdk.ts
  - app/routes/app/app.settings/DesignLivePreview.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - discount-tier
  - feedback
keywords:
  - wpb:discount-tier-reached
  - wbp:discount-tier-reached
---

# Test Spec: Discount Tier Pill Feedback

**Spec ID:** discount-tier-pill-feedback  **Created:** 2026-08-21

## Purpose

Verify that successful pricing-rule tier advances emit one public event and replay
color-only feedback across every mounted eligible pricing/count pill, while
non-advancing, failed, restored, disabled-pricing, and selector-only changes stay
silent. Verify the four store-level colors persist, generate storefront variables,
and drive localized Cart / Summary preview actions.

## Test Cases

### DiscountTierTransition

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | First tier reached | quantity crosses rule 1 | one `tier` detail | zero-based index |
| 2 | Final tier reached | quantity crosses final rule | one `complete` detail | one-rule config is complete |
| 3 | Same tier or downgrade | quantity stays in or leaves tier | no detail | loss arms re-earning |
| 4 | Re-earned tier | downgrade then advance | tier detail emitted again | no permanent reached cache |
| 5 | Multi-tier jump | one mutation crosses several rules | highest newly reached detail only | one event |
| 6 | Disabled pricing | saved rules with `enabled: false` | no detail | excludes non-pricing feedback |
| 7 | Failed mutation | validator rejects selection | no detail | selection state unchanged |
| 8 | Event order | successful selection and rerender | selection event, rerender, tier event | public detail is exact |

### MountedPillFeedback

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Multiple mounted pills | tier event at widget root | every semantic target receives state | no selector-only pills |
| 2 | Repeated state | two identical tier events | feedback restarts on every event | previous cleanup cancelled |
| 3 | Timed cleanup | tier or completion state | attribute removed after 650 or 1200 ms | normal appearance restored |
| 4 | Reduced motion | reduced-motion media query | static feedback state for same duration | stylesheet owns presentation |

### SettingsAndPreview

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Defaults | new Design state | four requested feedback colors | grouped under Discount feedback |
| 2 | Save | custom feedback colors | values stored in `stylePresets.colors` | unrelated roots preserved |
| 3 | CSS generation | saved feedback colors | four storefront custom properties | generator output behavior |
| 4 | Preview tier action | Cart / Summary + Tier hit | preview pill receives tier state | localized action |
| 5 | Preview completion action | Cart / Summary + All tiers complete | preview pill receives complete state | localized action |

## Acceptance Criteria

- [ ] All listed test cases pass.
- [ ] FPB and PPB emit `wpb:discount-tier-reached` only after their selection UI rerenders.
- [ ] SDK mode emits `wbp:discount-tier-reached` after its normal successful mutation event.
- [ ] Event detail is `{ bundleId, tierId, tierIndex, tierCount, feedbackState }`.
- [ ] Tier feedback lasts 650 ms and completion feedback lasts 1.2 seconds.
- [ ] Every mounted eligible pricing/count pill replays feedback without geometry changes.
- [ ] Reduced motion holds colors statically and restores the normal appearance.
- [ ] Four Design colors persist and generate four CSS variables.
- [ ] Cart / Summary preview exposes localized Tier hit and All tiers complete actions.
