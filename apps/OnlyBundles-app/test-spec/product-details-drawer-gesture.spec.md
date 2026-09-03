---
schema_version: 1
id: product-details-drawer-gesture
title: Product Details Drawer Behavior Test Spec
type: test-spec
status: active
summary: Verifies scroll locking and intentional downward-swipe detection for the FPB product-details drawer.
last_audited: 2026-08-28
owners:
  - storefront
domains:
  - storefront
systems:
  - bundle-product-modal
source_paths:
  - app/assets/bundle-modal-component.ts
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
tags:
  - tdd
  - mobile-drawer
keywords:
  - product drawer
  - swipe dismissal
---

# Test Spec: Product Details Drawer Gesture

**Spec ID:** product-details-drawer-gesture  **Created:** 2026-08-13

## Purpose

Dismiss the FPB product-details drawer only for an intentional downward
gesture, without treating vertical scrolling or horizontal movement as a close.

## Test Cases

### Document Scroll Lock

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Open product details | Desktop document with a vertical scrollbar | Root reserves its scrollbar gutter while locked | Prevents horizontal viewport shift |
| 2 | Close product details | Previously unlocked document | Prior gutter value is restored | No global style leak |

### Downward Swipe Detection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Long downward drag | 110px vertical, 8px horizontal | dismiss | Deliberate drag |
| 2 | Short fast downward flick | 42px vertical at 0.7px/ms | dismiss | Natural mobile gesture |
| 3 | Short slow drag | 60px vertical at 0.2px/ms | remain open | Avoid accidental closure |
| 4 | Horizontal or upward gesture | horizontal-dominant or negative vertical | remain open | Preserve scrolling/navigation intent |

## Acceptance Criteria

- [x] Long and fast downward swipes dismiss the drawer.
- [x] Horizontal, upward, and slow short gestures do not dismiss it.
- [x] Product-details scroll locking preserves and restores the root scrollbar gutter.
