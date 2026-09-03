---
schema_version: 1
id: configure-save-bar-action
title: Configure Save Bar Action
type: test-spec
status: active
summary: Verifies programmatic configure Save Bar visibility and route-owned save actions in embedded Shopify Admin.
last_audited: 2026-08-30
owners:
  - Wolfpack Engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/ConfigureContextualSaveBar.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSaveForm.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - save-bar
  - app-bridge
keywords:
  - save
  - submit
  - lifecycle
---

# Test Spec: Configure Save Bar Action

**Spec ID:** configure-save-bar-action  **Created:** 2026-08-30

## Purpose

Ensure configure routes use Shopify's programmatic Save Bar API, invoke the route-owned save handler directly, and hide the Save Bar after the draft becomes clean.

## Test Cases

### ConfigureSaveBarAction

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Dirty configure draft | Render with `isDirty: true` and activate Save | Shopify Save Bar is shown and `handleSave` is called once | Reproduces the embedded Admin failure where no save request was sent |
| 2 | Saved configure draft | Render dirty, then rerender clean | Shopify Save Bar is hidden after previously being shown | Avoids initial-load and unmount hide races |

## Acceptance Criteria

- [x] A dirty draft shows the programmatic Shopify Save Bar.
- [x] Save calls the route-owned handler directly.
- [x] A previously shown Save Bar hides when the draft becomes clean.
