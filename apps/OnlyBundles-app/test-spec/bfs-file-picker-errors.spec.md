---
schema_version: 1
id: bfs-file-picker-errors
title: BFS File Picker Errors Test Spec
type: test-spec
status: active
summary: Behavior gates for authenticated store-file fetching, current-attempt upload errors, and native modal ownership.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - admin
systems:
  - file-picker
source_paths:
  - app/components/shared/FilePicker.tsx
  - app/components/shared/file-picker/FilePickerDialog.tsx
  - app/components/shared/file-picker/FilePickerTrigger.tsx
  - app/lib/admin-store-files.client.ts
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - bfs
  - uploads
keywords:
  - file-picker
  - error-timing
---

# Test Spec: BFS File Picker Errors
**Spec ID:** bfs-file-picker-errors  **Created:** 2026-07-20

## Purpose
Ensure the picker uses the embedded app's authenticated fetch path, exposes actionable current-attempt errors, and delegates ordinary dialog interaction to Polaris web components.

## Test Cases
### FilePickerUploadAttempt
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Picker opens before an upload | No current upload attempt | No upload error appears | Initial state stays clean |
| 2 | Current upload fails | Active attempt and rejected upload request | Contextual error appears | Merchant interacted |
| 3 | Picker closes/reopens | Previous failed attempt | Attempt state resets | No stale error |

### FilePickerInitialOpen
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Auto-open picker mounts | `autoOpen=true` | Initial open state is true | Prevents an initial hide event from unmounting the picker |
| 2 | Normal picker mounts | `autoOpen=false` | Initial open state is false | Preserves explicit-trigger behavior |

### AdminStoreFilesClient
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | List store files | Optional cursor and search query | Authenticated `GET /app/store-files` with matching query parameters | Uses App Bridge-patched global `fetch` |
| 2 | Upload a file | `FormData` containing one file | Authenticated `POST /app/upload-store-file` with the unchanged form body | No Redux transport layer |
| 3 | Poll upload processing | Shopify file ID | Authenticated `GET /app/upload-store-file?fileId=...` | Returns current processing state |
| 4 | Backend rejects a request | Non-2xx JSON response | Client throws the backend message | Picker can show the active attempt error |

### PolarisFilePickerSurface
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Merchant chooses or drops an image | Valid accepted file | `s-drop-zone` forwards the file into the existing upload flow | Native file affordance |
| 2 | Merchant selects an existing image | Available store file | `s-clickable` invokes selection and `s-image` renders its preview | Native interactive and media controls |
| 3 | Merchant dismisses the picker | Open ordinary file-picker dialog | `s-modal` owns Escape, focus, and scroll behavior | No duplicate document handlers |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Invalid current uploads still explain how to recover
- [x] Store-file requests use the authenticated embedded-app fetch path
- [x] The ordinary picker dialog uses Polaris web-component interaction ownership
