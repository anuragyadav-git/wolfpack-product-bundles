---
schema_version: 1
id: create-edit-guided-tour
title: Create Edit Guided Tour Test Spec
type: test-spec
status: active
summary: Verifies guided-tour transitions and bounded highlights on current FPB and PPB configure screens.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin-ui
systems:
  - bundle-configure
source_paths:
  - app/components/bundle-configure/BundleGuidedTour.tsx
  - app/components/bundle-configure/tourSteps.ts
  - app/components/bundle-configure/BundleReadinessOverlay.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsCss.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleStatusCard.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - guided-tour
  - polaris
keywords:
  - highlight target
  - step transition
---

# Test Spec: Create Edit Guided Tour
**Spec ID:** create-edit-guided-tour  **Issue:** [create-edit-guided-tour-rebuild-1]  **Created:** 2026-06-04

## Purpose
Verify the first-load guided tour works on the current edit/configure screens opened by the create flow, instead of depending on obsolete wizard screen anchors.

## Test Cases
### CreateEditGuidedTourContract
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB first-load create tour | PPB configure route with `mode=create&first_load=true` | Route passes `PPB_TOUR_STEPS`, `enabled={loaderData.showFirstLoadTour === true}`, and `onStepChange={handleGuidedTourStepChange}` | Section switching happens before anchor lookup |
| 2 | FPB first-load create tour | FPB configure route with `mode=create&first_load=true` | Route passes `FPB_TOUR_STEPS`, `enabled={loaderData.showFirstLoadTour === true}`, and `onStepChange={handleGuidedTourStepChange}` | Section switching happens before anchor lookup |
| 3 | Step metadata | `tourSteps.ts` | Every PPB/FPB step includes `sectionId` matching the edit screen section that mounts its `data-tour-target` | No legacy wizard dependency for create flow |
| 4 | Rebuilt tour measurement | `BundleGuidedTour.tsx` | Component calls `onStepChange(step, currentStep)` before resolving the target, retries target lookup, scrolls into view, waits for stable rect, and cleans highlighted styles | Prevents missing-target and jitter regressions |
| 5 | Readiness step | PPB/FPB route source | `handleGuidedTourStepChange` opens readiness only when `step.targetSection === "fpb-readiness-score"` | Readiness target exists outside active section panels |
| 6 | Stable step transition | Visible tour rerenders with a new `onStepChange` callback identity but the same active step | The replacement callback is not invoked until the active step changes | Prevents parent rerenders from creating a tour update loop |
| 7 | Readiness highlight | Step 2 on desktop | One visible target owns the readiness control's rendered box | The mobile header copies are not tour targets |
| 8 | Bundle-status highlight | Step 4 for PPB and FPB | Tour navigates to Bundle Settings and highlights only the status control | The containing settings panel is not highlighted |

## Acceptance Criteria
- [x] All listed contract tests pass
- [x] Focused ESLint passes on touched files
- [x] Guided tour component no longer depends on wizard-only target metadata for current create flow
- [x] Step-change callbacks run once per actual step transition
- [x] Desktop Steps 2 and 4 use visible, bounded highlight targets
