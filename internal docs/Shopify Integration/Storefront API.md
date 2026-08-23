---
schema_version: 1
id: shopify-storefront-api
title: Shopify Storefront API Notes
type: reference
status: authoritative
summary: Storefront GraphQL contracts used for product data, Shop Brand colors, and bundle runtime behavior.
last_audited: 2026-08-23
owners:
  - engineering
domains:
  - storefront
  - shopify
systems:
  - storefront-api
source_paths:
  - app/services/storefront-token.server.ts
  - app/services/theme-colors.server.ts
  - app/lib/shop-brand-colors.ts
related_docs:
  - Architecture/Widget Architecture.md
tags:
  - graphql
  - shop-brand
keywords:
  - BrandColors
  - BrandColorGroup
---

# Shopify Storefront API Notes

## Product descriptions

Use `Product.descriptionHtml` when rendering merchant-authored product descriptions in storefront UI. Shopify documents `Product.description` as the plain string with HTML tags removed, while `Product.descriptionHtml` is the HTML scalar that preserves merchant formatting such as bold and italic text.

For product detail modals, query and preserve both fields:

- `descriptionHtml` is the primary render source.
- `description` remains the plain-text fallback when HTML is absent.

## Shop Brand color inheritance

Settings -> Design reads `shop.brand.colors` through the existing delegated
Storefront access token. `BrandColors.primary` and `BrandColors.secondary` are
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
