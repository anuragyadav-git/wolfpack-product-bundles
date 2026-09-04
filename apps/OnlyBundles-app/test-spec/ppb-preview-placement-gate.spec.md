---
schema_version: 1
id: ppb-preview-placement-gate
title: PPB Preview Placement Gate
type: test-spec
status: active
summary: Verify that PPB preview uses Shopify's native extension activation status and stops at Theme Editor setup when the effective product template lacks the app block.
last_audited: 2026-09-04
owners:
  - engineering
domains:
  - admin
systems:
  - ppb-preview
source_paths:
  - app/lib/ppb-widget-placement.client.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbPreviewReadinessHandlers.ts
related_docs:
  - internal docs/Architecture/Storefront Draft Preview Authorization.md
tags:
  - ppb
  - preview
keywords:
  - widget placement
---

# Test Spec: PPB Preview Placement Gate

**Spec ID:** ppb-preview-placement-gate **Created:** 2026-09-04

## Purpose

Prevent Product Page Bundle preview from being recorded or opened when Shopify's App API reports that the effective product template does not contain the Wolfpack app block. Reuse Shopify's Theme Editor deep link for the required one-time setup.

## Test Cases

### ResolvePpbWidgetPlacementAction

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | App block is present | Native App API activation on the effective product template | Continue to storefront preview | No setup navigation |
| 2 | App block is missing and Shopify provides setup | Blocked gate with installation link | Open the Theme Editor setup link and do not mark preview complete | Uses Shopify's canonical app-block deep link |
| 3 | Placement cannot be verified | Blocked gate without installation link | Close the pending tab and keep preview blocked | Fail closed |

## Acceptance Criteria

- [x] A missing PPB app block cannot be reported as a completed preview.
- [x] The already-returned Shopify Theme Editor installation link is used for setup.
- [x] A placement verification failure does not open an unrenderable product preview.
- [x] All listed test cases pass.
