---
schema_version: 1
id: admin-configure-disabled-feature-surfaces
title: Admin Configure Disabled Feature Surfaces
type: test-spec
status: implemented
summary: Behavioral coverage for visible, value-preserving, inert feature configuration across FPB and PPB configure pages.
last_audited: 2026-08-21
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/DisabledConfigurationRegion.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
keywords:
  - disabled-configuration
---

# Test Spec: Admin Configure Disabled Feature Surfaces

**Spec ID:** admin-configure-disabled-feature-surfaces **Created:** 2026-08-21

## Purpose

Ensure every feature-gated FPB and PPB configuration keeps its saved settings
visible while disabled, prevents dependent interaction, and restores the same
settings when re-enabled.

## Test Cases

### DisabledConfigurationRegion

| #   | Scenario         | Input           | Expected Output                                | Notes                         |
| --- | ---------------- | --------------- | ---------------------------------------------- | ----------------------------- |
| 1   | Feature enabled  | `enabled=true`  | Region is interactive and not marked disabled  | Parent switch remains outside |
| 2   | Feature disabled | `enabled=false` | Region is inert and exposes disabled semantics | Settings remain rendered      |

### FilePickerDisabledState

| #   | Scenario                  | Input                              | Expected Output                                                       | Notes                 |
| --- | ------------------------- | ---------------------------------- | --------------------------------------------------------------------- | --------------------- |
| 1   | Empty disabled picker     | `disabled=true`                    | Trigger is unfocusable and click/keyboard/upload callbacks do not run | No modal opens        |
| 2   | Populated disabled picker | Existing image and `disabled=true` | Change and remove actions are disabled                                | Value remains visible |
| 3   | Re-enabled picker         | Same value and `disabled=false`    | Normal callbacks run                                                  | No value reset        |

### ConfigureFeatureGates

| #   | Scenario                         | Input                                        | Expected Output                                           | Notes                       |
| --- | -------------------------------- | -------------------------------------------- | --------------------------------------------------------- | --------------------------- |
| 1   | Pre Selected Product disabled    | Saved title and products                     | Values render; fields and picker actions are disabled     | FPB and PPB                 |
| 2   | Pricing master disabled          | Saved rules and nested options               | Editors remain rendered and inert                         | Rules are preserved         |
| 3   | Nested pricing feature disabled  | Pricing enabled; child feature disabled      | Child settings remain visible and inert                   | Child switch stays usable   |
| 4   | Widget or Embed disabled         | Saved copy, media, targeting, and resources  | All dependent controls and placement actions are disabled | PPB rebuilt surfaces        |
| 5   | Subscription disabled            | Saved group and configuration                | Existing values render but cannot be changed              | Shared FPB/PPB surface      |
| 6   | Add-on or media feature disabled | Saved labels, tiers, messages, or badge text | Existing values remain visible and inert                  | Disable does not clear data |
| 7   | Re-enable feature                | Previously disabled saved configuration      | Controls become interactive with unchanged values         | SaveBar semantics retained  |
| 8   | Mode-specific target branch      | Inactive target mode                         | Branch remains unrendered                                 | Not a feature gate          |

### VisibilityAndPersistenceRegression

| #   | Scenario                  | Input                               | Expected Output                                                | Notes                |
| --- | ------------------------- | ----------------------------------- | -------------------------------------------------------------- | -------------------- |
| 1   | Shared Visibility actions | FPB and PPB adapters                | Embed status, guides, copy, and setup callbacks remain correct | Polaris rebuild      |
| 2   | PPB Widget/Embed save     | Existing direct configuration       | Serialized payload is unchanged                                | No API/schema change |
| 3   | Disable then save/reload  | Feature with saved dependent values | Enable flag is false and dependent values survive              | No destructive reset |

## Acceptance Criteria

- [x] Disabled feature settings remain visible and preserve their values
- [x] No dependent control can be activated while its feature is disabled
- [x] Re-enabling restores interaction without changing saved configuration
- [x] FPB and PPB configure payload contracts remain unchanged
- [x] Focused tests, modified-file typecheck, ESLint, Graphify, and direct Chrome checks pass

## Verification Notes

The repository-wide TypeScript command remains blocked by the existing project
baseline. Filtering that command to every modified module reports no errors,
and the production Remix/Vite build completes successfully.
