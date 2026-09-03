---
schema_version: 1
id: settings-design-preview-visual-parity
title: Settings Design Preview Visual Parity Test Spec
type: test-spec
status: superseded
summary: Records the retired handcrafted Settings Design preview contract superseded by the isolated production-renderer frame.
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
  - app/routes/root/settings-design-preview-frame/route.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - test-spec/settings-design-production-renderer-preview.spec.md
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

Historical contract for the handcrafted deterministic preview. The centering helper remains valid, but the live preview now imports production controllers and storefront CSS inside an isolated frame; the replacement acceptance contract is `settings-design-production-renderer-preview`.

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
- [x] Superseded by the production-renderer preview contract; no handcrafted surface remains on the live path.
- [x] Focused tests, lint, typecheck/build, direct Chrome QA, and Graphify pass.
