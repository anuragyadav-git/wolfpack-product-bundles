---
schema_version: 1
id: admin-route-authentication
title: Admin Route Authentication
type: test-spec
status: active
summary: Verifies Shopify Admin authentication ownership for every embedded Admin route and authenticated redirects after bundle creation.
last_audited: 2026-09-04
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
| 2 | Direct route authentication | Route module with loader or action | Declared number of `authenticate.admin(request)` guards is present | Direct resource loaders and actions authenticate at their own boundary |
| 3 | Inherited route authentication | `/app` index or delegated Settings route | Authenticated layout or delegated route is the explicit owner | Avoids duplicate one-time ID-token exchange |
| 4 | Authenticated creation redirect | Successful bundle creation action | Redirect helper returned by `authenticate.admin` is used | Preserves embedded Admin navigation context |
| 5 | Unauthorized creation | Authentication throws redirect response | Failure propagates before domain mutation | No bundle creation occurs |
| 6 | Authenticated Admin layout | Valid Shopify Admin session | Layout returns only the authenticated shop context | Locale resources load after authentication |
| 7 | Unauthorized Admin layout | Authentication throws redirect response | Failure propagates before Admin data loading | Protects every matched child page |
| 8 | Invalid Admin resource request | Missing or malformed route parameters | Shopify authentication runs before validation and no domain handler runs when authentication fails | Prevents unauthenticated route probing |
| 9 | Unsupported Admin resource method | Direct GET request to an action-only resource route | Shopify authentication runs before the 405 response | Resource routes do not rely on the document layout loader |
| 10 | Shopify OAuth callback | Valid callback request | `authenticate.admin(request)` owns the response and the route returns `null` after success | Matches Shopify's canonical Remix callback route |
| 11 | Shopify OAuth callback challenge | Authentication throws a redirect response | The exact Shopify response propagates | No generic Remix redirect is layered on top |
| 12 | Configure action re-authentication | Shopify authentication throws before FPB or PPB dispatch | The exact Shopify response propagates and no handler runs | Broad application catches must not swallow Shopify responses |
| 13 | Admin API action re-authentication | Shopify authentication throws before product-template validation | The exact Shopify response propagates | Authentication sits outside application error handling |
| 14 | Shopify login entry | GET with embedded or shop query parameters | `shopify.login(request)` validates input and owns any redirect | No custom query-parameter redirect heuristic |
| 15 | Shopify login submission | POST with a shop domain | `shopify.login(request)` owns validation and OAuth navigation | Uses the package's canonical login action |

## Acceptance Criteria

- [x] Every current embedded Admin route has explicit authentication ownership.
- [x] New Admin route modules cause the inventory test to fail until classified.
- [x] Bundle creation uses Shopify's authenticated redirect helper.
- [x] Authentication failure prevents bundle creation side effects.
- [x] Admin resource routes authenticate before validation or method responses.
- [x] Shopify's authentication package exclusively owns OAuth callback redirects.
- [x] Shopify authentication responses are never converted into generic action errors.
- [x] Shopify's login helper exclusively owns login validation and OAuth redirects.
- [x] Focused tests, ESLint, and the production build pass.
- [ ] Full-project TypeScript passes; currently blocked by pre-existing Dashboard type errors outside this slice.

## Browser Verification

Direct Chrome verification was attempted on 2026-09-03 through the required
Shopify Admin URL for `wolfpack-store-test-1`. Shopify redirected to
`/store/wolfpack-store-test-1/access_account` with “Your plan was canceled”
before the embedded app loaded, so live authenticated page navigation remains
blocked by store state.
