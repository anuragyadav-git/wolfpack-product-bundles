---
schema_version: 1
id: settings-design-contextual-preview-focus
title: Settings Design Contextual Preview Focus Test Spec
type: test-spec
status: active
summary: Verifies that the Settings Design storefront preview separates editable regions from transient states and clearly focuses the active region.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-design
  - design-preview
source_paths:
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/app/app.settings/design-preview-model.ts
  - app/routes/root/settings-design-preview-frame/route.tsx
related_docs:
  - test-spec/settings-design-production-renderer-preview.spec.md
tags:
  - tdd
  - contextual-preview
keywords:
  - edit-area
  - preview-state
---

# Test Spec: Settings Design Contextual Preview Focus
**Spec ID:** settings-design-contextual-preview-focus  **Created:** 2026-08-27

## Purpose

Keep one production-rendered storefront context while making the active editable region explicit and separating it from temporary preview states.

## Test Cases

### SettingsDesignContextualPreviewFocusSuite
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial context | Landing Page Standard | Product cards area, Default state | Desktop viewport remains selected |
| 2 | Area selection | Cart / summary | State returns to Default and the area becomes active | Inspector follows the area |
| 3 | State selection | Validation | Existing area is retained and Validation becomes active | Area restores after Default |
| 4 | Template transition | Selected area unsupported by next template | Falls back to that template's default area and Default state | No legacy fallback |
| 5 | Supported matrices | All eight templates | Only applicable edit areas and preview states are exposed | Loading is FPB-only; picker is slot-template-only |
| 6 | Shared field edit | Shared color field while Cart / summary is selected | Selected area remains Cart / summary | No jump to Product cards |
| 7 | Context filtering | Active area or state | Inspector exposes only controls owned by that context | State controls remain independently editable |
| 8 | Protocol validation | Version 2 area/state commands and events | Canonical messages pass; version 1 and mixed surface messages fail | Same-origin transport remains required |
| 9 | Region focus | Any supported edit area | Production region scrolls into view with a persistent outline and label | Chrome visual verification only |
| 10 | State lifecycle | Picker, Loading, Validation, Upsell | Real production state opens; dismissal/default restores the area focus | No cart, analytics, persistence, or navigation side effects |
| 11 | Renderer lifecycle | Change only the preview state | Existing production controller remains mounted | Prevents picker overlays from being lost during state transitions |

## Acceptance Criteria

- [x] Edit areas and preview states are separate concepts in the model, UI, and frame protocol.
- [x] Every selectable option has applicable Design controls for its template.
- [x] The active edit area is visibly identified without obscuring storefront context.
- [x] Shared field edits do not change the merchant's selected area.
- [x] Focus presentation is CSS-owned by an existing module and has no styling unit test.
- [x] Focused behavior tests, ESLint, build, Graphify, and refreshed desktop/mobile Chrome verification pass.
