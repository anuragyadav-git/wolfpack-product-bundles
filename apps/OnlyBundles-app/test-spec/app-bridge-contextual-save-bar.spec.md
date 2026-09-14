---
schema_version: 1
id: app-bridge-contextual-save-bar
title: App Bridge Contextual Save Bar Test Spec
type: test-spec
status: active
summary: Verifies native unsaved-change protection and saving feedback across both configure flows and all three Settings editors.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - admin
systems:
  - app-bridge
  - bundle-configure
  - settings
source_paths:
  - apps/OnlyBundles-app/app/lib/admin-unsaved-navigation.ts
  - apps/OnlyBundles-app/tests/test-runner.ts
  - apps/OnlyBundles-app/app/routes/app/_shared/bundle-configure/ConfigureContextualSaveBar.tsx
  - apps/OnlyBundles-app/app/routes/app/app.settings/SettingsFeedback.tsx
  - apps/OnlyBundles-app/app/routes/app/app.settings/SettingsRoute.tsx
related_docs:
  - internal docs/EB Settings Design Reference.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - regression
keywords:
  - contextual save bar
  - leave confirmation
  - unsaved changes
---

# Test Spec: App Bridge Contextual Save Bar

**Spec ID:** app-bridge-contextual-save-bar  **Created:** 2026-09-10

## Purpose

Keep unsaved data protected by Shopify's App Bridge Save Bar throughout FPB,
PPB, Design, Language, and Controls, while preserving native saving feedback.

## Test Cases

### Save bar lifecycle and actions

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Save begins in either configure flow | `isSaving=true` | Save uses the native loading state and both actions are unavailable | App Bridge programmatic save bar |
| 2 | Save begins in Design, Language, or Controls | Matching submission is in flight | The mounted Settings save bar remains visible and Save shows native loading | Do not clear dirty state optimistically |
| 3 | Save succeeds | Confirmed server snapshot | Dirty state clears and App Bridge hides the save bar | Applies to all five flows |
| 4 | Save fails | Failed server response | Draft remains dirty and save bar stays available | Merchant can retry or discard |
| 5 | An editor unmounts while its save bar is visible | Route transition or error boundary | App Bridge hides that save bar | Prevent a stale or frozen bar from leaking into the next surface |

### Unsaved navigation protection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Merchant uses programmatic navigation while dirty | Visible save bar | Await `leaveConfirmation()` before navigating | Shopify-native protection |
| 2 | Merchant stays on the page | Leave confirmation rejects | Navigation does not run and no unhandled rejection escapes | Preserve the draft |
| 3 | Merchant opens the Product intent while dirty | FPB or PPB dirty state | Intent is not invoked and save bar feedback is requested | Prevent the intent overlay from hiding the save bar |
| 4 | Merchant opens the Product intent while clean | FPB or PPB clean state | Intent opens normally | Preserve current editor behavior |

## Acceptance Criteria

- [x] Both configure flows expose native Save loading feedback.
- [x] Design, Language, and Controls keep the save bar mounted during requests.
- [x] All programmatic page navigation awaits App Bridge leave confirmation.
- [x] Product intents cannot open over an unsaved configure draft.
- [x] Focused tests, typecheck, ESLint, Graphify, and direct Chrome QA pass.
