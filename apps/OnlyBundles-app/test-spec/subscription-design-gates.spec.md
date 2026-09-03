---
schema_version: 1
id: subscription-design-gates
title: Subscription Design Gates Test Spec
type: test-spec
status: active
summary: Defines behavior tests for Free and Growth access to Settings Design controls.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
  - design-settings
systems:
  - admin
source_paths:
  - app/lib/subscriptions/design-entitlements.ts
  - app/routes/app/app.settings.tsx
related_docs:
  - internal docs/Subscriptions/03-entitlement-decision-matrix.csv
tags:
  - tdd
  - entitlements
keywords:
  - advanced design
  - settings gate
---

# Test Spec: Subscription Design Gates

**Spec ID:** subscription-design-gates  **Created:** 2026-08-28

## Purpose

Keep brand colors and typography available on Free while reserving discount feedback, corners, images, GIFs, and expert controls for Growth.

## Test Cases

### Design entitlement detection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Default state | Default field values and inheritance | No Growth requirement | Free can save unchanged defaults. |
| 2 | Brand color | Changed primary color | No Growth requirement | Global brand colors remain Free. |
| 3 | Typography | Changed font size or weight | No Growth requirement | Typography remains Free. |
| 4 | Discount feedback | Changed tier color | Growth required | Advanced merchandising color. |
| 5 | Corners | Changed radius | Growth required | Advanced Design. |
| 6 | Media | Added image or GIF | Growth required | Advanced Design. |
| 7 | Expert field | Changed expert control | Growth required | Component-level customization. |
| 8 | Advanced inheritance | Override an inherited expert color | Growth required | Explicit advanced override. |
| 9 | Unexpected entitlement error | Advanced save | Error propagates and no write occurs | Never fail open. |

## Acceptance Criteria

- [ ] Free-safe saves are accepted.
- [ ] Advanced saves return a typed entitlement denial for Free.
- [ ] Growth can save every Design field.
