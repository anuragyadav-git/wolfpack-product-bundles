---
schema_version: 1
id: static-website-test-spec
title: Static Website Test Spec
type: test-spec
status: active
summary: Defines output and HTTP behavior checks for the non-indexable Only Bundles static website scaffold.
last_audited: 2026-09-02
owners:
  - engineering
domains:
  - website
systems:
  - cloudflare-workers
source_paths:
  - apps/OnlyBundles-website/src/pages/
  - apps/OnlyBundles-website/tests/static-output.test.mjs
related_docs:
  - internal docs/Architecture/Repository Layout.md
tags:
  - tdd
keywords:
  - astro
  - 404
---

# Test Spec: Static Website

**Spec ID:** static-website  **Created:** 2026-09-02

## Purpose

Verify the pre-rendered website output, indexing controls, known brand asset, and custom not-found response without asserting visual styling or placement.

## Test Cases

### StaticOutput

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build home page | `/` | Static `index.html` with Only Bundles identity and noindex metadata | No product claims |
| 2 | Build not-found page | Unknown route | Static `404.html` with recovery link and noindex metadata | Served with HTTP 404 by Wrangler |
| 3 | Publish approved icon | Referenced icon URL | File exists in `dist` | Copied from app branding assets |
| 4 | Block crawlers | `/robots.txt` | `Disallow: /` | workers.dev scaffold only |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Astro produces fully static output
- [x] Unknown paths return the custom page with HTTP 404
- [x] No test asserts CSS, class names, or placement
