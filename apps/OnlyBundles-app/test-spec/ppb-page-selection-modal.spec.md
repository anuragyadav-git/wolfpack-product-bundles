---
schema_version: 1
id: ppb-page-selection-modal
title: PPB Page Selection Modal
type: test-spec
status: active
summary: Verifies that the PPB Place Widget template chooser dismisses its Polaris overlay and clears route-owned modal state.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbPageSelectionModal.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - ppb
  - modal
keywords:
  - place-widget
  - dismiss
---

# Test Spec: PPB Page Selection Modal

**Spec ID:** ppb-page-selection-modal  **Created:** 2026-08-30

## Purpose

Ensure the PPB Place Widget template chooser closes its visible Polaris overlay and synchronizes the route-owned modal state.

## Test Cases

### PpbPageSelectionModal

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Dismiss template chooser | Open modal and Cancel activation | Native command hides the overlay; hide lifecycle clears route state | Covers the Cancel action regression found in Chrome |
| 2 | Activate Cancel through the projected modal action | Open Polaris modal | Native `--hide` command targets the modal; hide lifecycle clears route state | Does not depend on a projected React click handler |
| 3 | Select a product template | Available template and selection callback | Imperative helper hides the modal and clears route state before the callback opens Theme Editor | Native commands suppress projected selection callbacks |

## Acceptance Criteria

- [x] The visible Polaris modal is hidden when Cancel is activated.
- [x] Route-owned page-selection state is cleared once per dismissal.
- [x] The focused unit test passes.
- [x] Chrome dev-tunnel QA confirms the modal remains closed.
