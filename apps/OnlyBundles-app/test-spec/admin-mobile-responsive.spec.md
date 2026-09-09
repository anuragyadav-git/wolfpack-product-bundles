---
schema_version: 1
id: admin-mobile-responsive
title: Admin Mobile Responsive Behavior
type: test-spec
status: active
summary: Behavior contracts for responsive Admin navigation, bundle tables, persistent support chat, overlays, and supporting merchant routes.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
systems:
  - remix-routes
source_paths:
  - app/routes/app/
  - app/components/shared/AssetUpload.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - responsive
keywords:
  - mobile
---

# Test Spec: Admin Mobile Responsive Behavior

**Spec ID:** admin-mobile-responsive  **Created:** 2026-07-22

## Purpose

Keep merchant actions and navigation behavior intact while Admin surfaces adapt to phone, tablet, and desktop containers.

## Test Cases

### Configure mobile navigation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parent section is active | Active parent ID | Current-section label matches the parent | Shared by FPB and PPB |
| 2 | Nested section is active | Active child ID | Current-section label matches the child | Step and visibility children supported |
| 3 | Unknown section is supplied | Unknown ID | First navigable section is used | Avoids an empty disclosure summary |

### Dashboard responsive table

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Bundle records are prepared for the table | Bundle list and display formatters | Rows preserve ID, source bundle, name, status, and type | Actions retain original record identity |
| 2 | No bundle records exist | Empty bundle list | No table rows are produced | Existing empty state remains responsible for presentation |
| 3 | Filters narrow the bundle list | Search, type, and status filters | Only matching records are paginated | Filter behavior is unchanged by responsive presentation |
| 4 | Stored page exceeds the filtered page count | Current page above the last available page | Effective page clamps to the final page | Pagination state remains usable after filtering |
| 5 | Merchant selects bundles per page | One supported radio choice from the pagination dropdown | Pagination accepts 10, 20, or 50 and rejects malformed choices | Keeps the dropdown mutually exclusive |

### Responsive interaction regressions

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Accordion header is activated | Click or keyboard activation | Expanded state toggles without changing caller props | Events page |
| 2 | Readiness item is selected | Incomplete actionable item | Overlay closes and original section callback receives the key | Configure editors |
| 3 | Settings section changes on a phone | Existing language/control state | Active section changes without resetting dirty values | No layout assertions |
| 4 | Asset field renders | Existing asset value and callbacks | Native drop zone accepts the file and preserves upload/remove behavior | No custom picker modal |
| 5 | Configure disclosure section is selected | Section ID and existing selection callback | Original callback receives the section and the disclosure closes | FPB and PPB shared shell |
| 6 | PPB live card is rendered through the shell supplement | Existing placement state and callback | Loading and disabled state are preserved and the original placement callback runs | A single model owns desktop and mobile behavior |
| 7 | Wizard modal opens | Stable modal ID and open state | App Bridge modal API receives a show command | Language, filters, and custom fields |
| 8 | Wizard modal closes | Cancel, built-in dismiss, Save, or Done | State closes, App Bridge receives hide, and the opener regains focus | Draft values remain owned by the wizard |

### Responsive support chat

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Embedded app starts in any viewport | Admin app shell mounts | Floating Crisp launcher is shown | Includes phone viewports |
| 2 | Viewport crosses the phone boundary | Browser width changes | Crisp launcher remains visible | No responsive hide/show listener |
| 3 | Merchant explicitly requests support | Existing `openSupportChat` caller | Chat is shown before it opens | Existing callers remain unchanged |
| 4 | App shell unmounts | Loader cleanup | Delayed SDK-load timer is removed | No presentation listener exists |

## Acceptance Criteria

- [ ] All listed behavior tests pass.
- [ ] No tests assert CSS properties, class names, source order, or visual placement.
- [ ] Existing save, row-action, modal, and navigation contracts remain unchanged.
- [ ] Live Chrome checks cover 320, 390, 430, 768, and desktop widths after the PR is merged.
