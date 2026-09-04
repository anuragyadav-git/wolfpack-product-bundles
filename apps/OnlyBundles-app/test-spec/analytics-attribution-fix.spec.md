---
schema_version: 1
id: analytics-attribution-fix
title: Analytics Attribution Fix and Orders Backfill
type: test-spec
status: active
summary: Verifies Shopify-native checkout and revenue reconciliation for bundle orders missed by the Web Pixel.
last_audited: 2026-09-04
owners:
  - engineering
domains:
  - analytics
systems:
  - order-attribution
  - shopify-admin-graphql
source_paths:
  - apps/OnlyBundles-app/app/services/analytics/order-backfill.server.ts
  - apps/OnlyBundles-app/app/lib/analytics/bundle-matcher.server.ts
related_docs:
  - internal docs/Shopify Integration/Web Pixels.md
tags:
  - analytics
  - orders
keywords:
  - checked-out
  - revenue
---

# Test Spec: Analytics Attribution Fix + Orders Backfill

**Spec ID:** analytics-attribution-fix
**Created:** 2026-07-01

## Purpose

Analytics dashboard was showing $0 revenue despite paid orders. Root causes:
1. **Fix B** — product-ID format mismatch between what the pixel sends (numeric) and what the DB stores (GID) causes bundle matching to fail silently, leaving `bundleId=null` on every attribution row.
2. **Fix A/C** — pixel derives `shopId` from `document.location.hostname` which can be null or the wrong domain in Shopify's checkout sandbox, causing rows to be lost or written under the wrong shop.
3. **Safety net** — Shopify Orders GraphQL backfill so revenue attribution can be reconciled from the source of truth even if the pixel fails.
4. **Historical identity** — reconciliation must use Shopify's preserved line-item custom attributes and the signed Wolfpack runtime token before consulting current bundle configuration. Product matching alone cannot identify an order after its bundle is deleted.
5. **Historical date** — reconciled rows must retain Shopify's order `createdAt`; using the backfill execution time puts revenue in the wrong reporting period.

## Test Cases

### bundle-matcher

The shared helper that both `/api/attribution` and the backfill service use to match line-item product IDs against bundles.

| # | Scenario | Input | Expected Output | Notes |
|---|----------|-------|-----------------|-------|
| 1 | Direct match on bundle container (GID input) | `lineItems = [{productId: "gid://shopify/Product/100"}]`, DB has `Bundle.shopifyProductId = "gid://shopify/Product/100"` | `bundleIds = ["bundle-1"]` | Pass 1 — Cart Transform MERGE case |
| 2 | Direct match on bundle container (numeric input) | `lineItems = [{productId: "100"}]`, DB has `Bundle.shopifyProductId = "gid://shopify/Product/100"` | `bundleIds = ["bundle-1"]` | Normalization required |
| 3 | Component-product fallback (Pass 2) | `lineItems = [{productId: "gid://shopify/Product/500"}]`, DB has `StepProduct.productId = "gid://shopify/Product/500"` linked to bundle-2 | `bundleIds = ["bundle-2"]` | Pass 2 — flat orders, PPB, pre-sync |
| 4 | No line items | `lineItems = []` | `bundleIds = []` | Empty input |
| 5 | Line items without productId | `lineItems = [{productId: null}, {productId: undefined}]` | `bundleIds = []` | Filter out |
| 6 | Mixed direct + component match, Pass 1 wins | `lineItems = [bundle-A container, bundle-B component]`, both in DB | `bundleIds = ["bundle-A"]` only | Pass 2 does NOT run if Pass 1 finds any |
| 7 | Wrong shop | `lineItems = [{productId: "100"}]`, bundle exists but under different shopId | `bundleIds = []` | Shop scoping |
| 8 | Multiple bundles matched in Pass 1 | 2 bundle containers in cart | `bundleIds = ["bundle-A", "bundle-B"]` | Deduped, all returned |
| 9 | Two component products for same bundle (Pass 2) | `lineItems = [{productId: "500"}, {productId: "501"}]` — both StepProducts of bundle-2 | `bundleIds = ["bundle-2"]` | Distinct on bundleId |

### order-backfill

Service that queries Shopify Orders GraphQL and populates `OrderAttribution` for orders missed by the pixel.

| # | Scenario | Setup | Expected Output | Notes |
|---|----------|-------|-----------------|-------|
| 1 | Backfill creates rows for new orders | 3 orders in Shopify, 0 in DB | 3 rows created (one per bundle match, or one with null bundleId per non-bundle order) | Baseline |
| 2 | Idempotent second run | 3 orders in Shopify, 3 already in DB (same orderId) | 0 new rows created | Uses pre-check on existing orderIds |
| 3 | Cursor pagination | Shopify returns 2 pages | Both pages processed | `pageInfo.hasNextPage` loop |
| 4 | Order without customerJourneySummary UTMs | Shopify returns `customerJourneySummary: null` | Row created with `utmSource=null` etc, revenue populated | Non-UTM orders still recorded |
| 5 | Order with no bundle match | Line items don't match any bundle | 1 row created with `bundleId=null` | Non-bundle order tracked |
| 6 | Empty date range | No orders in Shopify | 0 rows created, no errors | Empty page handled |
| 7 | Bundle match via component product | Order contains a StepProduct of bundle-X | 1 row created with `bundleId="bundle-X"` | Uses shared matcher |
| 8 | Revenue converted to cents | Shopify `totalPriceSet.shopMoney.amount = "195.29"` | DB row has `revenue = 19529` | Multiply by 100, round |
| 9 | Deleted bundle is identified from the signed runtime token | Shopify line item has `_wolfpack_bundle_runtime`; current bundle/product rows no longer exist | Row uses the verified token's historical `bundleId` | Shopify order custom attributes are the durable source |
| 10 | Invalid runtime token is ignored | Shopify line item has a tampered runtime token | Fall back to current product matching | Never trust unsigned cart input |
| 11 | Historical checkout date is retained | Shopify order was created on July 30 and backfill runs on September 4 | Row `createdAt` is July 30 | Keeps the order in its actual reporting window |
| 12 | Existing null attribution is repaired | A prior pixel/backfill row exists for the order with `bundleId=null`, and the signed token identifies the bundle | Existing row is updated with the historical bundle ID | Makes the fix effective for already-ingested orders |

## Acceptance Criteria

- [x] All bundle-matcher tests pass
- [x] All order-backfill tests pass
- [x] `api.attribution.tsx` uses the shared matcher (no inline duplicate)
- [x] Zero new ESLint errors on modified files
- [x] Pixel setting `shop_domain` declared in TOML and read in `index.ts`
- [x] `activateUtmPixel` signature accepts `shopDomain` and all 3 call sites pass `session.shop`
- [x] Backfill UI button renders on Analytics page and dispatches `intent=backfill`
- [x] Shopify Orders query requests `lineItems.customAttributes`
- [x] Signed runtime identity takes precedence over mutable current bundle configuration
- [x] Reconciled rows retain the Shopify order creation timestamp
- [x] Existing null attribution rows can be repaired idempotently

## Out of Scope

- Automated cron/schedule for backfill (manual button only in this pass)
- Prisma schema migration for compound unique index — using pre-check dedup instead (simpler)
- Field-testing pixel deploy — user runs `npm run deploy:sit` per CLAUDE.md
