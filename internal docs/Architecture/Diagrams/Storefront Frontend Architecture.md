---
schema_version: 1
id: wpb-storefront-frontend
title: Storefront Frontend Architecture
type: architecture-diagram
status: authoritative
summary: Maps the Page-free FPB app-proxy host and the PPB product-block host to their shared storefront runtime.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - storefront
  - frontend
systems:
  - Shopify theme
  - theme-extension
  - app-proxy
source_paths:
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
  - app/routes/root/wpb.$bundleId.tsx
  - app/assets/bundle-widget-full-page.ts
  - app/assets/bundle-widget-product-page.ts
related_docs:
  - ../Widget Architecture.md
  - Metafield Design and Consumption.md
tags:
  - architecture
  - storefront
keywords:
  - FPB
  - PPB
  - asset_url
  - app proxy
---

# Storefront Frontend Architecture

```mermaid
flowchart TD
    Customer[Customer browser]

    subgraph Theme[Shopify theme and extension]
        Embed[Wolfpack app embed]
        PPB[Product-page app block]
        Assets[Shopify asset_url JS and CSS]
    end

    subgraph Proxy[Signed Remix app proxy]
        FpbDocument[FPB Liquid document and complete marker]
        BundleAPI[Bundle JSON fallback]
        TokenAPI[Runtime token]
        DetailsAPI[Cart bundle details]
    end

    subgraph Runtime[Browser runtime]
        Detect[Detect bundle type]
        Hydrate[Hydrate configuration]
        Render[Responsive widget renderer]
        Submit[Cart submission]
    end

    Cart[Shopify Cart]

    Customer --> FpbDocument
    Customer --> PPB
    FpbDocument --> Embed
    Embed --> Assets
    PPB --> Assets
    FpbDocument --> Detect
    PPB --> Detect
    Detect --> Hydrate
    Hydrate -. malformed or absent marker .-> BundleAPI
    Assets --> Render
    Hydrate --> Render
    Render --> Submit
    Submit --> TokenAPI
    Submit --> DetailsAPI
    Submit --> Cart
```

## Runtime boundaries

- FPB is hosted only by the signed app-proxy Liquid document; it does not require a Shopify Page or Page block.
- The FPB app-proxy marker contains the complete current configuration. The bundle JSON API is the existing fallback when that marker is absent or malformed.
- PPB remains product-hosted and merchant-positioned through `bundle-product-page.liquid`.
- The app embed and product-page block load deployable JS and CSS through Shopify `asset_url`.
- Browser selection state is storefront-local. Cart authorization is requested immediately before adding lines.
