---
schema_version: 1
id: webhook-ingress-filtering
title: Webhook Ingress Filtering Test Spec
type: test-spec
status: active
summary: Verifies that Shopify-authenticated, supported, and bundle-relevant webhooks enter durable Inngest processing through Remix.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - remix-webhook-route
  - inngest
source_paths:
  - app/routes/api/webhooks.tsx
  - app/services/webhooks/topics.ts
  - app/services/webhooks/product-delete-relevance.server.ts
  - shopify.web.toml
related_docs:
  - internal docs/Shopify Integration/Webhooks.md
tags:
  - tdd
  - webhooks
keywords:
  - products/delete
  - ingress filtering
---

# Test Spec: Webhook Ingress Filtering

**Spec ID:** webhook-ingress-filtering  **Created:** 2026-08-31

## Purpose

Ensure retired or unknown Shopify topics never reach Inngest, and ensure
`products/delete` reaches Inngest only when the deleted product is referenced by
a Wolfpack bundle in the delivering shop.

## Test Cases

### WebhookIngressFiltering

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Authentication rejection | Invalid Shopify signature | Shopify authentication response propagates | No custom HMAC implementation |
| 2 | Supported lifecycle topic | Authenticated `APP_SCOPES_UPDATE` webhook | One awaited `shopify/webhook` event | No product lookup |
| 3 | Every active topic | Each configured operational and compliance topic | One durable Inngest event | Topic normalized for the existing processor |
| 4 | Retired topic | Authenticated removed billing, product, inventory, or order topic | HTTP 200 and no Inngest event | Drop before enqueue |
| 5 | Unknown topic | Authenticated unsupported topic | HTTP 200 and no Inngest event | Do not persist unhandled traffic |
| 6 | Irrelevant product deletion | Product ID has no shop-scoped `StepProduct` reference | HTTP 200 and no Inngest event | One indexed lookup |
| 7 | Relevant product deletion | Product ID has a shop-scoped `StepProduct` reference | One awaited `shopify/webhook` event | Existing cleanup handler remains authoritative |
| 8 | Relevance lookup failure | Database lookup throws | One `shopify/webhook` event | Fail open so a relevant deletion is not lost |
| 9 | Enqueue failure | Inngest rejects the event | Retryable HTTP 503 | Shopify retries delivery |
| 10 | Duplicate delivery | Same webhook ID reaches processor twice | Handler executes once | Existing processor idempotency remains authoritative |
| 11 | App configuration ownership | SIT and production webhook subscriptions | Every subscription URI is exactly `/webhooks` | Prevents a return to the retired external worker |
| 12 | Local dev webhook target | Shopify CLI sends its sample uninstall webhook | `shopify.web.toml` routes it to `/webhooks` | Keeps the CLI probe on the authenticated Remix ingress |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Shopify Remix owns webhook authentication
- [x] Supported topic definitions have one shared owner
- [x] No standalone worker or direct-processing fallback remains
- [x] Product deletion lookup is scoped by shop and product ID
- [x] SIT and production webhook subscriptions resolve through Remix `/webhooks`
- [x] Shopify CLI's local webhook probe resolves through Remix `/webhooks`
