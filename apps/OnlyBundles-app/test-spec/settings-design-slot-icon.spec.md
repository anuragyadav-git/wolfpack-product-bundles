---
schema_version: 1
id: settings-design-slot-icon
title: "Test Spec: Settings Design Slot Icon and Presentation"
type: test-spec
status: active
summary: Verifies shared FPB and PPB product-slot icon configuration, persistence, preview behavior, and storefront output.
last_audited: 2026-08-23
owners:
  - engineering
domains:
  - settings
systems:
  - design-control-panel
source_paths:
  - app/lib/settings-design-runtime.ts
  - app/routes/app/app.settings/design-preview-model.ts
  - app/lib/css-generators/css-variables-generator.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
keywords:
  - slot-icon
  - centered-badge
---

# Test Spec: Settings Design Slot Icon and Presentation
**Spec ID:** settings-design-slot-icon  **Created:** 2026-08-22

## Purpose
Expose one Slot Icon upload and presentation selector (`centered badge`, `cover`, `fit`) in Admin Settings -> Design for FPB and PPB product slots across all eight templates, and wire it to persistence, local preview, CSS generation, and storefront empty slots.

## Test Cases
### SettingsDesignSlotIconSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Extract slot icon configuration | URL plus each presentation option | JSON runtime carries `badge`, `cover`, or `fit` without nonexistent Prisma fields | Save contract |
| 2 | Default presentation | Missing or invalid presentation | Defaults to `badge` | Plus-icon replacement is the default role |
| 3 | Expose the Admin fields | Images and GIFs section | Upload plus `["Centered badge", "Cover", "Fit"]` dropdown | Polaris controls |
| 4 | Show mode-specific guidance | Centered badge or Fit | Badge recommends 96 x 96 transparent artwork; Fit recommends 800 x 800 square artwork | Cover relies on slot dimensions |
| 5 | Support every template preview | All four FPB and all four PPB templates | Product slots surface and both controls are available | Shared setting |
| 6 | Build live preview theme | URL plus each mode | Preview URL and normalized presentation are emitted | Local preview sync |
| 7 | Generate storefront CSS variables | URL plus each mode | Separate badge and slot-level image variables are emitted | Placement behavior |
| 8 | Save Design settings | Valid payload with URL and mode | Both Design rows persist the values inside JSON and do not write unknown direct columns | Regression for save crash |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Admin Settings -> Design renders the upload, three-option dropdown, and appropriate recommendation
- [ ] All FPB and PPB templates expose Product slots in the local preview
- [ ] Storefront FPB and PPB empty slots render the chosen presentation
- [ ] Saving does not write `slotIconUrl` or `slotIconFit` as direct Prisma columns
