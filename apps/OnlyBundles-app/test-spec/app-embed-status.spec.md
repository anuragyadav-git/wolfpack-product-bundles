---
schema_version: 1
id: app-embed-status-test-spec
title: "Test Spec: App Embed Status"
type: test-spec
status: active
summary: Behavior coverage for live theme app embed status detection.
last_audited: 2026-07-31
owners:
  - engineering
domains:
  - storefront
systems:
  - theme-app-extension
source_paths:
  - tests/unit/services/app-embed-check.test.ts
  - tests/unit/lib/bundle-configure-loader.test.ts
related_docs:
  - internal docs/Shopify Integration/Theme App Extensions.md
tags:
  - testing
keywords:
  - currentAppInstallation
---

# Test Spec: App Embed Status
**Spec ID:** app-embed-status  **Created:** 2026-07-07

## Purpose
Ensure Admin app-embed warnings use Shopify's current app installation handle when checking the active theme app embed.

## Test Cases
### BundleConfigureLoader
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | App identity delegation | Configure loader checks the embed | Loader supplies only the block handle | App identity belongs to the Admin query |
| 2 | Current app handle absent | Admin returns no app handle | `enabled=false` | Detection fails closed without fallback handles |

### AppEmbedCheck
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 3 | Live theme is checked | MAIN theme disabled | `enabled=false`, `themeId` is the MAIN theme | Live storefront status is based on the active published theme only |
| 4 | MAIN query is scoped | App embed status is requested | Admin GraphQL uses `themes(first: 1, roles: [MAIN])` | Keeps Preview and banner checks aligned with EB-style active-theme detection |
| 5 | Different app owns matching block | Block handle matches but app handle differs | `enabled=false` | Only the current installation owns valid blocks |

## Acceptance Criteria
- [x] All listed test cases pass
