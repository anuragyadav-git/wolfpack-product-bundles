---
schema_version: 1
id: discount-pricing-tip-banner
title: Discount Pricing Tip Banner
type: test-spec
status: active
summary: Defines the shared FPB-owned discount setup tip banner used by both configure flows.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/DiscountPricingTipBanner.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingRules.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountRulesPanel.tsx
  - tests/unit/routes/discount-pricing-tip-banner.test.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - banner
  - discount-pricing
keywords:
  - discount setup tip
  - shared banner
---

# Test Spec: Discount Pricing Tip Banner

**Spec ID:** discount-pricing-tip-banner  **Created:** 2026-08-14

## Purpose

Ensure FPB and PPB use the same native Polaris discount setup banner, with the FPB banner as the source of truth.

## Test Cases

### Shared discount pricing tip

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render shared tip | Default render | Informational `s-banner` with `Discount setup tip` heading | Matches FPB |
| 2 | Dismiss tip | Banner emits dismiss | Local dismissed state becomes true | Does not dirty bundle state |
| 3 | Render after dismissal | Local dismissed state is true | Banner is absent | Session-only dismissal |

## Acceptance Criteria

- [x] Shared banner preserves the FPB heading, copy, and tone.
- [x] The shared FPB and PPB banner is dismissible without persistence changes.
- [x] FPB and PPB consume the shared component.
- [x] Focused behavior tests pass.
