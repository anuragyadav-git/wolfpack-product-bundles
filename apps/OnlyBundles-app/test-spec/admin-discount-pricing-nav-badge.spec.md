---
schema_version: 1
id: admin-discount-pricing-nav-badge
title: Admin Discount Pricing Navigation Badge
type: test-spec
status: active
summary: Verifies that the shared bundle configure navigation identifies the active discount method.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin-ui
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/CommonConfigureSidebar.tsx
  - tests/unit/routes/admin-discount-pricing-nav-badge.test.ts
related_docs: []
tags:
  - discount
  - navigation
keywords:
  - Discount Pricing
  - badge
  - discount method
---

# Test Spec: Admin Discount Pricing Navigation Badge

**Spec ID:** admin-discount-pricing-nav-badge  **Created:** 2026-08-14

## Purpose

Confirm that the shared FPB and PPB configure navigation shows `None` when discounts are disabled and a green method badge when a discount is configured.

## Test Cases

### Discount pricing status badge

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Discount is disabled | Any discount method | `None`, subdued | The configured method is ignored while disabled |
| 2 | Percentage discount is enabled | `percentage_off` | `% off`, success | Shared by FPB and PPB |
| 3 | Fixed amount discount is enabled | `fixed_amount_off` | `$ off`, success | Shared by FPB and PPB |
| 4 | Fixed bundle price is enabled | `fixed_bundle_price` | `fixed`, success | Shared by FPB and PPB |
| 5 | Buy X Get Y is enabled | `buy_x_get_y` | `BXGY`, success | Shared by FPB and PPB |
| 6 | Discount method is unsupported | Unknown method | No badge | Fails closed instead of presenting an incorrect method |

## Acceptance Criteria

- [x] Disabled discounts retain the neutral `None` badge.
- [x] Every supported configured discount method has the requested label and success tone.
- [x] Unknown methods do not produce a misleading badge.
