---
schema_version: 1
id: shopify-native-surface-cleanup
title: Shopify Native Surface Cleanup Test Spec
type: test-spec
status: active
summary: Defines Wolfpack-owned behavior retained while Shopify-native authentication, Storefront, app-extension, Save Bar, modal, and Web Vitals wrappers are removed.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - admin
  - storefront
source_paths:
  - app/shopify.server.ts
  - app/routes/api
  - app/lib/theme-extension-status.ts
related_docs:
  - internal docs/Shopify Integration/Admin API.md
  - internal docs/Shopify Integration/Theme App Extensions.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - cleanup
keywords:
  - expiring offline tokens
  - app proxy
  - app extensions
---

# Test Spec: Shopify Native Surface Cleanup

**Spec ID:** shopify-native-surface-cleanup  **Created:** 2026-08-24

## Purpose

Retain tests for Wolfpack validation, transformation, and fail-closed policy while removing tests that duplicate behavior owned by Shopify's official Remix, App Bridge, Polaris, and Web Vitals surfaces.

## Test Cases

### Storefront App Proxy Routes

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Missing app-proxy session | Signed-auth context without an installed-shop session or Storefront client | Reject with 401 | Wolfpack fail-closed policy |
| 2 | Product identifiers are invalid | Signed request containing malformed product IDs | Reject with 400 before Storefront GraphQL | Wolfpack validation |
| 3 | Storefront product query succeeds | Signed request and native Storefront client response | Return normalized products and inventory | Wolfpack transformation |
| 4 | Storefront collection query succeeds | Signed request, handles, and native Storefront client response | Return deduplicated products and collection membership | Wolfpack transformation |
| 5 | Storefront GraphQL fails | Native client returns transport or GraphQL errors | Return an app-owned error response | Error mapping |
| 6 | Cart metafield update succeeds | Valid cart payload and native Storefront client | Merge existing bundle details and persist the result | Wolfpack persistence policy |

### Expiring Offline Token Release Gate

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Configured database is audited | Offline sessions without refresh metadata are counted | Count is zero before the compatibility helper is removed | Verified for the configured development database |
| 2 | SIT is prepared for release | The same count is run against SIT | Deployment is blocked unless the count is zero | Environment-specific operator gate |
| 3 | Production is prepared for release | The same count is run against production | Deployment is blocked unless the count is zero | Environment-specific operator gate |

### Native Theme Extension Data

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Published embed is active | Native `shopify.app.extensions()` resource data | Normalize the embed as active | Wolfpack resource mapping |
| 2 | Published embed is available | Native resource data without activation | Normalize the embed as inactive | Wolfpack resource mapping |
| 3 | Theme editor URL is requested | Trusted shop, API key, and embed handle | Build `/admin/themes/current/editor` URL with `activateAppId` | Wolfpack deep-link generation |

## Acceptance Criteria

- [x] Official Prisma session storage is configured with expiring offline access tokens.
- [x] The legacy offline-token compatibility helper is removed after the configured database reported zero legacy sessions.
- [ ] SIT and production each report zero legacy offline sessions before their respective release.
- [x] Signed app-proxy routes use Shopify's native Storefront context and reject a missing installed-shop session.
- [x] Manual Storefront-token creation, persistence, direct-host clients, and CORS fallbacks are removed.
- [x] App-embed state is derived from native extension resources and the current-theme editor deep link.
- [x] Save Bar delegation and Polaris modal compatibility fallbacks are removed without removing app-owned workflows.
- [x] The retired Admin Web Vitals runtime and route are removed.
- [x] Focused tests, full tests, typecheck, ESLint, widget builds, syntax checks, diff checks, and Graphify complete or blockers are recorded.
