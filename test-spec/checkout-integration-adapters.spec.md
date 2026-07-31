---
schema_version: 1
id: checkout-integration-adapters
title: Checkout Integration Adapters Test Spec
type: test-spec
status: active
summary: Verifies the shared checkout provider contract, capability detection, bounded waiting, invocation, and one-shot lifecycle.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - checkout
  - integrations
systems:
  - storefront-widgets
source_paths:
  - app/lib/checkout-integrations.ts
  - app/assets/widgets/shared/checkout-integration-adapters.js
related_docs:
  - docs/competitor-analysis/checkout-integrations-additional-configurations-parity-plan.md
tags:
  - checkout
  - provider-adapters
keywords:
  - capability-detection
  - fallback
  - one-shot
---

# Test Spec: Checkout Integration Adapters

**Spec ID:** checkout-integration-adapters  **Created:** 2026-07-30

## Purpose

Keep FPB and PPB on one provider contract with deterministic capability
detection, bounded delayed-SDK handling, safe fallback metadata, and one
invocation per completed cart-add lifecycle.

## Test Cases

### CheckoutIntegrationRegistry

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Provider contract | Every provider ID | Mode, strategy, timeout, fallback, discount and refresh requirements are present | Shared by Admin and storefront |
| 2 | Checkout handoff providers | `gokwik`, `shopflo` | Third-party checkout strategy is required | Handoff providers use provider callbacks |
| 3 | Native cart strategy | Theme cart drawer | Shopify standard storefront actions are primary | `/cart` remains final fallback |
| 4 | Checkout callback execution | `shopflo`, `gokwik` | SDK callback or explicit callback path is detected | No legacy fallback into unrelated callbacks |

### CheckoutIntegrationCapability

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Standard cart actions | `Shopify.actions.openCart` | Theme cart capability available | No provider-specific global |
| 2 | Delayed provider SDK | SDK appears before timeout | Capability wait resolves available | Polling is bounded |
| 3 | Missing provider SDK | SDK never appears | Capability wait resolves unavailable | Buyer can fall back |
| 4 | Shopflo token URL | URL plus `openShopfloCheckout` | Canonical callback capability available | No token is logged |

### CheckoutIntegrationInvocation

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Repeated invocation | Same lifecycle key twice | First claim succeeds, second fails | Prevents rerender/double-click duplication |
| 2 | Theme cart invocation | Standard cart actions available | Cart updates then opens once | Errors return a typed result |
| 3 | Provider callback throws | Throwing SDK | Failure result identifies invocation phase | Caller applies configured fallback |
| 4 | Provider callback rejects | Rejected SDK promise | Failure result identifies invocation phase | Buyer never remains stuck |
| 5 | Provider callback times out | Pending SDK promise beyond provider timeout | Failure result identifies invocation timeout | Caller applies configured fallback |
| 6 | Provider reports blocked navigation | SDK resolves `false` | Failure result identifies blocked invocation | Covers popup/navigation refusal |

## Acceptance Criteria

- [x] One canonical provider registry supplies Admin and storefront metadata.
- [x] Every provider has explicit timeout and fallback behavior.
- [x] Shopflo prioritizes its documented checkout-URL flow.
- [x] Theme cart prioritizes Shopify standard storefront actions.
- [x] Delayed SDK detection is bounded.
- [x] Provider invocation is bounded and reports rejection, timeout, or blocked navigation.
- [x] Repeated lifecycle invocation is rejected.
- [x] Focused tests pass.
