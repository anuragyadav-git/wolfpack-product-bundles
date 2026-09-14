---
schema_version: 1
id: admin-asset-drop-zone
title: Admin Asset Drop Zone
type: test-spec
status: active
summary: Verifies that Admin asset fields use the native Polaris drop zone and upload directly to Shopify Files without a custom file-library picker.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - admin-ui
systems:
  - polaris-app-home
source_paths:
  - app/components/shared/AssetUpload.tsx
  - app/lib/admin-store-files.client.ts
  - app/routes/app/app.upload-store-file.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.banner.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - uploads
keywords:
  - s-drop-zone
  - files-api
---

# Test Spec: Admin Asset Drop Zone

**Spec ID:** admin-asset-drop-zone  **Created:** 2026-09-10

## Purpose

Ensure every Admin asset field delegates file selection and drag-and-drop interaction to `s-drop-zone`, while the app retains only the Files API upload, processing-status polling, validation, and field-value update required for its bundle data.

## Test Cases

### AssetUpload

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Render an empty asset field | Label, accepted types, enabled state | One named native drop zone exposes the label, accepted types, accessible name, and Shopify upload icon | No nested button, custom clickable surface, or file-library modal |
| 2 | Choose or drop a valid image | Accepted file within the configured size limit | Original multipart body is uploaded, status is polled, and `onChange` receives the READY Shopify CDN URL | Shopify Files remains the storage owner |
| 3 | Choose a rejected type | File MIME type outside `accept` | No upload request occurs and the configured type error is exposed by the drop zone | Covers manual selection and `droprejected` recovery |
| 4 | Choose an oversized image | File larger than the field limit | No upload request occurs and the configured size error is exposed by the drop zone | Size validation is app-owned per Shopify documentation |
| 5 | Upload while processing | Upload or status polling in progress | Drop zone and remove action are disabled until the active attempt settles | Prevents duplicate submissions |
| 6 | Replace a saved asset | Existing CDN URL and a new valid file | Existing preview remains until the new file becomes READY, then `onChange` receives the replacement URL | No transient loss of saved state |
| 7 | Remove a saved asset | Existing CDN URL and Remove action | `onChange(null)` runs exactly once | Removal remains explicit |
| 8 | Processing fails | Files API returns FAILED or a request rejects | A recoverable upload failure is shown and the field becomes interactive again | No stale picker state |

### AdminStoreFilesClient

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Upload a file | `FormData` containing one file | Authenticated `POST /app/upload-store-file` receives the unchanged form body | App Bridge patches the embedded global `fetch` |
| 2 | Poll upload processing | Shopify file ID | Authenticated `GET /app/upload-store-file?fileId=...` returns current processing state | File ID is encoded |
| 3 | Backend rejects a request | Non-2xx JSON or text response | Client throws the backend detail | Surface can explain recovery |
| 4 | Browse existing Files | Any field state | No list/search client or `/app/store-files` request exists | Custom picker is removed |

### CSVImportDropZone

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Import offer-policy CSV | Accepted `.csv` file | Native drop zone forwards the file to the existing CSV validation flow | Separate data import, not a Shopify asset upload |
| 2 | Reject a non-CSV file | Rejected file | Native drop-zone error explains the accepted format | Existing business behavior remains unchanged |

### ConfigureMediaOwnership

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Edit FPB promo banners | Desktop and mobile image selections | Each native drop zone updates only its canonical bundle-banner URL, marks the route dirty, and shows its matching device icon | Both fields remain side-by-side in one row |
| 2 | Edit PPB bundle banners | Desktop and mobile image selections | Each native drop zone updates only its canonical bundle-banner URL, marks the route dirty, and shows its matching device icon | Uses the same responsive-media language as FPB |
| 3 | Edit PPB loading animation | GIF and non-GIF selections | GIF is accepted; other image types are rejected before upload | Matches the visible GIF-only contract |

## Acceptance Criteria

- [x] No custom file-library modal, search, pagination, faux drop zone, or nested competing upload action remains.
- [x] All image/GIF/SVG/AVIF asset fields use a single native `s-drop-zone` interaction surface with no nested action.
- [x] Existing values preview through Shopify-owned media components and retain explicit removal.
- [x] Type, size, disabled, polling, success, timeout, and failure behavior remains covered.
- [x] Focused tests, typecheck, modified-file ESLint, build, Knip, diff check, Graphify, and Agent-store desktop/mobile Chrome QA pass.
- [x] FPB and PPB responsive banner drop zones use native `desktop` and
  `mobile` icons instead of the generic upload icon.
- [x] FPB media-card context badges remain at the top-right of their title and
  description rows without clipping at supported Admin widths.
