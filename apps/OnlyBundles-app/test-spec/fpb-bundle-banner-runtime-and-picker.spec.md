---
schema_version: 1
id: fpb-bundle-banner-runtime-and-picker
title: FPB Bundle Banner Runtime and Upload
type: test-spec
status: active
summary: Verifies full-page banner projection across templates and native banner upload behavior.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - storefront
  - admin
systems:
  - widget-runtime
  - polaris-app-home
source_paths:
  - app/lib/bundle-formatter.server.ts
  - app/components/shared/AssetUpload.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - banner
  - asset-upload
keywords:
  - bundleBannerDesktopUrl
  - bundleBannerMobileUrl
  - s-drop-zone
---

# Test Spec: FPB Bundle Banner Runtime and Upload

**Spec ID:** fpb-bundle-banner-runtime-and-picker  **Created:** 2026-07-20

## Purpose

Ensure saved FPB banner URLs reach every storefront template and the Admin banner controls use native Polaris drop zones backed by Shopify Files.

## Test Cases

### BundleFormatter

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Project banners across FPB templates | Standard, Classic, Compact, and Horizontal bundles with both banner URLs | Both URLs exist in each formatted widget payload | Covers app-proxy and API consumers of the shared formatter |

### BannerAssetUpload

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Upload desktop banner | Accepted image file | Native drop zone uploads through Shopify Files and updates the desktop URL after READY | Promo Banner owns the field |
| 2 | Upload mobile banner | Accepted image file | Native drop zone uploads through Shopify Files and updates the mobile URL after READY | Shares the responsive row on wide containers |
| 3 | Remove uploaded banner | Existing banner URL | Explicit Remove clears only the matching banner URL | Other banner remains unchanged |

## Acceptance Criteria

- [x] Tests fail before implementation and pass afterward.
- [x] All four FPB templates receive desktop and mobile banner URLs.
- [x] Desktop and mobile banner fields use native Polaris drop zones.
- [x] Banner uploads use Shopify Files without a custom file-library surface.
- [x] Focused lint, app build, graph rebuild, and browser verification pass.
