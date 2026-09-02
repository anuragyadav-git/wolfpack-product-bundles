---
schema_version: 1
id: static-website-test-spec
title: Static Website Test Spec
type: test-spec
status: active
summary: Defines content, metadata, discovery, asset, and HTTP behavior checks for the public Only Bundles tutorial website.
last_audited: 2026-09-03
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

Verify the pre-rendered tutorial website, public discovery metadata, article inventory, links, media, and custom not-found response without asserting visual styling or placement.

## Test Cases

### StaticOutput

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build learning hub | `/` | Static page identifies Only Bundles, links to `/blogs/`, and is indexable | No unsupported product claims |
| 2 | Build tutorial index | `/blogs/` | Lists every published tutorial exactly once | Draft content is excluded |
| 3 | Build tutorial routes | Eleven published tutorial IDs | Each route has a single article heading and substantial instructional content | Generated from the content collection |
| 4 | Publish metadata | Home, index, and tutorial pages | Description, canonical URL, Open Graph metadata, and valid JSON-LD | Canonical origin is centralized |
| 5 | Publish discovery files | `/robots.txt` and sitemap output | Crawlers are allowed and sitemap includes all public HTML routes | 404 remains noindex |
| 6 | Resolve local navigation | Every root-relative link in generated HTML | Target exists in static output or is an intentional public asset | Fragment links resolve to a page heading |
| 7 | Publish tutorial media | Every local article image | Referenced file exists and alt text is non-empty | No raw investigation captures |
| 8 | Enforce public naming | Generated public HTML | Uses Only Bundles visible branding and contains no competitor branding | Preserved technical identifiers may appear only in code examples |
| 9 | Build not-found page | Unknown route | Static `404.html` with recovery link and noindex metadata | Served with HTTP 404 by Wrangler |
| 10 | Publish approved icon | Referenced icon URL | File exists in `dist` | Copied from app branding assets |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Astro produces fully static output
- [x] Unknown paths return the custom page with HTTP 404
- [x] No test asserts CSS, class names, or placement
- [x] Eleven production-audited tutorials are rendered
- [x] Every generated internal link and article image resolves
- [x] Public pages are indexable with canonical metadata and sitemap discovery
