---
schema_version: 1
id: storefront-proxy-runtime
title: Storefront Proxy Runtime
type: test-spec
status: active
summary: Verifies that Shopify-hosted storefront runtime data selects the installed app proxy root for the active environment.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - storefront
systems:
  - app-proxy
source_paths:
  - app/config/storefront-proxy-routes.ts
  - app/services/ppb-storefront-runtime.server.ts
  - app/storefront/app-embed.ts
  - app/storefront/product-page.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
  - internal docs/Shopify Integration/Metafields.md
tags:
  - tdd
  - app-proxy
keywords:
  - STOREFRONT_PROXY_ROOT
  - storefrontProxyRoot
---

# Test Spec: Storefront Proxy Runtime

**Spec ID:** storefront-proxy-runtime  **Created:** 2026-08-31

## Purpose

Keep the shared Shopify proxy prefix while ensuring storefront requests use the
subpath installed for the active PROD or SIT app instead of a hardcoded PROD
root.

## Test Cases

### StorefrontProxyRoutes

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Configure SIT runtime | `/apps/product-bundles-sit` | API paths use the SIT root | Runtime value comes from Shopify-hosted app data |
| 2 | Configure PROD runtime | `/apps/product-bundles` | API paths use the PROD root | Both environments retain the `apps` prefix |
| 3 | Reject an invalid runtime root | Absolute URL or unsupported prefix | Throw before issuing a request | Never silently redirect traffic to another app |

### PpbStorefrontRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build hosted runtime | Storefront token, settings, installed proxy root | Snapshot includes `storefrontProxyRoot` | Reuses the existing `$app.ppb_storefront_runtime` metafield |
| 2 | Sync hosted runtime | SIT root | `metafieldsSet` persists the SIT root | Shopify-hosted value is the storefront source |
| 3 | Invalid configured root | Malformed path | Sync fails before Shopify mutation | No PROD fallback for malformed SIT configuration |

## Acceptance Criteria

- [x] Both TOML files keep `prefix = "apps"`.
- [x] The Shopify-hosted runtime contains the active app's complete proxy root.
- [x] Direct PPB, SDK, and app-embed entrypoints initialize the same runtime root.
- [x] Malformed configured roots fail before storefront traffic is emitted.
- [x] The eligibility request uses `/apps/product-bundles-sit` in SIT Chrome QA.
