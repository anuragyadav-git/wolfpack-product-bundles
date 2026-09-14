---
schema_version: 1
id: bundle-readiness-overlay-trigger
title: Bundle Readiness Overlay Trigger
type: test-spec
status: active
summary: Verifies the readiness trigger lifecycle and ensures only a deliberate checklist click activates an item action.
last_audited: 2026-09-11
owners:
  - wolfpack
domains:
  - bundle-configuration
systems:
  - admin-ui
source_paths:
  - app/components/bundle-configure/BundleReadinessOverlay.tsx
  - tests/unit/components/bundle-readiness-overlay-trigger.test.ts
related_docs: []
tags:
  - readiness
  - overlay
  - animation
keywords:
  - Readiness Score
  - delayed collapse
  - initial paint
---

# Test Spec: Bundle Readiness Overlay Trigger

**Spec ID:** bundle-readiness-overlay-trigger
**Created:** 2026-07-26

## Purpose

Confirm that the shared readiness overlay initially exposes its complete score context, schedules its minimal state after five seconds, and never treats native popover dismissal as checklist activation.

## Test Cases

### BundleReadinessOverlay

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial DOM paint | Collapsed readiness overlay | Score, title, and description are present | Uses server rendering so effects cannot precede the first paint |
| 2 | Delayed collapse | Collapse callback | Callback is not called before 5,000 ms and is called at 5,000 ms | Uses fake timers |
| 3 | Deliberate checklist activation | Click an incomplete readiness item | Popover state closes before the matching item callback runs | Item behavior is owned by its click, not by the popover command lifecycle |
| 4 | Native light dismissal | Popover emits `hide` after an outside click | Open state closes and no readiness item action runs | Prevents click-away from opening an unrelated Shopify intent modal |

## Acceptance Criteria

- [x] Initial markup includes the score, full title, and description.
- [x] Minimal-state collapse is scheduled for exactly five seconds after mount.
- [x] Only a click on an incomplete checklist item invokes its action.
- [x] Native popover light dismissal never invokes a checklist action.
