---
schema_version: 1
id: bundle-readiness-score-state
title: Bundle Readiness Score State
type: test-spec
status: active
summary: Verifies shared readiness score colors and overlay state behavior across Admin bundle flows.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin-ui
systems:
  - bundle-configure
source_paths:
  - app/components/bundle-configure/BundleReadinessOverlay.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureCanvasHeader.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader.tsx
  - tests/unit/components/bundle-readiness-overlay-trigger.test.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - readiness
  - score
keywords:
  - readiness button
  - gauge color
---

# Test Spec: Bundle Readiness Score State
**Spec ID:** bundle-readiness-score-state  **Issue:** [eb-configure-completion-parity-1]  **Created:** 2026-06-01

## Purpose
Lock EB parity for readiness score state transitions across low, medium, high, compact create-wizard, and detailed configure overlays.

## Test Cases
### BundleReadinessScoreStateContract
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Score color states | Shared score-color source | Scores below 80 are orange; scores from 80 are green | Gauge and readiness button consume the same color |
| 2 | Footer text states | `readinessStatusText` source | Low, near-complete, and complete states have separate copy | EB near-complete copy stays locked |
| 3 | Overlay variants | Create + FPB/PPB configure route sources | Create route passes compact variant; configure routes do not | Keeps create minified and edit/configure detailed |

## Acceptance Criteria
- [x] Focused readiness state contract passes.
- [x] Existing readiness overlay contracts still pass.
- [x] Scoped lint passes with 0 errors.
- [x] Chrome SIT smoke confirms configure overlay still opens as detailed readiness panel.
- [x] FPB and PPB readiness buttons use the same color source as the gauge.
