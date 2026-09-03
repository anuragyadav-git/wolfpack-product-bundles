---
schema_version: 1
id: settings-design-actions-preview
title: Settings Design Actions and Preview Test Spec
type: test-spec
status: active
summary: Verifies connected local Design preview actions and prepared FPB and PPB storefront preview behavior.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-design
  - bundle-preview
source_paths:
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/app/app.settings/SettingsDesignFields.tsx
  - app/routes/app/app.settings.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - design-preview
keywords:
  - local-interactions
  - prepare-preview
  - polaris-modal
---

# Test Spec: Settings Design Actions and Preview
**Spec ID:** settings-design-actions-preview  **Created:** 2026-08-27

## Purpose

Ensure every enabled Settings -> Design preview action changes deterministic local state, while storefront Preview Bundle actions use saved settings and the existing prepared FPB or PPB preview contract.

## Test Cases

### SettingsDesignActionsPreviewSuite

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Selection changes | Add, remove, or set product quantity | Shared selection count and total update | No network or cart mutation |
| 2 | Category changes | Select another fixture category | Active category changes | Local state only |
| 3 | Slot and picker actions | Remove filled slot, open picker, add product, close picker | Quantity and requested surface update | FPB and PPB fixtures remain deterministic |
| 4 | Summary actions | Back, Continue, mobile toggle | Progress and expanded state update within bounds | Final Continue triggers completion feedback |
| 5 | Discount feedback | Tier and completion events | Visible feedback state replays and clears safely | Existing timers retained |
| 6 | Field focus | Repeated edits and manual surface changes | Each edit routes once; manual selection remains | Request IDs prevent sticky routing |
| 7 | Narrow host fit | Desktop canvas inside a 390px host | Scale is below 0.5 and canvas fits | Logical viewport remains 1280px |
| 8 | Alpha color | Polaris emits `#11223380` | Value remains `#11223380` | Six-digit values remain valid |
| 9 | Eligible bundles | Active or unlisted FPB/PPB with identifiers | Loader exposes machine type and preview URL | Draft, archived, and malformed bundles excluded |
| 10 | Prepared preview | View eligible FPB or PPB | Reserved tab navigates to signed FPB or tokenized PPB URL | Failure closes reserved tab |
| 11 | Unsaved settings | Design state is dirty or saving | Preview Bundle action is disabled with guidance | Storefront preview uses saved data only |
| 12 | Polaris modal | Open and dismiss bundle list | Polaris modal lifecycle controls focus and dismissal | Browser verified, no CSS assertions |

## Acceptance Criteria

- [x] All enabled local preview controls produce an observable in-memory result.
- [x] Summary rows, count, and total derive from current quantities.
- [x] Local preview actions do not call storefront, cart, or checkout APIs.
- [x] Preview Bundle is unavailable until Design settings are saved.
- [x] FPB and PPB preview actions prepare and open the correct storefront URL.
- [x] The Preview Bundle overlay uses Polaris modal and table components.
- [x] Focused tests, lint, typecheck/build, and direct agent-store hard-reload QA pass.
