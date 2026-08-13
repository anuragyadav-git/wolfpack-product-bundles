---
schema_version: 1
id: storefront-asset-strategy
title: "Test Spec: Storefront Asset Strategy"
type: test-spec
status: active
summary: Verifies that storefront widgets load extension assets through Shopify asset URLs while app proxies carry documents and data only.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - storefront
systems:
  - theme-extension
source_paths:
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
  - app/routes/root/wpb.$bundleId.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - assets
keywords:
  - asset_url
  - app proxy
---

# Test Spec: Storefront Asset Strategy

**Spec ID:** storefront-asset-strategy  **Created:** 2026-06-01

## Purpose

Keep Shopify theme-extension assets on `asset_url` and reserve the app proxy for FPB documents and runtime data.

## Test Cases

### FPB

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | FPB app-proxy document | Signed `/apps/product-bundles/wpb/:bundleId` request | Liquid marker with bundle config and no proxy-hosted JS/CSS | App embed owns assets |
| 2 | FPB extension resources | Theme extension manifest | `bundle-app-embed` exists and `bundle-full-page` Page block is absent | No Page host dependency |

### PPB

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Product page block | `bundle-product-page.liquid` | Uses `asset_url` for storefront assets | Merchant controls placement |

## Acceptance Criteria

- [x] No storefront document injects `/apps/product-bundles/assets/*.js` or `*.css`.
- [x] FPB uses the app embed and PPB uses its product-page block.
- [x] The extension manifest contains no FPB Page block.
