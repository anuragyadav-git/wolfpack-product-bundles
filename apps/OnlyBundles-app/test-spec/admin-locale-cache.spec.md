---
schema_version: 1
id: admin-locale-cache
title: Admin Locale Cache
type: test-spec
status: active
summary: Verifies short-lived Admin locale reuse and immediate cache refresh after merchant saves.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - i18n
  - loader-cache
source_paths:
  - app/services/admin-locale.server.ts
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - lcp
keywords:
  - admin locale
  - loader cache
---

# Test Spec: Admin Locale Cache

**Spec ID:** admin-locale-cache  **Created:** 2026-08-25

## Purpose

Avoid repeating the same shop-locale database lookup on every Admin document load while preserving immediate merchant-visible saves.

## Test Cases

### AdminLocaleCache

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Locale is loaded repeatedly | Same shop within the cache TTL | Database is queried once and the normalized locale is reused | Uses the existing loader cache |
| 2 | Merchant saves a locale | Supported locale is persisted | Cache immediately returns the saved locale | No stale post-save navigation |
| 3 | Merchant submits an unsupported locale | Unsupported locale | Save rejects without changing persistence or cache | Existing validation remains |

## Acceptance Criteria

- [x] Repeated Admin document loads reuse the locale lookup.
- [x] Saving a locale refreshes the same cache entry.
- [x] Unsupported locales remain rejected.
