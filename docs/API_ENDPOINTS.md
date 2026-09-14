---
schema_version: 1
id: api-endpoints-reference
title: API Endpoints Reference
type: reference
status: active
summary: Points to the canonical application route catalog and records the authentication owner for each externally reachable route family.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - application-architecture
systems:
  - remix-routes
  - shopify-authentication
source_paths:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
  - apps/OnlyBundles-app/app/routes
  - apps/OnlyBundles-app/app/shopify.server.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Shopify Integration/Webhooks.md
tags:
  - api
  - routes
keywords:
  - app proxy
  - authenticate.admin
  - authenticate.webhook
---

# API Endpoints Reference

The exact, current route inventory is maintained in
[`APP_NAVIGATION_MAP.md`](app-nav-map/APP_NAVIGATION_MAP.md#4-api-routes-reference).
This file keeps its established path for inbound documentation links without
duplicating that route catalog.

## Authentication ownership

| Route family | Canonical owner | Shop identity |
| --- | --- | --- |
| Embedded Admin loaders and actions under `/app` | `authenticate.admin(request)` | Authenticated Admin session |
| Storefront paths under `/apps/product-bundles` | `authenticate.public.appProxy(request)` | Verified app-proxy session; never a path or query-string shop value |
| `/webhooks` | `authenticate.webhook(request)` | Verified Shopify webhook context |
| `/api/checkout-bundle-offer-token` | Checkout session-token authentication | Verified checkout session |
| `/api/inngest` | Inngest request handler | Inngest signing contract |
| `/health` | Public readiness check | No tenant data |

Individual routes with narrower authorization or validation requirements are
documented beside their entry in the navigation map and in their owning route
tests. A route must not infer tenant identity from caller-controlled input when
Shopify supplies a verified session.

## Storefront delivery contracts

- FPB bundle configuration loads from the Liquid-provided app metafield first
  and the signed app-proxy bundle route second.
- PPB product hydration uses Shopify Storefront API data with its returned
  `MoneyV2.currencyCode`; incomplete hydration blocks selection and add to cart.
- PPB design CSS is synchronized to `$app.ppb_storefront_css` and rendered by
  the theme app extension. There is no dynamic design-settings endpoint.
- PPB embed runtime configuration is synchronized to
  `$app.ppb_storefront_runtime`.

## Retired routes and contracts

Do not restore any of these removed interfaces:

- unauthenticated `/api/bundles.json` discovery;
- `/api/design-settings/:shopDomain` dynamic CSS;
- shop-domain path parameters for Controls or Language settings;
- standalone webhook-worker ingress or manual webhook HMAC verification;
- caller-provided `shop` query parameters as an authentication mechanism.

When a route is added, removed, renamed, or changes authentication ownership,
update the navigation map first and then revise this security summary only if a
route family or delivery contract changed.
