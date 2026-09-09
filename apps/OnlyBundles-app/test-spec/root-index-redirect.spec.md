---
schema_version: 1
id: root-index-redirect
title: Root Index Redirect Test Spec
type: test-spec
status: active
summary: Verifies that the public root delegates Shopify Admin authentication to the embedded app route without losing request context.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - admin
systems:
  - remix
source_paths:
  - app/routes/root/_index/route.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - routing
keywords:
  - root redirect
  - query preservation
---

# Test Spec: Root Index Redirect

**Spec ID:** root-index-redirect  **Created:** 2026-09-09

## Purpose

Keep the public root route free of duplicate login and iframe-detection behavior while preserving Shopify context for the authenticated `/app` owner.

## Test Cases

### RootIndexLoader

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Root request has no query | `GET /` | Returns a 302 redirect to `/app` | `/app` owns Admin authentication |
| 2 | Root request contains Shopify context | `GET /?shop=...&host=...&embedded=1` | Returns a 302 redirect with the exact query string | No context reconstruction |

## Acceptance Criteria

- [x] Both loader cases pass.
- [x] The root route renders no login form or iframe-detection fallback.
- [x] The navigation map documents `/app` as the authentication owner.
