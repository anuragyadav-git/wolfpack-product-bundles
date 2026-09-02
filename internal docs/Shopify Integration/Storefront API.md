---
schema_version: 1
id: shopify-storefront-api
title: Shopify Storefront API Notes
type: reference
status: authoritative
summary: Storefront GraphQL contracts used for product data, Shop Brand colors, and bundle runtime behavior.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - storefront
  - shopify
systems:
  - storefront-api
source_paths:
  - app/routes/api/api.storefront-products.tsx
  - app/routes/api/api.storefront-collections.tsx
  - app/routes/api/api.cart-bundle-details.tsx
  - app/services/theme-colors.server.ts
  - app/lib/shop-brand-colors.ts
  - app/assets/widgets/product-page/storefront-client.ts
  - app/services/ppb-storefront-runtime.server.ts
related_docs:
  - Architecture/Widget Architecture.md
  - Architecture/Storefront Outage Resilience.md
tags:
  - graphql
  - shop-brand
keywords:
  - BrandColors
  - BrandColorGroup
---

# Shopify Storefront API Notes

## Inventory-bearing product responses

The signed `/api/storefront-products` route returns Shopify Storefront API
availability and `quantityAvailable` alongside product merchandising data.
Because the same response drives out-of-stock enforcement and low-stock alerts,
it uses `Cache-Control: no-store`; browser or shared-proxy caching can otherwise
continue presenting an untracked or stale quantity after Shopify inventory has
changed. The route still batches product nodes and paginates variants through
Shopify's native Storefront context.

## Parent-product PPB direct client

Bundle sync ensures one public Storefront access token titled
`Wolfpack PPB Storefront Runtime` and stores it with API version `2026-07` in
shop `$app.ppb_storefront_runtime`. The parent-product PPB client sends that
public token directly to `https://{shop}/api/2026-07/graphql.json`.

Product nodes are requested in batches of 50. The first 250 variants arrive
with each product; products with more variants continue through explicit cursor
pagination. Queries use Shopify market context and return live availability,
inventory, prices, compare-at prices, options, images, and weight. A GraphQL or
transport failure has no Wolfpack fallback.

The same direct client reads and merges cart `$app.bundle_details` with
`cartMetafieldsSet`. Shopify's Storefront schema requires
`[CartMetafieldsSetInput!]!` for this mutation. This mutation is attribution
only; Shopify documents that it does not itself trigger Functions.

## Product descriptions

Use `Product.descriptionHtml` when rendering merchant-authored product descriptions in storefront UI. Shopify documents `Product.description` as the plain string with HTML tags removed, while `Product.descriptionHtml` is the HTML scalar that preserves merchant formatting such as bold and italic text.

For product detail modals, query and preserve both fields:

- `descriptionHtml` is the primary render source.
- `description` remains the plain-text fallback when HTML is absent.

## Shop Brand color inheritance

Settings -> Design reads `shop.brand.colors` through Shopify's native
unauthenticated Storefront context. Signed app-proxy product, collection, and
cart-metafield routes use the Storefront context returned by
`authenticate.public.appProxy(request)`. That server-side context is separate
from the intentionally public token synchronized for the parent-product PPB
browser client. `BrandColors.primary` and
`BrandColors.secondary` are
ordered lists of `BrandColorGroup` values; Wolfpack selects only index `0` from
each list and requires both its `background` and `foreground` values.

The cached `DesignSettings.themeColors` JSON shape is:

```json
{
  "primary": { "background": "#123456", "foreground": "#ffffff" },
  "secondary": { "background": "#e8eef5", "foreground": "#17202a" },
  "syncedAt": "2026-08-23T00:00:00.000Z"
}
```

The old flat active-theme cache is not a valid Shop Brand cache. Settings load,
install/auth, and bundle sync overwrite it after a successful Brand query. A
failed or empty query clears the cache so inherited Design fields use canonical
template defaults instead of stale colors.

Color resolution is shared by Admin preview and storefront runtime: an explicit
component value wins, then the appropriate primary or secondary Brand pair,
then the canonical field default. Primary owns principal actions, active and
completed states, and filled progress. Secondary owns shells, empty and inactive
states, and their associated foregrounds or borders. Success, error, loading,
media, and decorative colors retain their template defaults unless assigned one
of those semantic roles.
