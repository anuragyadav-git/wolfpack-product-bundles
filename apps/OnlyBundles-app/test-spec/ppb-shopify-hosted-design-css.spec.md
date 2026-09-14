---
schema_version: 1
id: ppb-shopify-hosted-design-css
title: PPB Shopify Hosted Design CSS Test Spec
type: test-spec
status: active
summary: Verifies PPB design CSS is synchronized once and rendered from Shopify metafields on every supported theme surface.
last_audited: 2026-09-08
owners:
  - engineering
domains:
  - storefront
systems:
  - theme-app-extension
  - ppb-storefront-runtime
source_paths:
  - app/services/ppb-storefront-runtime.server.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - shopify-metafields
keywords:
  - ppb_storefront_css
  - app embed
---

# Test Spec: PPB Shopify Hosted Design CSS

**Spec ID:** ppb-shopify-hosted-design-css  **Created:** 2026-09-06

## Purpose

Keep a single generated PPB CSS artifact in Shopify and eliminate runtime database-backed stylesheet loading.

## Test Cases

### PpbStorefrontCssDelivery

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Settings sync | Saved PPB design settings | Generated CSS is written to `$app.ppb_storefront_css` | Existing service behavior |
| 2 | Parent product block | PPB metafield exists | Shopify renders the CSS inline | Existing surface |
| 3 | App embed and page-builder surface | PPB metafield exists | Shopify renders the same CSS inline | No dynamic stylesheet request |
| 4 | Missing metafield | No synchronized CSS | Base asset CSS still loads | No database fallback |

## Acceptance Criteria

- [x] No `/api/design-settings/:shopDomain` route remains.
- [x] No storefront runtime loads a design-settings stylesheet URL.
- [x] Liquid validation and existing PPB runtime tests pass.
