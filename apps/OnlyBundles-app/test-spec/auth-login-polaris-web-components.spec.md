---
schema_version: 1
id: auth-login-polaris-web-components
title: Auth Login Polaris Web Components
type: test-spec
status: active
summary: Verifies that Shopify login remains functional while the standalone route drops deprecated Polaris React and its transitive icon dependency.
last_audited: 2026-09-14
owners:
  - engineering
domains:
  - authentication
  - admin
systems:
  - remix
  - polaris-app-home
source_paths:
  - app/routes/auth/auth.login/route.tsx
  - app/routes/auth/auth.login/error.server.tsx
related_docs:
  - internal docs/Shopify Integration/Admin API.md
  - internal docs/Architecture/State Management.md
tags:
  - tdd
  - shopify-native
keywords:
  - auth login
  - polaris web components
  - deprecated polaris react
---

# Test Spec: Auth Login Polaris Web Components

**Spec ID:** auth-login-polaris-web-components **Created:** 2026-09-14

## Purpose

Preserve Shopify-owned login and inline shop-domain validation while replacing
the final deprecated Polaris React surface with the globally registered Polaris
web components already loaded by the application root.

## Test Cases

### AuthLoginPolarisWebComponents

| #   | Scenario                    | Input                                 | Expected Output                                                                 | Notes                               |
| --- | --------------------------- | ------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | Login page loads            | Shopify login returns no error        | Loader returns only the normalized error object                                 | No translation bundle is required   |
| 2   | Shop domain is invalid      | Shopify returns an invalid-shop error | The shop field owns the normalized inline error                                 | Existing validation is preserved    |
| 3   | Merchant submits shop       | `shop=example.myshopify.com`          | The standard form posts to the same Remix action and delegates to Shopify login | Shopify remains the OAuth owner     |
| 4   | Login surface renders       | Loader data with no validation errors | One named shop-domain field and one submit action use Polaris web components    | Semantic output, not visual styling |
| 5   | Legacy dependency is pruned | Current application dependency graph  | Deprecated Polaris React and its transitive icon package are absent             | `polaris.js` remains root-owned     |

## Acceptance Criteria

- [x] Shopify's `login(request)` remains the loader and action owner.
- [x] Shop-domain validation remains inline on its owning field.
- [x] The route renders Polaris web components without React Polaris providers or stylesheets.
- [x] `@shopify/polaris` and `@shopify/polaris-icons` are absent from the installed dependency graph.
- [x] Focused tests, typecheck, modified-file ESLint, Knip, build, and diff checks pass.
