---
schema_version: 1
id: signed-settings-app-proxy
title: Signed Settings App Proxy Test Spec
type: test-spec
status: active
summary: Verifies storefront Controls and Language settings use Shopify app-proxy authentication, tenant identity, and the installed storefront proxy root.
last_audited: 2026-09-08
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - storefront-app-proxy
source_paths:
  - app/routes/api/api.controls-settings.tsx
  - app/routes/api/api.language-settings.tsx
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - authentication
keywords:
  - authenticate.public.appProxy
  - signed app proxy
---

# Test Spec: Signed Settings App Proxy

**Spec ID:** signed-settings-app-proxy  **Created:** 2026-09-06

## Purpose

Ensure public widget settings are tenant-scoped through Shopify's verified app-proxy session instead of a caller-controlled path parameter.

## Test Cases

### SettingsAppProxyAuthentication

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid Controls request | Signed proxy request with session | Query uses `session.shop` | No shop path segment |
| 2 | Valid Language request | Signed proxy request with session | Query uses `session.shop` | Locale remains a query parameter |
| 3 | Missing offline session | Verified proxy request without session | HTTP 401 | No tenant data read |
| 4 | Invalid proxy signature | Shopify authenticator rejects | Authentication response propagates | No custom signature logic |
| 5 | Language persistence failure | Authenticated request while settings storage is unavailable | HTTP 503 without fabricated locale defaults | The persisted settings row is the single source |
| 6 | SIT FPB quick-add link | Signed Controls request with the SIT proxy root configured | FPB target uses `/apps/product-bundles-sit/wpb/{publicNumber}` | Never redirect SIT storefront traffic through the production app |
| 7 | FPB Controls request | Runtime has a Shopify shop domain | Request uses `/api/controls-settings` without a shop path segment | Shopify app-proxy authentication owns tenant identity |
| 8 | FPB Language request | Runtime has a Shopify shop domain and locale | Request uses `/api/language-settings` with locale only | Shopify app-proxy authentication owns tenant identity |

## Acceptance Criteria

- [x] Both endpoints call `authenticate.public.appProxy(request)`.
- [x] Neither endpoint accepts a shop-domain path parameter.
- [x] Persistence failures remain retryable and never fabricate storefront language settings.
- [x] FPB quick-add links use the configured installation-specific proxy root.
- [x] FPB runtime callers never serialize the shop domain into either settings path.
- [x] All listed test cases pass.
