---
schema_version: 1
id: bundle-visibility-compact-cards
title: Bundle Visibility Compact Cards Test Spec
type: test-spec
status: active
summary: Defines shared behavior and semantic icon coverage for compact FPB and PPB Bundle Visibility cards.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin-ui
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/CommonBundleVisibilityOverview.tsx
  - app/routes/app/_shared/bundle-configure/CommonBundleVisibilityOverview.module.css
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - polaris
  - bundle-visibility
keywords:
  - App Embed Status
  - Your Bundle Link
  - placement options
---

# Test Spec: Bundle Visibility Compact Cards
**Spec ID:** bundle-visibility-compact-cards  **Created:** 2026-08-27

## Purpose
Prove the shared FPB and PPB Bundle Visibility overview preserves its actions and status states while restricting Polaris icons to CTA buttons.

## Test Cases
### CommonBundleVisibilityOverview
| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Inactive section | `active=false` | No visibility overview content | Preserves section routing behavior |
| 2 | Disabled app embed | Disabled status with Theme Editor action | Status badge and Enable App Embed CTA render | CTA uses the Theme Editor Polaris icon |
| 3 | Linked bundle | Valid bundle URL | Read-only link and Copy Link CTA render | CTA uses the duplicate Polaris icon |
| 4 | Additional placements | FPB or PPB placement actions | Every action label renders | CTAs use the directional Polaris icon |
| 5 | Decorative icon restriction | Active overview | No standalone `s-icon` elements render | Icons belong only to CTA buttons |

## Acceptance Criteria
- [x] All listed behavior tests pass
- [x] FPB and PPB use the same compact shared cards
- [x] Only CTA buttons display Polaris icons
- [x] Desktop and mobile browser QA pass
