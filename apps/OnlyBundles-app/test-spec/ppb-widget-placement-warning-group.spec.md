---
schema_version: 1
id: ppb-widget-placement-warning-group
title: PPB Widget Placement Warning Group
type: test-spec
status: active
summary: Verify that PPB widget-placement feedback uses the shared warning banner and modal instead of a separate critical banner.
last_audited: 2026-09-04
owners:
  - engineering
domains:
  - admin
systems:
  - ppb-configure
source_paths:
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ppb-warning-presentation.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbMainSections.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - warning
  - preview
keywords:
  - widget placement
  - warning group
---

# Test Spec: PPB Widget Placement Warning Group

**Spec ID:** ppb-widget-placement-warning-group **Created:** 2026-09-04

## Purpose

Prevent the PPB preview placement warning from creating a second Admin banner. A lone placement warning uses the shared warning banner; simultaneous publish warnings use the shared summary banner and Manage modal.

## Test Cases

### PPBWarningPresentation

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Placement is the only warning | Widget-placement operation alert | One warning banner | Never critical |
| 2 | Placement and publish warnings coexist | Widget placement, app embed, and unlisted product | One summary banner; all warnings are listed in the modal | Uses shared warning group |
| 3 | A non-placement operation fails | Preview error operation alert | Keep the critical operation-alert path | Do not downgrade errors |

## Acceptance Criteria

- [x] Widget placement never renders through `AdminTaskAlertBanner`.
- [x] Multiple warnings render one `Some items need your attention` warning banner with a Manage action.
- [x] The modal contains widget placement alongside the other active warnings.
- [x] Non-placement operation errors keep their existing critical presentation.
- [x] All listed test cases pass.
