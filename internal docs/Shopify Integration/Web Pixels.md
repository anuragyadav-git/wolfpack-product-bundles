---
schema_version: 1
id: shopify-web-pixels
title: Shopify Web Pixels
type: shopify-integration
status: authoritative
summary: Documents the canonical Shopify Web Pixel event and settings contracts used by Wolfpack attribution.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - analytics
  - shopify-integration
systems:
  - web-pixels
  - order-attribution
source_paths:
  - extensions/wolfpack-utm-pixel/src/index.ts
  - app/routes/api/api.attribution.tsx
related_docs:
  - internal docs/Architecture/Database Schema.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - analytics
  - attribution
keywords:
  - checkout-completed
  - line-item-properties
---

# Shopify Web Pixels

## Settings Payload Gotchas

Shopify validates every configured Web Pixel setting on `webPixelCreate`.
For `single_line_text_field` settings, a blank string can be rejected even when
the extension TOML does not define an explicit `min` validation. On
2026-07-11, `custom_utm_parameters: ""` failed activation with:

```text
[custom_utm_parameters] - can't be blank.
```

Wolfpack sends `custom_utm_parameters: "__none__"` when the merchant has not
configured custom UTM attributes. This keeps the Shopify setting nonblank while
remaining an invalid parameter name for the pixel runtime parser, so no custom
attributes are tracked until the merchant saves real parameter names.

When real custom names exist, `activateUtmPixel` sends them comma-separated,
for example:

```text
utm_influencer,partner_id
```

The runtime parser in `extensions/wolfpack-utm-pixel/src/index.ts` still owns
normalization and safety filtering for captured custom names.

## Offer Attribution Through Checkout Line Properties

Shopify's `checkout_completed` standard event exposes `CheckoutLineItem.properties`
and component properties for stores on Checkout Extensibility. Wolfpack uses those
Shopify-owned line properties as the completed-order transport for the app-owned,
privacy-safe dimensions `offerPolicyId`, `offerRuleVersion`, `offerTierId`, and
`offerEligibilitySource`.

The storefront nests a normalized `offerAnalytics` object inside the existing
private `_bundle_display_properties` JSON line property. The Cart Transform
emits one `_wpb_offer_analytics` JSON property on a merged parent line; unmerged
component lines, including subscription lines, retain the nested display
envelope. The Web Pixel forwards both top-level and component property arrays to
`/api/attribution`. The server accepts dimensions only when the nested
`bundleId` matches the bundle being attributed, then applies the shared
normalization allowlist. Raw link tokens, customer identifiers, customer tags,
purchase history, full URLs, and arbitrary eligibility labels are never part of
this transport.

When Shopify does not expose properties or a bundle was added without offer
metadata, attribution still succeeds and all offer dimensions remain null.

Official reference: [Shopify `checkout_completed` Web Pixel event](https://shopify.dev/docs/api/web-pixels-api/standard-events/checkout_completed).
