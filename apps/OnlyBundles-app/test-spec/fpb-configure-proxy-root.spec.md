---
schema_version: 1
id: fpb-configure-proxy-root
title: FPB Configure Proxy Root Test Spec
type: test-spec
status: active
summary: Verifies that the FPB Admin configure route carries the environment-specific Shopify app-proxy root from its server loader into client URL construction.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
systems:
  - fpb-configure
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleController.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureContentState.ts
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - app-proxy
  - sit
keywords:
  - storefront proxy root
  - hydration
---

# Test Spec: FPB Configure Proxy Root

**Spec ID:** fpb-configure-proxy-root  **Created:** 2026-09-01

## Purpose

Prevent the embedded FPB Admin route from reading a Node-only environment value
in the browser while retaining distinct Shopify-configured proxy paths for SIT
and PROD on the shared QA store.

## Test Cases

### Configure proxy-root data flow

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Authenticated configure loader on SIT | `STOREFRONT_PROXY_ROOT=/apps/product-bundles-sit` | Loader returns the normalized SIT root | Server owns environment configuration |
| 2 | Configure controller hydration | Loader data contains SIT root | Flow exposes the same root | No browser environment lookup |
| 3 | Configure page URL construction | Shop, public number, and SIT root | URL uses `/apps/product-bundles-sit/wpb/{number}` | Prevents Admin render failure and wrong-environment previews |

## Acceptance Criteria

- [x] The authenticated loader returns the configured Shopify proxy root.
- [x] The client controller carries that root without deriving it from browser globals.
- [x] Initial Admin rendering builds the SIT FPB URL without throwing.
- [x] Focused tests, lint, Graphify, and `git diff --check` pass.
- [ ] Full typecheck passes; an unrelated pre-existing `app/routes/app/app.tsx` Polaris `s-link` `rel` error remains.
- [x] A cache-cleared Chrome reload renders the embedded FPB configure route.
