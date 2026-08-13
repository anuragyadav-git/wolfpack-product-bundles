---
schema_version: 1
id: checkout-ui-extension
title: Checkout UI Extension
type: shopify-integration
status: authoritative
summary: Checkout Bundle and Save reactive offers plus native total-savings rendering and signed cart mutation contracts.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - checkout
systems:
  - bundle-checkout-ui
  - checkout-bundle-offer-token
source_paths:
  - extensions/bundle-checkout-ui/shopify.extension.toml
  - extensions/bundle-checkout-ui/src/BundleOffers.tsx
  - extensions/bundle-checkout-ui/src/offer-mutations.ts
  - extensions/bundle-checkout-ui/src/TotalSavings.tsx
  - app/routes/api/api.checkout-bundle-offer-token.tsx
related_docs:
  - Architecture/Cart Transform Function.md
  - Features/Pricing Pipeline.md
tags:
  - checkout
  - ui-extension
keywords:
  - Bundle and Save
  - ORDER_SUMMARY2
  - runtime token
---

# Checkout UI Extension

## Overview

The Preact extension provides one reactive `Bundle & Save` accordion on the
checkout order summary. It groups mutable add-on and gift offers by signed bundle
instance while Shopify native line properties, prices, and discount allocations
remain the pricing source of truth.

## Targets

| Purpose | Target |
|---|---|
| Reactive offers | `purchase.checkout.block.render`, recommended placement `ORDER_SUMMARY2` |
| Total savings | `purchase.checkout.reductions.render-after` |

The inert checkout cart-line and thank-you targets were removed. Order status
uses a separate `customer-account` extension type and is not part of this extension.

## Runtime Data

The extension declares two app-owned metafields in `shopify.extension.toml`:

- Variant `$app.bundle_ui_config` supplies the parent bundle's current checkout offers.
- Shop `$app.serverUrl` supplies the authenticated backend origin.

Cart Transform preserves `_wolfpackProductBundle:OfferId` and
`_wolfpack_bundle_runtime` on each merged parent. Those attributes identify the
bundle instance and provide the signed parent authorization anchor. The extension
never derives or submits a discount percentage.

## Mutation Contract

Each selection change mutates immediately:

- add: `addCartLine` at quantity `1`;
- remove: `removeCartLine` through the No add-on or unchecked gift state;
- replace or quantity change: one `updateCartLine` request containing the variant,
  quantity, and complete refreshed attribute set.

Before every mutation the extension re-reads the current cart line ID because
Shopify cart-line IDs are unstable. It obtains a checkout session token and calls
`POST /api/checkout-bundle-offer-token`. The route verifies the signed parent,
checkout shop, current active bundle/tier, variant membership, and configured
offer maximum, then returns an exact variant-and-quantity runtime token with the
server-derived discount.

After Shopify applies the line change, the extension waits for the live line and,
when a discount is expected, a refreshed native allocation. Failed API, inventory,
or allocation verification restores the previous variant, quantity, and attributes.

Existing over-limit quantities and single-select offers containing multiple distinct
variants are read-only. They are never truncated or normalized destructively.

## Read-only Pricing Statuses

Volume pricing, Buy X Get Y, and Bundle Quantity Options remain status-only rows.
The extension does not expose checkout controls that change their configuration.

## Build Rules

- API version is `2026-04`.
- Preact entry modules require a default export.
- The `export` field in `shopify.extension.toml` is unsupported for these targets.
- `network_access = true` is required for the authenticated backend request.

## Durable Gotchas

Shopify native checkout owns line properties, original/discounted prices, and
discount allocation rows. Do not reintroduce an app-calculated `Bundle Savings`,
`Actual Price`, or `Bundle Price` panel. The reductions target renders only the
aggregate `TOTAL SAVINGS` value from native allocations.

Local source and build output can differ from the extension version loaded by an
active checkout. After manual SIT deployment, confirm a fresh extension CDN URL and
test with cache bypass before treating runtime behavior as verified.
