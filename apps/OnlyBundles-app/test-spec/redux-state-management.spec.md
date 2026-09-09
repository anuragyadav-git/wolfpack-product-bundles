---
schema_version: 1
id: redux-state-management
title: Route Local State Remediation Test Spec
type: test-spec
status: active
summary: Defines behavior preserved while Redux and RTK Query are replaced with route-local React state and App Bridge-authenticated fetch.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - admin
systems:
  - react
  - remix
source_paths:
  - app/hooks/useBundleConfigurationState.ts
  - app/hooks/configure-route-state.ts
  - app/hooks/useDashboardState.ts
  - app/components/shared/FilePicker.tsx
  - app/lib/admin-store-files.client.ts
related_docs:
  - internal docs/Architecture/State Management.md
  - internal docs/Shopify Integration/Embedded Admin Resource Authentication.md
tags:
  - tdd
  - state-management
keywords:
  - route-local reducer
  - App Bridge fetch
  - FilePicker
---

# Test Spec: Route Local State Remediation

**Spec ID:** redux-state-management  **Created:** 2026-06-21

## Purpose

Preserve Admin configure, dashboard, and store-file behavior while removing the route-local Redux store and RTK Query layer.

## Test Cases

### Configure Route Reducer

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initialize loaded state | Product, collections, and rule messages | Loaded fields replace defaults and dirty is false | Used by FPB and PPB |
| 2 | Open and close modal | Modal key and optional step ID | Only that modal changes and step ID is retained | No global modal mirror |
| 3 | Edit persisted draft | Product, collections, or rule messages | Field changes and dirty becomes true | Save Bar behavior retained |
| 4 | Reset navigation | Changed tab, section, and force flag | Step Setup defaults are restored | Bundle changes reset navigation |

### Store File Client

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | List files | Cursor and search query | Standard GET to authenticated `/app/store-files` | App Bridge intercepts `fetch` |
| 2 | Upload file | Multipart `FormData` | Standard POST with original body | Do not set content type manually |
| 3 | Poll upload | Shopify file GID | Encoded GET query | Same resource route |
| 4 | Backend error | Non-2xx JSON or text response | Throw an error carrying backend detail | FilePicker maps it to existing failure UI |
| 5 | Empty file results | Empty store library, with and without a search query | Render the matching localized empty-state message | No hardcoded English fallback copy |

### Dashboard State

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Delete modal lifecycle | Open with bundle ID, then close | Local state opens, then clears ID | No global modal store |
| 2 | Filter or page-size change | Search/type/status/per-page input | Current page resets to 1 | Pagination behavior retained |

## Acceptance Criteria

- [x] All listed behavior tests pass.
- [x] Existing configure hook return shapes and dashboard flows remain compatible.
- [x] Standard `fetch` owns App Bridge-authenticated store-file requests.
- [x] No production code imports Redux, RTK Query, or `app/store`.
- [x] The unused centralized Redux-era state type registry is removed.
- [x] `@reduxjs/toolkit` and `react-redux` are removed from dependencies and Vite chunks.
