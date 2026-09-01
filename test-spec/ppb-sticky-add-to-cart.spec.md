---
schema_version: 1
id: ppb-sticky-add-to-cart
title: PPB Sticky Add to Cart
type: test-spec
status: active
summary: Defines the direct persistence and runtime behavior for a floating PPB cart affordance that delegates to the canonical bundle action.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-configure
  - widget-runtime
source_paths:
  - prisma/schema.prisma
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/parsers.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
  - app/assets/widgets/product-page/
related_docs:
  - docs/competitor-analysis/21-bundlex-urgency-swatches-tier-badges.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - sticky-cart
  - product-page-bundle
keywords:
  - scroll to offers
  - add selected offer
  - native sticky cart
---

# Test Spec: PPB Sticky Add to Cart
**Spec ID:** ppb-sticky-add-to-cart  **Created:** 2026-09-01

## Purpose

Verify that the PPB floating action is direct bundle configuration and remains a thin projection of the existing validated PPB add-to-cart path. It must not submit the neutral Shopify parent product or create a second cart endpoint.

## Test Cases

### StickyAddToCartConfiguration

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | New bundle defaults | Fields absent | Disabled, desktop and mobile enabled, scroll action | Safe opt-in default |
| 2 | Merchant configuration | Enabled, mobile only, direct-add action | Direct canonical fields | No JSON fallback |
| 3 | Save | Valid direct fields | Prisma update receives exact values | PPB only |

### StickyAddToCartRuntime

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Primary CTA visible | Intersection is visible | Floating action hidden | Avoid duplicate actions |
| 2 | Scroll action | Primary CTA offscreen | Scroll and focus the first incomplete bundle control | No cart mutation |
| 3 | Direct-add action | Valid selection | Delegate once to the primary PPB CTA | Reuse validation, pending state, and failure handling |
| 4 | Invalid selection | Direct-add selected but primary CTA disabled | Scroll to the incomplete control | Never bypass validation |
| 5 | Device disabled | Current device switch off | Floating action absent | No CSS-only hidden interactive control |

## Acceptance Criteria

- [x] Direct Prisma fields use documented defaults.
- [ ] PPB save and sync preserve one canonical configuration.
- [ ] The floating action never submits the neutral parent product.
- [ ] The existing PPB add path remains the only cart mutation owner.
- [ ] Desktop and mobile Chrome QA pass after the Prisma restart.
