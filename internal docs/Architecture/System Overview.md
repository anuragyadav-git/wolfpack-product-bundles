---
schema_version: 1
id: system-overview
title: System Overview
type: architecture
status: authoritative
summary: High-level overview of the Only Bundles application stack, services, and deployment surfaces.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - architecture
systems:
  - application
source_paths:
  - apps/OnlyBundles-app/app/
  - apps/OnlyBundles-app/extensions/
  - apps/OnlyBundles-app/prisma/schema.prisma
  - apps/OnlyBundles-website/
related_docs:
  - Architecture/Widget Architecture.md
  - Architecture/State Management.md
  - Architecture/Database Schema.md
  - Shopify Integration/Webhooks.md
  - Shopify Integration/Sidekick.md
tags:
  - architecture
keywords:
  - system-overview
---

# System Overview

## Stack

| Layer | Technology |
|---|---|
| Framework | Remix (Shopify App template) |
| Runtime | Node.js 22 |
| Database | PostgreSQL |
| ORM | Prisma |
| Hosting | Render (app server) |
| Public website | Astro static output on Cloudflare Workers assets |
| CDN / Extensions | Shopify (via `shopify app deploy`) |
| Auth | Shopify OAuth (session-based via `@shopify/shopify-app-remix`) |

---

## Services

### App Server (Render)
- Remix SSR + API routes
- Serves admin UI (merchant dashboard)
- Receives Shopify-signed app-proxy requests and authenticated Remix webhooks
- FPB's protected configuration loader retains one `503`/`504` retry for the
  app-proxy fallback after its metafield-first path

### Shopify Extensions
Eight deployable extensions:

| Extension | Type | Description |
|---|---|---|
| `bundle-builder` | Theme App Extension | Liquid blocks, app embed, and Shopify-hosted storefront assets |
| `bundle-cart-transform-rs` | Cart Transform Function (Rust/Wasm) | Expands or merges signed bundle cart lines |
| `bundle-discount-function` | Discount Function (Rust/Wasm) | Generates bundle and add-on line discounts |
| `bundle-checkout-ui` | Checkout UI Extension (Preact) | Renders bundle offers and reduction details at checkout |
| `bundle-product-configuration` | Admin UI Extension | Links product and variant details to their bundle configuration |
| `sidekick-bundle-data` | Admin tools data extension | Provides tenant-scoped, read-only bundle discovery to Sidekick |
| `sidekick-create-bundle` | Admin intent link | Requests merchant confirmation before opening bundle creation |
| `wolfpack-utm-pixel` | Web Pixel Extension | Captures configured bundle attribution events |

### Widget Architecture
See [[Architecture/Widget Architecture]] for FPB/PDP load strategy and versioning.

---

## Key Services in `apps/OnlyBundles-app/app/services/`

- **`bundles/`**: Core bundle CRUD, settings merge, CSS generation
- **`bundles/metafield-sync/`**: Writes bundle config to Shopify metafield for zero-latency widget load
- **`subscriptions/`**: Shopify App Pricing verification and entitlement enforcement
- **`webhooks/`**: Active-topic gates, product-delete relevance, and idempotent processing after authenticated Remix ingress
- **`app-events.server.ts`**: Internal operational event recording with cached shop identity

Background Shopify Admin work obtains a client through
`unauthenticated.admin(shopDomain)` or the canonical offline-session helper; it
does not read access tokens directly from Prisma.

---

## Graph Navigation

`graphify-out/GRAPH_REPORT.md` is the generated authority for current community
hubs and high-impact nodes. Do not copy a static god-node list into this note:
the graph changes as cohesive owners are extracted. The current high-risk code
surfaces include the FPB and PPB storefront entries and built assets,
`bundle-product.server.ts`, the Cart Transform and Discount Function entries,
the configure action controller, billing, and `db.server.ts`.

Admin state is route-local React/Remix state. The removed `AppStateService` and
Redux store are not architecture nodes.

---

## Corrections vs APPLICATION_ARCHITECTURE.md

- Node.js version: doc said 18+/20+ → **actual: 22**
- The old document omits `DesignSettings`, `OrderAttribution`, and
  `BundleAnalytics`; see [[Architecture/Database Schema]] for the current model
  inventory
- `BundleStatus.unlisted` not documented
- `FullPageLayout` enum not documented
- DB schema shown in doc is outdated (Nov 2025 vs current)
