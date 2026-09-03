---
schema_version: 1
id: checkout-provider-and-bundle-cleanup
title: "Test Spec: Checkout Provider and Bundle Cleanup"
type: test-spec
status: active
summary: Verifies current provider callbacks and complete Shopify resource cleanup when bundles are deleted.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - storefront
  - admin
systems:
  - checkout-integrations
  - bundle-lifecycle
source_paths:
  - app/assets/widgets/shared/checkout-integration-adapters.ts
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - tdd
  - cleanup
keywords:
  - shopflo
  - rebuy
  - product-delete
---

# Test Spec: Checkout Provider and Bundle Cleanup
**Spec ID:** checkout-provider-and-bundle-cleanup  **Created:** 2026-08-27

## Purpose

Verify exact third-party callback contracts and prevent generated Shopify products from surviving bundle deletion.

## Test Cases

### ProviderAndCleanup

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shopflo SDK | Checkout URL | `openFloCheckout(checkoutUrl)` once | Current provider contract |
| 2 | Rebuy cart | Rebuy global | `Rebuy.Cart.getCart()` once | No root Cart fallback |
| 3 | Bundle deletion | App-owned parent product | Shopify product deleted before database row | FPB and PPB |
| 4 | Shopify cleanup failure | Product deletion user error | Database row retained and failure returned | Avoid orphaned ownership |

## Acceptance Criteria

- [ ] Provider probes use exact documented globals and arguments.
- [ ] Fallback routing remains distinguishable from successful invocation.
- [ ] Generated Shopify parent products do not survive successful bundle deletion.
