---
schema_version: 1
id: sit-storefront-proxy-isolation
title: SIT Storefront Proxy Isolation Test Spec
type: test-spec
status: implemented
summary: Verifies that SIT storefront proxy traffic is isolated from the production app while production keeps its canonical proxy URL.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - storefront
systems:
  - app-proxy
source_paths:
  - app/config/storefront-proxy-routes.ts
  - app/lib/fpb-storefront-url.ts
  - shopify.app.toml
  - shopify.app.wolfpack-product-bundles-sit.toml
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - app-proxy
  - sit
  - tdd
keywords:
  - storefront proxy root
  - product-bundles-sit
---

# Test Spec: SIT Storefront Proxy Isolation

**Spec ID:** sit-storefront-proxy-isolation  **Created:** 2026-08-30

## Purpose

Prevent the PROD and SIT apps from competing for the same Shopify storefront
app-proxy path when both are installed on one QA store.

## Test Cases

### Storefront proxy root

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Production default | No configured override | `/apps/product-bundles` | Existing merchant contract is unchanged |
| 2 | Explicit SIT root | `/apps/product-bundles-sit` | `/apps/product-bundles-sit` | Used by the SIT server environment |
| 3 | FPB browser inference | `/apps/product-bundles-sit/wpb/3` | `/apps/product-bundles-sit` | Keeps FPB runtime requests on the active signed proxy |
| 4 | Invalid override | Absolute URL or malformed path | `/apps/product-bundles` | Do not emit unsafe storefront URLs |
| 5 | FPB preview URL | Shop, public number, SIT root | SIT-rooted storefront URL | Preview must not route into PROD |
| 6 | Shopify app configs | PROD and SIT TOML files | Distinct subpaths | Prevents installation-level collisions |

## Acceptance Criteria

- [x] Existing production URLs remain unchanged.
- [x] SIT server-generated FPB URLs use the isolated proxy root.
- [x] FPB browser runtime can infer the proxy root from its signed document URL.
- [x] Focused tests, lint, typecheck, build, and Graphify pass.
- [x] The signed SIT FPB document renders in Chrome at 1280 x 800.
- [ ] Mobile Chrome verification passes after the actual-window resize tool recovers.
