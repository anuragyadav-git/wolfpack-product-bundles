---
schema_version: 1
id: wpb-metafield-design-consumption
title: Metafield Design and Consumption
type: architecture-diagram
status: authoritative
summary: Maps current product-variant, CartTransform, cart, and order metafield ownership without a Shopify Page data path.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - metafields
  - storefront-sync
systems:
  - Shopify Admin API
  - Shopify Functions
  - Shopify Cart
source_paths:
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/services/cart-transform-service.server.ts
  - app/routes/api/api.cart-bundle-details.tsx
  - extensions/bundle-cart-transform-rs/src/run.graphql
related_docs:
  - ../../Shopify Integration/Metafields.md
  - ../Cart Transform Function.md
tags:
  - architecture
  - metafields
keywords:
  - bundle_ui_config
  - component_reference
  - runtime_configuration
  - bundle_details
---

# Metafield Design and Consumption

```mermaid
flowchart LR
    Sync[Storefront sync service] --> VariantWriter[Bundle product metafield writer]
    VariantWriter -->|metafieldsSet| Variant[(Bundle ProductVariant metafields)]
    Variant --> Ppb[PPB Liquid bootstrap]
    Variant --> Transform[Cart Transform Function]

    Setup[CartTransform setup service] -->|metafieldsSet| CT[(CartTransform metafields)]
    CT --> Transform
    CT --> Discount[Discount Function]

    Details[Signed cart bundle-details route] -->|cartMetafieldsSet| Cart[(Cart bundle_details)]
    Cart -->|cart_to_order_copyable| Order[(Order bundle_details)]
```

## Ownership and lifecycle

| Owner | Namespace/key | Primary writer | Primary consumer |
|---|---|---|---|
| Bundle ProductVariant | `$app.bundle_ui_config` | Bundle product metafield writer | PPB Liquid bootstrap |
| Bundle ProductVariant | `$app.component_reference`, `$app.component_quantities` | Bundle product metafield writer | Cart Transform |
| Bundle ProductVariant | `$app.price_adjustment`, `$app.component_pricing` | Bundle product metafield writer | Cart Transform |
| CartTransform | `$app.runtime_configuration` | CartTransform setup service | Cart Transform secret and cart-line messaging |
| Discount | `$app.runtime_token_secret` | Discount setup service | Discount Function |
| Cart | `$app.bundle_details` | Signed app-proxy route | Shopify cart-to-order copy pipeline |
| Order | `$app.bundle_details` | Shopify cart-to-order copy | Order surfaces and downstream integrations |

FPB configuration is supplied by the app-proxy document and its bundle API fallback. There is no Page metafield writer or Page-owned FPB runtime configuration.
