---
schema_version: 1
id: admin-info-icon-interactions
title: Admin Info Icon Interactions
type: test-spec
status: active
summary: Verifies that Admin information icons remain hover and keyboard help affordances without activating on pointer clicks.
last_audited: 2026-08-14
owners:
  - Wolfpack Product Bundles
domains:
  - admin-ui
systems:
  - bundle-configure
source_paths:
  - app/lib/admin-info-icon-interaction.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/SmallComponents.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.ui.tsx
related_docs: []
tags:
  - polaris
  - tooltip
keywords:
  - s-icon info
  - pointer activation
---

# Test Spec: Admin Info Icon Interactions

**Spec ID:** admin-info-icon-interactions  **Created:** 2026-08-14

## Purpose

Keep informational Admin icons non-actionable when clicked while retaining their existing hover and keyboard-focus help behavior.

## Test Cases

### InfoIconPointerInteraction

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Pointer activation reaches an info icon | Event with `preventDefault` and `stopPropagation` | Default pointer activation is prevented and the event does not bubble | Tooltip hover/focus handlers remain separate |

## Acceptance Criteria

- [ ] Pointer clicks on configure-page info icons do not focus, activate, or bubble to nearby controls.
- [ ] Existing mouse-hover and keyboard-focus tooltip behavior remains available.
- [ ] Literal non-interactive information icons and explicit Learn More buttons remain unchanged.
- [ ] Focused unit tests and modified-file lint pass.
