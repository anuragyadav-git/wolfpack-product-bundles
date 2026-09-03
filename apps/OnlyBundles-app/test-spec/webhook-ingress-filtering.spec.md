---
schema_version: 1
id: webhook-ingress-filtering
title: Webhook Ingress Filtering Test Spec
type: test-spec
status: active
summary: Verifies that only supported and bundle-relevant Shopify webhooks enter Inngest processing.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - webhook-worker
  - inngest
source_paths:
  - app/services/webhook-worker.server.ts
  - app/services/webhooks/topics.ts
  - app/services/webhooks/product-delete-relevance.server.ts
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
| 1 | Supported lifecycle topic | Valid signed `app/scopes_update` webhook | One `shopify/webhook` event | No product lookup |
| 2 | Retired topic | Valid signed removed billing, product, inventory, or order topic | HTTP 200 and no Inngest event | Drop before payload decoding |
| 3 | Unknown topic | Valid signed unsupported topic | HTTP 200 and no Inngest event | Do not persist unhandled traffic |
| 4 | Irrelevant product deletion | Product ID has no shop-scoped `StepProduct` reference | HTTP 200 and no Inngest event | One indexed lookup |
| 5 | Relevant product deletion | Product ID has a shop-scoped `StepProduct` reference | One `shopify/webhook` event | Existing cleanup handler remains authoritative |
| 6 | Relevance lookup failure | Database lookup throws | One `shopify/webhook` event | Fail open so a relevant deletion is not lost |
| 7 | Processor defense | Unsupported event reaches the function directly | No payload persistence or handler call | Last-line protection |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Supported topic definitions have one shared owner
- [x] No retired product-update, order-create, or Pub/Sub handler path remains
- [x] Product deletion lookup is scoped by shop and product ID
