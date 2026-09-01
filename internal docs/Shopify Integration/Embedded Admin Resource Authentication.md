---
schema_version: 1
id: embedded-admin-resource-authentication
title: Embedded Admin Resource Authentication
type: integration-reference
status: authoritative
summary: Documents the Shopify ID-token boundary for embedded Admin resource downloads and backend requests.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
systems:
  - app-bridge
source_paths:
  - app/routes/app/app.offer-operations.tsx
  - app/lib/offer-policy-csv-download.client.ts
related_docs:
  - Shopify Integration/Admin API.md
tags:
  - authentication
  - app-bridge
keywords:
  - resource fetching
  - id token
---

# Embedded Admin Resource Authentication

Embedded Admin backend requests must use Shopify App Bridge's Resource Fetching
API. A standard browser `fetch()` to the configured app domain is intercepted by
App Bridge and receives a fresh OpenID Connect ID token in the `Authorization`
header. The backend continues to authenticate the loader or action with
`authenticate.admin(request)`.

Do not implement an authenticated file download as a plain relative anchor from
inside the cross-origin app iframe. The navigation does not carry the App Bridge
ID-token header, so an authenticated Remix loader can respond with `302` to
`/auth/login`. Fetch the file through the intercepted standard `fetch()` path,
turn the successful response into an object URL, trigger the browser download,
and revoke the object URL afterward.

Do not cache or manually persist the short-lived ID token. Call `shopify.idToken()`
directly only for transports outside standard fetch interception, such as a
WebSocket.
