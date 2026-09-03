---
schema_version: 1
id: fpb-storefront-proxy-hydration
title: FPB Storefront Proxy Hydration Test Spec
type: test-spec
status: active
summary: Verifies that FPB storefront product hydration stays on the Shopify app-proxy root that served the bundle document.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-widget
source_paths:
  - app/assets/widgets/full-page/methods/discount-modal-methods.ts
  - app/config/storefront-proxy-routes.ts
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - app-proxy
  - sit
keywords:
  - product hydration
  - proxy root
---

# Test Spec: FPB Storefront Proxy Hydration

**Spec ID:** fpb-storefront-proxy-hydration  **Created:** 2026-09-01

## Purpose

Prevent an FPB page served by the SIT Shopify app proxy from sending product and
collection hydration requests to the production app proxy.

## Test Cases

### Storefront proxy-root resolution

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | SIT FPB app-proxy document | `/apps/product-bundles-sit/wpb/5` | Runtime API base is `/apps/product-bundles-sit` | The serving Shopify path is authoritative |
| 2 | PROD FPB app-proxy document | `/apps/product-bundles/wpb/5` | Runtime API base is `/apps/product-bundles` | No environment-specific hardcoding |
| 3 | Product response includes Shopify inventory | Tracked quantity changes | Response is not cached by browsers or shared proxies | Low-stock UI must not use stale inventory |

## Acceptance Criteria

- [x] FPB product hydration resolves its API base through the shared proxy resolver.
- [x] SIT and PROD FPB paths remain isolated.
- [x] The product endpoint marks inventory-bearing responses `no-store`.
- [x] Focused tests and the widget build pass.
- [x] Cache-cleared SIT Chrome requests use only `/apps/product-bundles-sit`.
