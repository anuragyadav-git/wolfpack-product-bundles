---
schema_version: 1
id: admin-select-template-hydration-fix
title: Admin Select Template and Hydration Fix Test Spec
type: test-spec
status: active
summary: Verifies max-size projected template dialogs follow app state and the Admin document hydrates without a mutable font resource.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
  - remix-root
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureTemplateDialog.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectTemplateDialog.tsx
  - app/root.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - regression
keywords:
  - select template
  - projected modal
  - hydration
---

# Test Spec: Admin Select Template and Hydration Fix

**Spec ID:** admin-select-template-hydration-fix  **Created:** 2026-08-24

## Purpose

Restore FPB and PPB Select Template dialogs after the Shopify-native cleanup and remove the mutable font-link state that causes document-level hydration recovery.

## Test Cases

### Projected Template Dialogs

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | PPB template dialog is open | App-owned modal state is true | Customization workflow is rendered in the projected dialog | App-owned state flow |
| 2 | PPB template dialog is closed | App-owned modal state is false | Customization workflow is not exposed | App-owned state flow |
| 3 | FPB template dialog is open | App-owned modal state is true | Customization workflow is rendered in the projected dialog | Symmetric FPB contract |
| 4 | FPB template dialog is closed | App-owned modal state is false | Customization workflow is not exposed | Symmetric FPB contract |
| 5 | Projected host modal | Either workflow is open | App Bridge owns the rendered modal and React portals its interactive content | Enables the supported `max` variant and bridged action events |

### Admin Document Hydration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Root document renders its font resource | Server-rendered Admin document | Font stylesheet has no load-time media mutation | Prevents pre-hydration DOM drift |

## Acceptance Criteria

- [x] FPB and PPB Select Template actions render through the App Bridge host modal.
- [x] Native dismiss resets app-owned template workflow state.
- [x] Admin navigation no longer emits the root font-link hydration mismatch.
- [x] Focused tests, typecheck, ESLint, and direct Chrome QA pass.
