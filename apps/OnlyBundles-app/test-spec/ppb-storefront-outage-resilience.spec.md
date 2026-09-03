---
schema_version: 1
id: ppb-storefront-outage-resilience-test-spec
title: "Test Spec: PPB Storefront Outage Resilience"
type: test-spec
status: active
summary: Verifies that active Product Page Bundles can render, hydrate products, and add validated bundles without Wolfpack runtime requests.
last_audited: 2026-08-25
owners:
  - Wolfpack Engineering
domains:
  - storefront
systems:
  - product-page-bundle
  - shopify-storefront-api
  - cart-transform
source_paths:
  - app/assets/widgets/product-page/
  - app/services/bundles/metafield-sync/
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Architecture/Cart Transform Function.md
tags:
  - outage-resilience
  - ppb
keywords:
  - storefront snapshot
  - runtime authorization
---

# Test Spec: PPB Storefront Outage Resilience
**Spec ID:** ppb-storefront-outage-resilience  **Created:** 2026-08-25

## Purpose

Prove that the PPB storefront's required render, product-hydration, cart-add, Cart Transform, and Discount Function paths depend only on Shopify-hosted state after a successful sync.

## Test Cases

### ShopifyHostedRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Reuse public token | Existing titled Storefront token | Existing token returned | Never creates token per bundle |
| 2 | Create missing public token | No matching token | One token created and returned | Creation errors fail sync |
| 3 | Build runtime snapshot | Saved PPB controls/languages and token | Locale map and public client config | No merchant copy is invented |
| 4 | Generate CSS snapshot | Saved PPB design settings | Sanitized CSS | Fits Shopify text limit |
| 5 | Reject oversized snapshot | JSON or CSS above platform limit | Sync fails before metafieldsSet | Previous metafield remains intact |

### PpbSnapshotAndHydration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Full inline config | Schema-v3 PPB config | Widget selects bundle without config fetch | No pointer fallback |
| 2 | Malformed config | Invalid or pointer-only payload | Widget fails closed | Theme editor preview remains supported |
| 3 | Direct Shopify hydration | Authorized product GIDs | Batched Storefront nodes and paginated variants | Market and inventory fields retained |
| 4 | Storefront API failure | Shopify GraphQL error | Existing step error state | No Wolfpack fallback request |

### StaticPurchaseAuthorization

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid PPB selection | Current bundle and line tokens | Merge/discount accepted | Actual quantities drive pricing |
| 2 | Tampered line | Modified variant, role, quantity bound, or signature | Rejected | Fail closed |
| 3 | Stale policy | Token revision differs from current Shopify policy | Rejected | Protects stale browser tabs |
| 4 | Mixed group | Lines use different bundle revisions | Rejected | Prevents cross-bundle composition |
| 5 | Active FPB v1 | Existing exact-selection token | Existing behavior retained | v1 remains an active FPB contract, not a PPB fallback |
| 6 | Function input query | Required authorization and pricing selections | Calculated complexity is at most 30 | Shopify rejects queries above 30 |
| 7 | Cart Transform release artifact | Size-optimized Rust Function after Shopify CLI optimization | Artifact is less than 256,000 bytes | Reachable panic paths remain intact |

### OutageIntegration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Wolfpack origin unavailable before reload | Reject all app-origin and app-proxy requests | PPB renders, hydrates, selects, and submits cart | Analytics may fail silently |
| 2 | Shopify snapshot write fails | metafieldsSet user error | Previous snapshot remains active | Error is surfaced to sync caller |

## Acceptance Criteria

- [ ] All listed behavior tests pass.
- [ ] PPB makes no required Wolfpack request after Shopify renders the product page.
- [ ] Cart Transform and Discount Function reject unsigned, stale, or unauthorized PPB lines.
- [ ] Existing FPB runtime-token behavior remains green.
- [ ] Widget, SDK if affected, CSS, and Shopify Function artifacts build successfully.
- [ ] Cart Transform WASM remains below Shopify's 256 KB limit.
