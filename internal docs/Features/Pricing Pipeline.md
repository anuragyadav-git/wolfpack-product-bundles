---
schema_version: 1
id: pricing-pipeline
title: Pricing Pipeline
type: feature
status: authoritative
summary: Defines canonical minor-unit pricing, presentment-currency handling, discount operators, and checkout ownership.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - pricing
systems:
  - storefront-api
  - cart-transform
source_paths:
  - app/assets/widgets/shared/currency-manager.ts
  - app/assets/widgets/shared/components/product-card.ts
  - app/assets/widgets/shared/pricing-calculator.ts
  - app/assets/widgets/shared/template-manager.ts
  - app/assets/widgets/full-page/methods/validation-addons-methods.ts
  - app/assets/widgets/full-page/modal/variant-methods.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
  - app/services/bundles/metafield-sync/utils/price-adjustment.ts
  - extensions/bundle-cart-transform-rs/src/run.rs
related_docs:
  - internal docs/Architecture/Cart Transform Function.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - money
  - discounts
keywords:
  - MoneyV2
  - presentment currency
  - minor units
---

# Pricing Pipeline

## Unit and Currency Contract

All runtime arithmetic uses integer minor units. Shopify Storefront API
`MoneyV2` values are parsed from decimal amounts into minor units while keeping
their `currencyCode`. Those product prices are already market-contextual and
must not be converted again.

Merchant-authored absolute thresholds, fixed discounts, and fixed bundle prices
are saved in the shop's base currency. The storefront applies Shopify's
presentment rate exactly once before comparing or calculating them. Percentage
values and quantities are not currency-converted. The converted value remains
in minor units through calculation and message generation.

Display formatting, including product and compare-at prices rendered by the
shared product card, uses `Intl.NumberFormat` with the preserved presentment
currency code. Do not restore a manual symbol table, theme money-format parser,
`Shopify.currency.convert` fallback, or a hardcoded display-currency fallback.
The FPB product-details modal follows the same owner directly rather than
calling an optional widget formatter. Amount-based add-on eligibility is also
merchant-authored base-currency data: convert its threshold once before
comparing it with the presentment subtotal, then format the remaining amount
through `Intl.NumberFormat`.
The direct Product Page block and the owned app-embed marker expose Shopify
Liquid's base and customer currency codes. A non-base market additionally
requires Shopify's positive presentment rate. Missing base currency, customer
currency, or rate fails closed instead of assuming USD or rate `1`.

Bundle totals require the canonical bundle `steps` array. A missing or malformed
steps contract fails closed instead of falling back to a step-agnostic subtotal;
that fallback could charge for a display-free gift and conceal incomplete
storefront hydration.

## Pricing Rules

The derived storefront pricing ABI accepts only `gte`, `gt`, `lte`, `lt`, and
`eq`. Missing operators default to `gte`; unknown or long-form aliases fail
closed. `eq` is threshold semantics for pricing and therefore qualifies at or
above the target. Step-condition operators are a separate long-form contract
and continue to be evaluated by the step condition validator.

Every save-time and Sync Bundle serializer validates rules through the shared
flat-rule parser before writing `$app.bundle_ui_config` or the Cart Transform
price-adjustment metafield. The serialized rule preserves its canonical
`conditionOperator`; it does not reconstruct nested `condition` or `discount`
objects and does not read the retired `value` or `price` aliases.

Supported discount methods are:

- `percentage_off`
- `fixed_amount_off`
- `fixed_bundle_price`
- `buy_x_get_y`

For `fixed_bundle_price`, `discountValue` is the only stored target-price field.
Do not write or read a duplicate `fixedBundlePrice`; Cart Transform derives the
required percentage decrease from the canonical target price and Shopify's
presentment totals.

The widget selects the highest qualifying tier and clamps discounts so they do
not exceed the selected component total. Buy-X-Get-Y uses the configured item
selection mode and discounts only complete qualifying groups.

Discount-tier feedback consumes the same current runtime owner:
`selectedBundle.pricing.rules`, with flat condition fields and the canonical
rule `id`. It does not read `bundleData`, `discountConfiguration`, nested
`condition` objects, or `ruleId` aliases. The app's Sync Bundle action is the
upgrade path for stale storefront configuration.

## Shopify Checkout Ownership

The storefront estimate is explanatory UI. The Cart Transform and Discount
Functions are the independent checkout enforcement boundary, using the signed
runtime configuration and the same canonical minor-unit values. Checkout
allocation and order-attribution code must consume Shopify-calculated monetary
sets rather than reverse-engineering storefront display strings.

Tests for pricing changes must cover base and non-base markets, all five
pricing operators, all four methods, rounding at minor-unit boundaries, and
checkout allocation parity.
