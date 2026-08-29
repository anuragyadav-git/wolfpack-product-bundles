---
schema_version: 1
id: bundle-visibility-widget-and-embed-ui
title: Bundle Visibility Widget and Embed UI Test Spec
type: test-spec
status: implemented
summary: Verifies shared FPB and PPB Bundle Widget behavior and the EB-aligned PPB Bundle Embed Admin flow.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - bundle-admin
systems:
  - configure-flow
source_paths:
  - app/routes/app/_shared/bundle-configure/CommonBundleWidgetSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleEmbedSection.tsx
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - bundle-visibility
  - tdd
keywords:
  - bundle widget
  - bundle embed
---

# Test Spec: Bundle Visibility Widget and Embed UI

**Spec ID:** bundle-visibility-widget-and-embed-ui  **Created:** 2026-08-27

## Purpose

Ensure FPB and PPB render one shared Bundle Widget control surface while PPB
Bundle Embed follows the current live EB two-card interaction contract.

## Test Cases

### CommonBundleWidgetSection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shared widget surface | FPB or PPB adapter | The same widget controls, targeting, browsed-product option, and placement action render | One shared owner |
| 2 | Button mode | Offer Upsell Button | Only button copy is editable and the button preview is selected | Block copy stays preserved |
| 3 | Block mode | Offer Upsell Block | Image, title, description, and button copy are editable | Matches live EB controls |
| 4 | Disabled widget | Master switch off | Saved controls stay visible but dependent controls are inert | Placement is disabled with the widget |

### PpbBundleEmbedSection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Disabled embed | Master switch off | Saved copy and targeting remain visible and inert | Matches live EB first card |
| 2 | Placement while disabled | Master switch off | Place Block remains available | Placement anchor is independent of runtime enablement |
| 3 | Target transition | Change target mode | Product and collection targets both clear before the new mode is selected | Prevents incompatible persisted state |
| 4 | Localization | Published locales available | Multi Language opens for Title and Sub Title | Canonical upsellConfiguration translations |

## Acceptance Criteria

- [x] FPB and PPB consume one shared Bundle Widget component.
- [x] PPB Bundle Embed renders the live EB two-card control set.
- [x] Focused behavior tests pass.
- [x] Desktop and mobile Chrome verification pass for FPB and PPB.
