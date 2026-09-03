---
schema_version: 1
id: settings-design-preview-scenario-persistence
title: Settings Design Preview Scenario Persistence
type: test-spec
status: active
summary: Verifies that transient storefront preview scenarios remain frame-owned without changing production widget behavior.
last_audited: 2026-08-27
owners:
  - storefront
domains:
  - settings-design
systems:
  - storefront-preview-frame
source_paths:
  - app/routes/app/app.settings/storefront-preview-interactions.ts
  - app/routes/app/app.settings/storefront-preview-fixtures.ts
  - app/routes/app/app.settings/design-preview-model.ts
  - app/routes/root/settings-design-preview-frame/route.tsx
  - app/lib/css-generators/css-variables-generator.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - preview
  - loading
  - upsell
keywords:
  - persistent loading preview
  - contextual upsell preview
---

# Test Spec: Settings Design Preview Scenario Persistence

**Spec ID:** settings-design-preview-scenario-persistence
**Created:** 2026-08-27

## Purpose

Keep the Settings Design preview responsible for transient scenario persistence while reusing the production storefront renderers.

## Test Cases

### SettingsDesignPreviewScenarioPersistenceSuite

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Loading is selected | Enable persistent loading on a preview controller | The production loading overlay is shown and controller dismissals are ignored | Preview-frame behavior only |
| 2 | Loading is deselected | Disable persistent loading on the same controller | The production hide method runs and later dismissals work normally | Restores ordinary controller behavior |
| 3 | Loading is selected repeatedly | Enable persistent loading more than once | The controller is guarded once and the active overlay remains visible | Avoid wrapper stacking |
| 4 | FPB Upsell is selected | Deterministic production-shaped block offer and product context | The shared product-page upsell renderer receives the fixture after the local purchase form | No preview-only offer markup |
| 5 | PPB template is selected | Product List, Product Grid, Horizontal Slots, or Vertical Slots | Upsell is not offered as a preview state | PPB has no equivalent external FPB offer renderer |
| 6 | Upsell colors are changed | Explicit action background, action text, and body text values | Production CSS emits all three upsell-owned variables | The preview and deployed renderer consume one token contract |

## Acceptance Criteria

- [x] Loading remains visible until the preview state changes.
- [x] Leaving Loading dismisses the overlay through the production method.
- [x] Repeated state application does not stack controller wrappers.
- [x] Upsell visual placement is verified in Chrome, not with a styling unit test.
- [x] The deterministic Upsell fixture uses the production FPB offer shape and renderer.
- [x] Upsell-specific Design values reach the generated storefront variables.
- [x] PPB templates do not advertise the FPB Upsell scenario.
