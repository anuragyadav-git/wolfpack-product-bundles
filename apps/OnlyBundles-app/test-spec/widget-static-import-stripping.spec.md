---
schema_version: 1
id: widget-static-import-stripping
title: Widget Static Import Stripping
type: test-spec
status: active
summary: Verifies that classic storefront widget bundles contain no static ES module imports.
last_audited: 2026-08-07
owners:
  - wolfpack
domains:
  - storefront
systems:
  - widget-build
source_paths:
  - scripts/build-widget-bundles.js
  - tests/unit/assets/fpb-bundled-widget-syntax.test.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - widgets
  - build
keywords:
  - static-import
  - classic-script
---

# Test Spec: Widget Static Import Stripping

**Spec ID:** widget-static-import-stripping  **Created:** 2026-08-07

## Purpose

Ensure generated storefront widget assets remain valid classic scripts when source modules use side-effect imports.

## Test Cases

### WidgetBundleSyntax

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Full-page widget includes a side-effect source import | Generated full-page widget asset | No static `import` statement remains | Shopify loads the asset as a classic script |
| 2 | Full-page widget is parsed by Node | Generated full-page widget asset | Syntax check succeeds | Catches any remaining unsupported module syntax |

## Acceptance Criteria

- [x] Generated full-page bundle contains no static imports.
- [x] Generated full-page bundle passes the JavaScript syntax check.
