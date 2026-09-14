---
schema_version: 1
id: admin-full-width-clickable-actions
title: Admin Full Width Clickable Actions
type: test-spec
status: active
summary: Verifies that full-width Admin activation rows use Polaris clickable while compact commands remain Polaris buttons.
last_audited: 2026-09-15
owners:
  - engineering
domains:
  - admin-ui
systems:
  - polaris-app-home
source_paths:
  - app/routes/app/_shared/bundle-configure/CommonConfigureSidebar.tsx
  - app/routes/app/app.bundles.create/BundleTypeSelectionCard.tsx
  - app/routes/app/app.bundles.create/route.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FpbAddonTierRules.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonTierEditor.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbFreeGiftAddonsSection.tsx
  - app/routes/app/app.dashboard/DashboardTopCards.tsx
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
| 1 | Edit the bundle product | Existing Shopify product ID | The full-width `s-clickable` invokes the existing App Bridge product-editor owner once and contains no second interactive control | FPB and PPB share this owner; Replace and Sync remain menu buttons |
| 2 | Add an FPB tier rule | Existing tier index | The full-width `s-clickable` passes the tier index to the existing rule owner once | Delete remains a compact button |
| 3 | Add an FPB add-on tier | Existing tier list | The full-width `s-clickable` appends one default tier and activates it | No CSS-stretched button |
| 4 | Add a PPB add-on tier | Active gifting step | The full-width `s-clickable` updates only that step and marks the route dirty | Same interaction contract as before |
| 5 | Select a bundle builder type | Product-page or full-page bundle card | The card-wide `s-clickable` invokes the selection owner exactly once; unselected cards render no Select text, while selected cards render a native Polaris success badge | No select/selected action text column |
| 6 | Open support chat from either Dashboard support card | Chat with Parth or Talk to a support expert | Each full-width `s-clickable` invokes the existing direct-chat owner once | Neither action contains a nested button |

## Acceptance Criteria

- [x] Full-row actions use native `s-clickable` with direct activation handlers.
- [x] Compact commands remain native `s-button` controls.
- [x] No custom full-width button face or clickable-wrapped button remains.
- [x] Focused tests, typecheck, modified-file ESLint, build, Knip, diff check,
  Graphify, and desktop Agent-store Chrome QA pass.
- [x] Agent-store Chrome QA passes at an actual 390×844 window.
- [x] Both Dashboard support actions fill their available row and retain one
  accessible activation owner in desktop and minimum-width real-window
  Agent-store QA.

## Verification Notes

- Desktop Agent-store QA at 1280×800 passed for rendering and single action
  ownership.
- Direct Chrome DevTools QA at an actual 390×844 window passed after a
  cache-bypassing hard reload. The shared Edit Product action remains one focus
  target and the FPB media editor has no horizontal overflow.
- Dashboard support actions passed after a cache-bypassing reload at desktop
  width and Chrome's minimum actual 500×844 window. Chrome clamped the requested
  390-pixel window to 500 pixels, so no viewport emulation was used. Both actions
  filled their card rows, and Talk to a support expert opened the Crisp dialog.
