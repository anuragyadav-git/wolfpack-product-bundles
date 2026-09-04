---
schema_version: 1
id: admin-route-authentication
title: Admin Route Authentication
type: test-spec
status: active
summary: Verifies Shopify Admin authentication ownership for every embedded Admin route and authenticated redirects after bundle creation.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - admin
systems:
  - authentication
source_paths:
  - apps/OnlyBundles-app/app/routes/app/
related_docs:
  - internal docs/Shopify Integration/Admin API.md
tags:
  - shopify
  - authentication
keywords:
  - authenticate.admin
  - embedded redirect
---

# Test Spec: Admin Route Authentication
**Spec ID:** admin-route-authentication  **Created:** 2026-09-03

## Purpose

Ensure every embedded Admin route is protected by Shopify Admin authentication
directly or through an explicit authenticated parent/delegated route, and that
server-side Admin redirects preserve embedded context.

## Test Cases

### AdminRouteAuthentication

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Current Admin route inventory | All route entry modules under `routes/app` | Every module has a declared direct or inherited authentication owner | New route modules must update the policy |
| 2 | Direct route authentication | Route module with loader or action | Declared number of `authenticate.admin(request)` guards is present | Method-not-allowed resource loaders do not require a second guard |
| 3 | Inherited route authentication | `/app` index or delegated Settings route | Authenticated layout or delegated route is the explicit owner | Avoids duplicate one-time ID-token exchange |
| 4 | Authenticated creation redirect | Successful bundle creation action | Redirect helper returned by `authenticate.admin` is used | Preserves embedded Admin navigation context |
| 5 | Unauthorized creation | Authentication throws redirect response | Failure propagates before domain mutation | No bundle creation occurs |
| 6 | Authenticated Admin layout | Valid Shopify Admin session | Layout returns only the authenticated shop context | Locale resources load after authentication |
| 7 | Unauthorized Admin layout | Authentication throws redirect response | Failure propagates before Admin data loading | Protects every matched child page |

## Acceptance Criteria

- [x] Every current embedded Admin route has explicit authentication ownership.
- [x] New Admin route modules cause the inventory test to fail until classified.
- [x] Bundle creation uses Shopify's authenticated redirect helper.
- [x] Authentication failure prevents bundle creation side effects.
- [x] Focused tests, TypeScript, and ESLint pass.

## Browser Verification

Direct Chrome verification was attempted on 2026-09-03 through the required
Shopify Admin URL for `wolfpack-store-test-1`. Shopify redirected to
`/store/wolfpack-store-test-1/access_account` with “Your plan was canceled”
before the embedded app loaded, so live authenticated page navigation remains
blocked by store state.
