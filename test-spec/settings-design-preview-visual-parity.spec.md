---
schema_version: 1
id: settings-design-preview-visual-parity
title: Settings Design Preview Visual Parity Test Spec
type: test-spec
status: active
summary: Verifies two-axis preview fitting and template-specific storefront context for Settings Design surfaces.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-design
  - design-preview
source_paths:
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/app/app.settings/design-preview-model.ts
  - app/routes/app/app.settings/DesignSettingsView.module.css
  - app/routes/app/app.settings/preview-surfaces/PreviewSurfaces.module.css
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - visual-parity
keywords:
  - canvas-centering
  - storefront-context
---

# Test Spec: Settings Design Preview Visual Parity
**Spec ID:** settings-design-preview-visual-parity  **Created:** 2026-08-27

## Purpose

Keep the deterministic Settings Design preview centered inside its Admin canvas and present each selected surface inside the correct FPB or PPB storefront context without importing storefront runtime behavior.

## Test Cases

### SettingsDesignPreviewVisualParitySuite

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Two-axis desktop fit | 960 x 640 host, desktop viewport | Smaller width/height ratio is used | Logical viewport remains 1280 x 1136 |
| 2 | Two-axis mobile fit | 390 x 640 host, mobile viewport | Canvas scales below 1 and fits vertically | No minimum scale floor |
| 3 | Invalid host dimensions | Non-positive or non-finite dimensions | Valid ratios are used; otherwise scale is 1 | Pure helper behavior |
| 4 | FPB context | Any FPB template and surface | Full-page storefront context is selected | Context is noninteractive |
| 5 | PPB in-page context | Product List or Product Grid | PDP in-page context is selected | Existing descriptor remains canonical |
| 6 | PPB slot context | Horizontal or Vertical Slots | PDP modal-slot context is selected | Picker and footer anchor to this frame |
| 7 | Surface matrix | 64 template/surface pairs in two viewports | 128 deterministic scenes render | No network or widget runtime |
| 8 | Accessibility boundary | Context frame around selected surface | Context decoration is hidden from the accessibility tree | Selected surface actions remain available |

## Acceptance Criteria

- [x] The scaled canvas fits and centers within both stage axes.
- [x] All eight templates use the correct storefront context family.
- [x] All supported surfaces render in desktop and mobile logical viewports.
- [x] Context decoration is noninteractive and accessibility-hidden.
- [x] No storefront CSS, widget controller, bundle fetch, or cart behavior is imported.
- [x] Focused tests, lint, typecheck/build, direct Chrome QA, and Graphify pass.
