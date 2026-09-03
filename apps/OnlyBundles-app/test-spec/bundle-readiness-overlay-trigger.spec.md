---
schema_version: 1
id: bundle-readiness-overlay-trigger
title: Bundle Readiness Overlay Trigger
type: test-spec
status: active
summary: Verifies that the shared readiness trigger paints its full context before collapsing after five seconds.
last_audited: 2026-07-26
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

Confirm that the shared readiness overlay initially exposes its complete score context and schedules its minimal state after five seconds.

## Test Cases

### BundleReadinessOverlay

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial DOM paint | Collapsed readiness overlay | Score, title, and description are present | Uses server rendering so effects cannot precede the first paint |
| 2 | Delayed collapse | Collapse callback | Callback is not called before 5,000 ms and is called at 5,000 ms | Uses fake timers |

## Acceptance Criteria

- [ ] Initial markup includes the score, full title, and description.
- [ ] Minimal-state collapse is scheduled for exactly five seconds after mount.
