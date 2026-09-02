---
schema_version: 1
id: offer-country-targeting
title: Offer Country Targeting
type: shopify-integration
status: authoritative
summary: Defines Shopify-selected country as the canonical geography signal for bundle offer eligibility and rejects unstable market identifiers and IP inference.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - offers
  - storefront
systems:
  - offer-policy
  - theme-app-extension
  - cart-transform
source_paths:
  - prisma/schema.prisma
  - app/lib/offer-country-targeting.ts
  - app/lib/offer-country-eligibility.ts
  - app/lib/offer-country-liquid-guard.server.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-cart-transform-rs/src/run.graphql
  - extensions/bundle-discount-function/src/cart_lines_discounts_generate_run.graphql
related_docs:
  - internal docs/Shopify Integration/Cart Transform API.md
  - internal docs/Architecture/Widget Architecture.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - localization
  - eligibility
  - shopify-markets
keywords:
  - localization country iso code
  - country targeting
  - market identifiers
---

# Offer Country Targeting

## Canonical Shopify Signal

Bundle offer geography uses the storefront's currently selected ISO country
from `localization.country.iso_code`. Shopify Liquid owns this context and its
country selector changes. Wolfpack does not infer a visitor's location from an
IP address and does not add `read_markets` merely to decide storefront offer
eligibility.

Shopify now warns that market IDs and handles are not stable targeting
identifiers. A buyer can match parent and child markets, while deprecated
single-market surfaces return only the most specific match. Adding a child
market can therefore change the returned ID or handle without changing the
merchant's intended regional audience. Persist ISO country codes, not market
IDs, handles, or display names.

## Persistence

`OfferPolicy` owns direct fields:

- `countryTargetingEnabled`, default `false`;
- `countryTargetingMode`, `include` or `exclude`; and
- `countryCodes`, canonical unique uppercase two-letter codes.

Disabled targeting retains its configured mode and country list but is inert.
This is configuration state, not a copied Shopify customer, market, or order
record.

## Runtime Boundary

Liquid passes only the current country code into the storefront runtime. The
public bundle configuration can contain configured country codes because they
are offer configuration, not customer data. The widget may use that context to
avoid rendering an ineligible offer, but a browser decision is never checkout
authorization.

Cart Transform and Discount Function behavior must independently compare the
Shopify Function localization country against the signed offer rule. The Cart
Transform input query is already at Shopify's calculated complexity limit of
30, so an existing selected line attribute must be consolidated before adding
the country leaf. Do not exceed the limit or introduce an unsigned cart-line
eligibility flag.

The signed Function token encodes the normalized rule as one internal
`countryRule` string (`include:CA,US`, `exclude:US`, or empty when disabled).
This is a size-conscious authorization ABI, not the merchant persistence
model. Both Functions fail closed for malformed non-empty rules.

The Cart Transform query obtains the canonical country from
`localization.country.isoCode`. To keep the query at complexity 30, the bundle
name travels inside the existing signed `_bundle_display_properties` envelope
instead of consuming a separate `_bundleName` attribute leaf. Shopify CLI must
successfully build both Functions after any change to this contract; a local
GraphQL parser alone does not prove Shopify accepts the query complexity.

## Identity Boundary

Country targeting does not authorize customer-tag or purchase-history access.
Those features retain their separate protected-customer-data gate. Do not add
`read_customers`, query Customer records, or persist raw customer facts as part
of this country slice.
