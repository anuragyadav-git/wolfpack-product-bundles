---
schema_version: 1
id: app-events-implementation
title: Shopify App Events Implementation Test Spec
type: test-spec
status: active
summary: Verifies redacted internal business events and optional Shopify App Events delivery without affecting merchant flows.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - observability
systems:
  - business-events
source_paths:
  - app/services/app-events.server.ts
related_docs:
  - internal docs/Operations/App Events Taxonomy.md
tags:
  - tdd
keywords:
  - app events
  - telemetry
---

# Test Spec: Shopify App Events Implementation
**Spec ID:** app-events-implementation  **Created:** 2026-06-21

## Purpose
Verify that WPB records canonical business events internally and emits eligible redacted events to Shopify App Events without affecting merchant flows.

## Test Cases

### AppEventsService
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Sanitizes attributes before persistence and delivery | Nested values, arrays, long strings, identifying keys | Only 15 scalar, redacted, 128-char-safe attributes are stored/sent | No raw PII or stacks |
| 2 | Disabled Shopify sink persists only | `SHOPIFY_APP_EVENTS_ENABLED` unset | `BusinessEvent` row is created and no network call occurs | Default local-safe behavior |
| 3 | Enabled Shopify sink posts correct payload | Valid event with `shopifyShopGid` | Token is fetched, event POST targets configured API version | Uses client credentials |
| 4 | Token cache avoids repeated auth fetches | Two events in token lifetime | Auth endpoint is called once | Short-lived bearer cache |
| 5 | Retryable Shopify responses retry without throwing | 409, 429, 5xx | Bounded retry then delivered or failed status | Merchant flow is not interrupted |
| 6 | Permanent Shopify errors mark delivery failed | 400, 401, 403 | Returns failed result and updates delivery metadata | No throw |
| 7 | Idempotency keys fit Shopify limit | Long event/shop/bundle inputs | Key is at most 64 characters | Deterministic hash fallback |
| 8 | `ensureShopIdentity` caches shop GID | Missing `Shop.shopifyShopGid` | Queries Admin once and updates Shop | Reuses cached GID later |

### Instrumentation Boundaries
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Auth lifecycle emits install vs reauth | `afterAuth` with existing/new shop | `app_installed` or `app_reauthorized` recorded | Uses shop row existence |
| 2 | Runtime widget error records redacted event | `/api/widget-error` invalid runtime report | `widget_runtime_error_reported` recorded | No raw URL/stack |
| 3 | Engagement failures report operational event | Invalid/persist-failed engagement | `engagement_failed` recorded | Success remains internal analytics |
| 4 | Managed subscription paths record verification and gates | Pricing return and entitlement assertions | Internal Business Events recorded | No meter events |
| 5 | Cart transform heal records started/success/failure | Heal API requests | Heal events recorded around service result | Non-blocking |

## Acceptance Criteria
- [ ] Unit service tests pass.
- [ ] Focused route instrumentation tests pass.
- [ ] BusinessEvent schema and migration exist.
- [ ] Shopify sink is disabled unless `SHOPIFY_APP_EVENTS_ENABLED=true`.
- [ ] App Events taxonomy doc lists implemented v1 events and env controls.
