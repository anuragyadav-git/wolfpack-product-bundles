---
schema_version: 1
id: ppb-storefront-modal-close-controls
title: PPB Storefront Modal Close Controls Test Spec
type: test-spec
status: active
summary: Verifies that every responsive PPB picker close control invokes the shared modal lifecycle.
last_audited: 2026-09-14
owners:
  - engineering
domains:
  - storefront
systems:
  - ppb-widget
source_paths:
  - apps/OnlyBundles-app/app/assets/widgets/product-page/methods/widget-misc-methods.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page-css/base/footer-selection-loading.css
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - ppb
  - modal
keywords:
  - close control
  - hit target
---

# Test Spec: PPB Storefront Modal Close Controls
**Spec ID:** ppb-storefront-modal-close-controls  **Created:** 2026-07-13

## Purpose
Ensure every rendered PPB storefront picker close control closes the modal.

## Test Cases
### ProductPageWidgetMiscMethods
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Attach modal close handlers | Desktop and mobile close buttons are rendered | Clicking either button calls `closeModal` | Covers responsive controls without asserting styling or placement |
| 2 | Close the desktop picker | Open picker at a supported desktop viewport and activate X | The picker closes and focus returns to its opener | Verify with direct Chrome; do not assert CSS in Jest |
| 3 | Close the mobile picker | Open picker at a supported mobile viewport and activate its close control | The picker closes and focus returns to its opener | Verify with direct Chrome; do not assert CSS in Jest |

## Acceptance Criteria
- [x] Both modal close controls invoke the shared close behavior in focused unit coverage.
- [x] Focused unit tests pass after the storefront rebuild.
- [x] Direct Chrome DevTools verification confirms the desktop X is the topmost hit target and closes the live picker.
- [x] Direct Chrome DevTools verification confirms the mobile control closes the live picker.
