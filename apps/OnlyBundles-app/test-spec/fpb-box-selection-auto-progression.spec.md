---
schema_version: 1
id: fpb-box-selection-auto-progression
title: FPB Bundle Quantity Option Auto Progression
type: test-spec
status: active
summary: Verifies bundle quantity options advance to the next rule and stay synchronized across shared desktop and mobile summaries.
last_audited: 2026-08-13
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page/methods/box-selection-sidebar-methods.ts
  - app/assets/widgets/full-page/methods/side-panel-methods.ts
  - app/assets/widgets/full-page/methods/mobile-summary-methods.ts
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
  - internal docs/EB Implementation Reference.md
tags:
  - fpb
  - bundle-quantity-options
keywords:
  - auto progression
  - summary sidebar
  - mobile footer
---

# Test Spec: FPB Bundle Quantity Option Auto Progression

**Spec ID:** fpb-box-selection-auto-progression  **Created:** 2026-08-13

## Purpose

Verify that exceeding the active Bundle Quantity Option advances to the next
configured rule without discarding shopper selections, and that the shared
desktop sidebar and mobile footer resolve the same active rule immediately.

## Test Cases

### ActiveRuleProgression

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Current rule still fits | Active quantity `2`, selected quantity `2` | Rule `2` remains active | Advance only after exceeding the rule |
| 2 | Advance one rule | Active quantity `2`, selected quantity `3` | Rule `4` becomes active | No shopper selection is removed |
| 3 | Advance across multiple rules | Active quantity `2`, selected quantity `5`, rules `2`, `4`, `6` | Rule `6` becomes active | Handles quantity jumps |
| 4 | Highest rule exceeded | Active quantity `6`, selected quantity `7` | Rule `6` remains active | No nonexistent fallback rule |
| 5 | Explicit opt-out | `autoProceedToNextRule: false` | Manually selected rule remains active | Current configuration is authoritative |

### SharedSummarySynchronization

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Desktop sidebar refresh | Selected quantity changes from `2` to `3` | Shared renderer receives `3` and resolves the next rule | All FPB presets use this path |
| 2 | Mobile footer refresh | Selected quantity changes from `2` to `3` | Shared renderer receives `3` and resolves the same next rule | Expanded mobile summary uses this path |
| 3 | Validation after progression | Quantity validation enabled at selected quantity `3` | Target is the newly active quantity `4` | Checkout cannot validate against the stale rule |

## Acceptance Criteria

- [x] Focused behavior tests pass.
- [x] Desktop and mobile summaries use the same progressed rule.
- [x] Widget bundles rebuild successfully.
- [x] Storefront desktop and mobile behavior is verified after a cache-bypassed refresh.
