---
schema_version: 1
id: app-embed-storefront-context
title: App Embed Storefront Context Test Spec
type: test-spec
status: active
summary: Verifies that the owned Shopify app embed publishes canonical currency context before storefront bundle runtimes initialize.
last_audited: 2026-09-10
owners:
  - Only Bundles Engineering
domains:
  - storefront
systems:
  - theme-app-extension
source_paths:
  - apps/OnlyBundles-app/app/storefront/app-embed.ts
  - apps/OnlyBundles-app/app/storefront/ppb-bundle-embed.ts
related_docs:
  - internal docs/Features/Pricing Pipeline.md
tags:
  - tdd
  - app-embed
keywords:
  - currency-context
  - full-page-bundle
---

# Test Spec: App Embed Storefront Context

**Spec ID:** app-embed-storefront-context  **Created:** 2026-09-10

## Purpose

Verify that the owned Shopify app-embed marker is the canonical source of storefront currency context and that this context is available before direct FPB initialization can begin.

## Test Cases

### App embed bootstrap

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Owned app embed boots an FPB-capable storefront | Marker contains valid Shopify base and customer currencies | `shopCurrency` and `shopifyMultiCurrency` are exposed during entry-point evaluation | Prevents FPB from failing before its runtime loads |

## Acceptance Criteria

- [x] The app-embed entry point exposes both valid Shopify currency codes immediately.
- [x] The existing fail-closed behavior for absent or malformed currency context remains unchanged.
