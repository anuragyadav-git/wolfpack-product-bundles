---
schema_version: 1
id: polaris-wrapper-ownership
title: Polaris Wrapper Ownership Test Spec
type: test-spec
status: active
summary: Behavioral coverage for native Admin controls after removing presentation-only wrappers.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin-ui
systems:
  - onlybundles-app
source_paths:
  - apps/OnlyBundles-app/app/routes/app/app._index.tsx
  - apps/OnlyBundles-app/app/routes/app/app.dashboard/DashboardBundlesPanel.tsx
  - apps/OnlyBundles-app/app/routes/app/app.settings/SettingsControlsWorkspace.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.quantity.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - polaris
  - admin
keywords:
  - wrapper ownership
  - native controls
---

# Test Spec: Polaris Wrapper Ownership

**Spec ID:** polaris-wrapper-ownership  **Created:** 2026-09-10

## Purpose

Preserve merchant interactions while presentation-only HTML wrappers are removed
from native Polaris web components. Structural wrappers that frame media or group
a trigger with its overlay remain owned by their containing feature.

## Test Cases

### NativeControlBehavior

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | App-home support action | Merchant activates Contact Support | Support chat action runs once | Native button remains the interaction owner |
| 2 | Dashboard pagination | Merchant activates an enabled previous or next action | Current page changes by one within bounds | Native buttons retain labels and disabled states |
| 3 | Settings layout selection | Merchant chooses another controls layout | Route-owned layout callback receives the selected value | Native `s-select` owns its affordance |
| 4 | PPB setting toggle | Merchant changes a setting switch | Route state updates and the configure flow becomes dirty | Native `s-switch` remains the event source |
| 5 | Readiness and preview actions | Merchant activates either header action | Readiness opens its popover; Preview runs its handler | Both native buttons share the parent action layout |
| 6 | Step action help | Merchant hovers or focuses a step action | The native Polaris tooltip explains the action | No metadata-only HTML wrapper owns the button box |

## Acceptance Criteria

- [ ] Presentation-only wrappers do not own native control dimensions, decoration, or interaction.
- [ ] Legitimate media frames and trigger-plus-overlay groups remain intact.
- [ ] Existing behavior tests pass for every changed surface.
- [ ] Polaris validation succeeds for the changed native component compositions.
- [ ] Direct Chrome QA passes after a cache-bypassing hard reload.
