---
schema_version: 1
id: admin-full-width-clickable-actions
title: Admin Full Width Clickable Actions
type: test-spec
status: active
summary: Verifies that full-width Admin activation rows use Polaris clickable while compact commands remain Polaris buttons.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin-ui
systems:
  - polaris-app-home
source_paths:
  - app/routes/app/_shared/bundle-configure/CommonConfigureSidebar.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FpbAddonTierRules.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonTierEditor.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbFreeGiftAddonsSection.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - polaris
keywords:
  - s-clickable
  - full-width-action
---

# Test Spec: Admin Full Width Clickable Actions

**Spec ID:** admin-full-width-clickable-actions  **Created:** 2026-09-10

## Purpose

Keep row-sized Admin actions native and accessible without stretching a compact
`s-button` through custom CSS. The clickable itself must own activation.

## Test Cases

### FullWidthClickableActionOwnership

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Edit the bundle product | Existing Shopify product ID | The full-width `s-clickable` invokes the existing App Bridge product-editor owner once | Replace and Sync remain menu buttons |
| 2 | Add an FPB tier rule | Existing tier index | The full-width `s-clickable` passes the tier index to the existing rule owner once | Delete remains a compact button |
| 3 | Add an FPB add-on tier | Existing tier list | The full-width `s-clickable` appends one default tier and activates it | No CSS-stretched button |
| 4 | Add a PPB add-on tier | Active gifting step | The full-width `s-clickable` updates only that step and marks the route dirty | Same interaction contract as before |

## Acceptance Criteria

- [x] Full-row actions use native `s-clickable` with direct activation handlers.
- [x] Compact commands remain native `s-button` controls.
- [x] No custom full-width button face or clickable-wrapped button remains.
- [x] Focused tests, typecheck, modified-file ESLint, build, Knip, diff check, Graphify, and Agent-store Chrome QA pass.
