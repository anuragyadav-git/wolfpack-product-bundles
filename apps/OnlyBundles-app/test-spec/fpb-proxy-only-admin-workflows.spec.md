---
schema_version: 1
id: fpb-proxy-only-admin-workflows
title: FPB Proxy-Only Admin Workflows
type: test-spec
status: active
summary: Verifies that FPB preview and storefront setup use the canonical app proxy without creating Shopify Pages.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - fpb-configure
  - fpb-app-proxy
source_paths:
  - app/routes/app/shared/storefront-sync-action.server.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureActionController.ts
  - app/lib/theme-editor-navigation.client.ts
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
  - internal docs/Architecture/Storefront Draft Preview Authorization.md
tags:
  - fpb
  - preview
  - cleanup
keywords:
  - wpb_preview
  - app proxy
  - Shopify Page
---

# Test Spec: FPB Proxy-Only Admin Workflows

**Spec ID:** fpb-proxy-only-admin-workflows  **Created:** 2026-08-11

## Purpose

Keep FPB Admin preview and storefront setup on the canonical app-proxy and
theme-app-extension contracts without creating, publishing, renaming, or
selecting Shopify Pages.

## Test Cases

### FpbProxyPreview

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Preview a saved FPB | Authenticated FPB preview request | Reserves a tab synchronously, performs one storefront sync, then navigates the tab to a fresh signed proxy URL | No popup blocking, Page mutation, or second preview request |
| 2 | Preview sync fails | Storefront sync error | Returns the compact error response | No preview URL |

### FpbUpsellPlacement

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Place upsell button | Shop, app key, button mode | Opens product-template Theme Editor deep link for `bundle-upsell-button` | No Page selector |
| 2 | Place upsell block | Shop, app key, block mode | Opens product-template Theme Editor deep link for `bundle-upsell-block` | No Page selector |

## Acceptance Criteria

- [x] FPB preview uses one authenticated request and returns the signed app-proxy URL.
- [x] FPB configure preview reserves its tab before awaiting the signed URL.
- [x] FPB configure code has no Page creation, publishing, rename, or selection path.
- [x] Product-page upsell placement still opens the correct Theme Editor block.
- [x] Legacy Page IDs remain only for dashboard deletion until the schema cleanup release.
