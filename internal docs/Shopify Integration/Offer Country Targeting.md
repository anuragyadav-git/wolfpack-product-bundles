---
schema_version: 1
id: offer-country-targeting
title: Offer Country Targeting
type: shopify-integration
status: authoritative
summary: Defines Shopify-selected country as the canonical geography signal for bundle offer eligibility and rejects unstable market identifiers and IP inference.
last_audited: 2026-09-14
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
Shopify Function localization country against the authorized offer rule. Browser
visibility and a previously issued token do not prove present checkout eligibility.

The signed Function token encodes the normalized rule as one internal
`countryRule` string (`include:CA,US`, `exclude:US`, or empty when disabled).
This is an authorization contract, not the merchant persistence model.

Direct parent EXPAND reads an explicit `countryRule` in the app-owned
`price_adjustment` JSON and compares it with `localization.country.isoCode`.
Missing or invalid parent policy produces no expansion. Optional display data
in `component_pricing` remains separate: its absence must not erase an otherwise
valid country policy. Critical parent pricing JSON is bounded to 10,000 UTF-8
bytes before publication because Shopify omits oversized Function metafields.
This contract requires bundle synchronization; there is no reader for an older
parent policy without `countryRule`.

Both FPB and PPB save/sync config builders must pass the complete `offerPolicy`
to the metafield writer. `offerDelivery` is a storefront decision marker and is
not a substitute for the source policy. The FPB builder also preserves shop
identity and subscription configuration needed by authorization consumers.

PPB static policy revisions include canonical schedule settings in addition to
pricing, country, subscription and selection bounds. Priority and countdown
presentation do not change that revision. Runtime token issuance rejects
unavailable bundle statuses and inactive or malformed schedules before signing.
Existing-cart expiry is enforced by the wired native scheduled Discount Function,
not by issuance alone. Its owners use Shopify dates and local-time predicates.
Both Functions require the current policy revision and pricing ownership mode.

The Cart Transform query costs 26 after reading quantities from critical pricing
and removing unused Function display data. Public quantity and display metafields
remain published. Local schema/compiler tests do not replace Shopify-hosted
expiry, country-switch and checkout QA before release.
