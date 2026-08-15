---
schema_version: 1
id: shared-cart-lines
title: Shared Cart Lines Test Spec
type: test-spec
status: active
summary: Verifies shared storefront cart-line metadata behavior without coupling tests to source structure.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - storefront
systems:
  - cart-lines
source_paths:
  - app/assets/widgets/shared/engine/cart-lines.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - cart
  - storefront
keywords:
  - cart-line metadata
---

# Test Spec: Shared Cart Lines
**Spec ID:** shared-cart-lines  **Issue:** waived-widget-refactor  **Created:** 2026-06-11

## Purpose

Introduce shared cart-line metadata helpers before replacing FPB and PPB cart submission code.

## Test Cases

### SharedCartLines

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Source metadata | Selected lines, retail price, discount | `_bundle_display_properties` JSON | Matches current cart-line messaging source metadata. |
| 2 | Visible labels | Display metadata and label map | Cart line label properties | Supports FPB visible labels and future shared use. |
| 3 | Box metadata opt-out | Selected lines with `includeBox: false` | `_bundle_display_properties` has no `box` field | Prevents BXY/BQO-off storefronts from leaking Box labels into cart/checkout display metadata. |

## Acceptance Criteria

- [x] Source metadata helper exists.
- [x] Visible cart-line label helper exists.
- [x] Box display metadata can be explicitly omitted by callers.
