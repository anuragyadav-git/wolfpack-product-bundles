---
schema_version: 1
id: bundle-readiness-overlay
title: Bundle Readiness Overlay Test Spec
type: test-spec
status: active
summary: Behavioral coverage for the EB-aligned floating bundle readiness checklist.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/bundle-configure/BundleReadinessOverlay.tsx
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - readiness
  - parity
keywords:
  - collapsed-trigger
  - checklist
---

# Test Spec: Bundle Readiness Overlay
**Spec ID:** bundle-readiness-overlay  **Created:** 2026-07-30

## Purpose

Preserve the readiness checklist's functional contract while its appearance matches the live EB configure surface.

## Test Cases

### BundleReadinessOverlayTrigger
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial trigger | Readiness items are supplied | Score, title, and helper copy are present | Initial expanded context |
| 2 | Timed collapse | Five seconds elapse | Collapse callback runs once | Pure timer behavior |
| 3 | Alternate owner | `hideCollapsedTrigger=true`, `open=true` | Checklist content renders without a floating trigger | Supports controlled embedding |
| 4 | Open checklist | `open=true` | Checklist renders as an accessible modal dialog | Mobile presentation is verified in Chrome |
| 5 | Open score ownership | `open=true` | Dialog exposes the current score and the background trigger is hidden | Gauge remains in the active modal layer |

## Acceptance Criteria

- [x] All listed behavioral tests pass.
- [ ] Visual parity is verified in Chrome rather than through CSS assertions.
