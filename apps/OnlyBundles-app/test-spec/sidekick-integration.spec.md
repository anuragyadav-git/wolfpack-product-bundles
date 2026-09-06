---
schema_version: 1
id: sidekick-integration
title: Shopify Sidekick Integration Test Spec
type: test-spec
status: active
summary: Verifies read-only bundle discovery and merchant-confirmed bundle creation through Shopify Sidekick app extensions.
last_audited: 2026-09-06
owners:
  - engineering
domains:
  - admin
  - sidekick
systems:
  - bundle-data
  - bundle-create
source_paths:
  - app/routes/app/app.sidekick.bundles.tsx
  - app/routes/app/app.bundles.create/route.tsx
  - extensions/sidekick-bundle-data/
  - extensions/sidekick-create-bundle/
related_docs:
  - internal docs/Shopify Integration/Sidekick.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - sidekick
keywords:
  - admin.app.tools.data
  - admin.app.intent.link
  - shopify-product-import
---

# Test Spec: Shopify Sidekick Integration

**Spec ID:** sidekick-integration  **Created:** 2026-09-05

## Purpose

Verify that Sidekick can retrieve tenant-scoped bundle summaries and open their configuration pages, while bundle creation remains an explicit merchant-confirmed workflow on the existing create page.

## Test Cases

### BundleDataTools

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Search current bundles | Optional name, status, type, and limit filters | Compact results ordered by latest update | Archived bundles are excluded unless explicitly requested |
| 2 | Inspect a bundle | Current shop and bundle ID | One compact summary with an `app://` configuration URL | Query is scoped by both shop and ID |
| 3 | Cross-shop lookup | Bundle ID owned by another shop | Not found | Never reveal another shop's data |
| 4 | Invalid request | Unknown operation, filter, or oversized query | 400 response | Do not query Prisma |
| 5 | Authenticated sandbox fetch | Valid Shopify session-token request | CORS-wrapped, no-store JSON | No custom token or endpoint fallback |
| 6 | Data-only execution | Any data tool request | No database or Shopify mutation | Sidekick data target remains read-only |

### BundleCreateIntent

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Stage a bundle draft | Optional title and supported bundle type | Existing form state is updated and confirmation is required | Tool performs no submission |
| 2 | Unsupported intent | Wrong action or resource type | No Sidekick draft is applied | Normal create route remains unchanged |
| 3 | Invalid draft input | Short title or unknown bundle type | Structured validation error | No partial mutation |
| 4 | Confirm Sidekick creation | Valid staged values and merchant clicks Save | One draft bundle is created and Shopify Product GID is returned | Reuses the existing creation handler |
| 5 | Normal creation | Existing non-Sidekick form submission | Existing configure redirect and first-load behavior | Regression coverage |
| 6 | Sidekick creation failure | Entitlement or server failure | Sanitized error contract | No promotion or upgrade copy is returned to Sidekick |
| 7 | Merchant cancellation | Merchant exits an active intent | Intent resolves as closed | No creation occurs |
| 8 | Intent initialization | Active import intent arrives with page load | Staging tool registers before the intent is consumed | Prevents Sidekick from calling an unregistered tool |
| 9 | Server rendering | Create route renders without browser globals | Route renders without resolving App Bridge | App Bridge is initialized client-side only |

## Acceptance Criteria

- [x] All listed automated tests pass.
- [x] Shopify CLI 4.7.1 builds both Sidekick extensions and includes their schemas.
- [x] Sidekick's development security scan reports `OK` for the Agent store.
- [x] Data responses stay below 4,000 tokens; warm authenticated responses meet one second, and isolated SQL execution is below one millisecond. Longer first-connection timings through the development tunnel are attributed to the verified Free, unpooled Render SIT database connection path rather than Sidekick handler execution.
- [x] No bundle is created before explicit merchant confirmation.
- [x] Direct edits of existing bundles and analytics retrieval remain out of scope.
