---
schema_version: 1
id: settings-design-collapsible-sidebar
title: Settings Design Collapsible Sidebar Test Spec
type: test-spec
status: active
summary: Verifies Design preview sizing, panel-top alignment, and contextual Shopify error feedback.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
systems:
  - settings-design
source_paths:
  - app/routes/app/app.settings/design-preview-model.ts
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/app/app.settings/DesignSettingsView.module.css
  - app/routes/app/app.settings/SettingsDesignFields.tsx
  - app/routes/app/app.settings/settings-feedback.ts
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - responsive-layout
keywords:
  - inspector-collapse
  - desktop-preview-fit
  - contextual-error-banner
---

# Test Spec: Settings Design Collapsible Sidebar
**Spec ID:** settings-design-collapsible-sidebar  **Created:** 2026-08-27

## Purpose

Allow the Mac-style desktop preview to scale into width released by the collapsed customization sidebar without changing either storefront viewport contract or the mobile device-preview contract.
Keep the customization sidebar aligned with the complete Live preview container and surface Design failures through contextual, dismissible Polaris banners.

## Test Cases

### DesignPreviewFit

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Desktop display canvas | Desktop viewport | Canvas is 1320×920 around a 1280×800 scrollable screen containing the unchanged 1280×1136 storefront preview | Reserves space for a proportional decorative monitor frame |
| 2 | Wide desktop host | 1650×1150 available pixels, desktop viewport | Scale is 1.25 | Uses released inspector width |
| 3 | Mobile host wider than device | 856×882 available pixels, mobile viewport | Scale remains 1 | Preserves device fidelity |
| 4 | Constrained desktop host | 960×640 available pixels, desktop viewport | Scale fits the framed canvas's limiting height | Existing shrink behavior |

### DesignErrorFeedback

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Preview runtime failure | Non-empty renderer error message | Critical banner persists beside the preview | Merchant can dismiss or retry |
| 2 | Storefront-preview launch failure | Localized preview error message | Transient Shopify error toast | A fresh attempt starts cleanly |
| 3 | Empty failure message | Whitespace-only message | No alert is shown | No fabricated fallback copy |

## Acceptance Criteria

- [x] The wide-desktop test fails before implementation.
- [x] Desktop fit can exceed 1× only when both available dimensions permit it.
- [x] Desktop frame leaves the storefront iframe at exactly 1280×1136.
- [x] Mobile preview remains capped at 1×.
- [x] No test asserts CSS, class names, selectors, or visual placement.
- [x] Customization and Live preview container tops align in direct Chrome verification.
- [x] Persistent renderer errors use contextual banners; transient preview-launch failures use error toasts.
- [x] Collapsed desktop preview centers the monitor in the released inline space.
