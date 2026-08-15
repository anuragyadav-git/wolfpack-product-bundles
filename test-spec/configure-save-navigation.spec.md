---
schema_version: 1
id: configure-save-navigation-test-spec
title: "Test Spec: Configure Save Navigation"
type: test-spec
status: active
summary: Verifies that saving a bundle preserves the merchant's current configure step and section.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - bundle-configuration
systems:
  - fpb-configure
  - ppb-configure
source_paths:
  - app/hooks/useBundleConfigurationState.ts
  - app/store/slices/configureRouteStateSlice.ts
related_docs: []
tags:
  - testing
  - navigation
keywords:
  - active step
  - save revalidation
---

# Test Spec: Configure Save Navigation
**Spec ID:** configure-save-navigation  **Created:** 2026-08-13

## Purpose
Ensure normal save revalidation updates loader-backed data without resetting the active configure navigation.

## Test Cases
### ConfigureSaveNavigation
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Save while editing Step 2 | Same bundle revalidates | Step 2 remains active | Applies to FPB and PPB shared state |
| 2 | Save from a non-default section | Same bundle revalidates | Current section remains active | Hydration must not own navigation |
| 3 | Open another bundle | Bundle identity changes | Navigation resets to Step 1 and Step Setup | Explicit route-session reset |

## Acceptance Criteria
- [x] Same-bundle loader hydration preserves active step and section
- [x] A different bundle explicitly resets configure navigation
- [x] Chrome DevTools save verification remains on Step 2
