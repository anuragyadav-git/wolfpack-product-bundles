---
schema_version: 1
id: canonical-shopify-product-id
title: Canonical Shopify Product ID
type: test-spec
status: active
summary: Verifies that bundle configuration uses Shopify GraphQL product IDs without requesting REST interoperability identifiers.
last_audited: 2026-08-29
owners:
  - wolfpack-engineering
domains:
  - bundles
systems:
  - shopify-admin
source_paths:
  - app/lib/bundle-configure-loader.server.ts
  - app/routes/app/_shared/bundle-configure/CommonConfigureSidebar.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - graphql
  - product-id
keywords:
  - legacyResourceId
  - Shopify GID
---

# Test Spec: Canonical Shopify Product ID
**Spec ID:** canonical-shopify-product-id  **Created:** 2026-08-29

## Purpose

Ensure Admin bundle configuration uses the canonical Shopify GraphQL product ID as its only product identifier source.

## Test Cases

### BundleConfigureLoader

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Load a bundle parent product | Canonical `gid://shopify/Product/...` ID | Product query selects `id` without `legacyResourceId` | Numeric Admin URL segments are derived from the canonical GID |

## Acceptance Criteria

- [x] The configure loader does not request `legacyResourceId`.
- [x] Application-owned source contains no `legacyResourceId` usage.
- [x] Existing bundle configure loader behavior tests pass.
