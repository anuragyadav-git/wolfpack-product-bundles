---
schema_version: 1
id: storefront-esm-build
title: Storefront ESM Build
type: test-spec
status: active
summary: Verifies compiler-owned storefront bundles and explicit module dependencies.
last_audited: 2026-08-07
owners:
  - wolfpack
domains:
  - storefront
systems:
  - theme-extension
source_paths:
  - scripts/build-storefront.mjs
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - storefront
  - esbuild
keywords:
  - esm
  - iife
---

# Test Spec: Storefront ESM Build

**Spec ID:** storefront-esm-build  **Created:** 2026-08-07

## Purpose

Ensure standard ESM sources compile into self-contained Shopify storefront scripts without concatenation or leaked imports.

## Test Cases

### StorefrontBuild

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build all storefront entries | FPB, PPB, SDK TypeScript entries | Three valid IIFE assets | Build warnings fail |
| 2 | Inspect generated scripts | Generated asset text | No static imports or CommonJS exports | Classic script contract |
| 3 | Parse generated scripts | Node syntax check | All outputs parse | Shopify browser safety |

## Acceptance Criteria

- [ ] All storefront entries compile without warnings.
- [ ] Generated assets contain no module statements.
- [ ] Generated assets pass syntax checks.
