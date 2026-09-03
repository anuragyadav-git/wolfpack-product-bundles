---
schema_version: 1
id: wolfpack-bundles-sdk-usage-guide
title: Only Bundles SDK Developer Usage Guide
type: developer-guide
status: active
summary: Records the limited-release Product Page Bundle SDK contract and points maintainers to the canonical public developer guide.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - storefront
systems:
  - bundle-sdk
source_paths:
  - apps/OnlyBundles-app/app/storefront/sdk.ts
  - apps/OnlyBundles-app/types/wolfpack-bundles.d.ts
  - apps/OnlyBundles-website/src/pages/developers/sdk.astro
related_docs:
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Architecture/Public Website.md
tags:
  - sdk
  - storefront-events
keywords:
  - WolfpackBundles
  - wbp:init-failed
---

# Only Bundles SDK — Developer Usage Guide

The canonical customer-facing guide is
`https://only-bundles-website.onlybundlesapp.workers.dev/developers/sdk/`.
This repository note records the matching engineering contract so future SDK
changes update the runtime, typings, tests, public guide, and this note together.

## Availability

The SDK is a limited-release, support-enabled capability for Product Page
Bundles on Online Store 2.0 themes. It is delivered only through the installed
theme app extension. There is no self-service Theme Editor SDK toggle, npm
package, public CDN build, Hydrogen adapter, or Full Page Bundle SDK.

Enablement requests use the support surface on the existing Only Bundles
Shopify App Store listing. The current release supports one SDK bundle per page.

## Initialization contract

The SDK reads the Shopify-hosted Product Page Bundle snapshot from the app
block. Initialization then:

1. accepts only schema version 3, `bundleType: "product_page"`, and runtime
   authorization version 2;
2. projects the active Shopify locale;
3. evaluates offer eligibility before catalog hydration;
4. loads current products and variants through the shop's Storefront API;
5. applies the standard PPB availability, inventory, price, option, image, and
   weight normalization;
6. exposes `window.WolfpackBundles` and dispatches `wbp:ready` only after the
   complete hydration succeeds.

Ineligible offers remain hidden without a failure event. Invalid snapshots,
missing Storefront runtime data, and product hydration failures remain hidden
and dispatch `wbp:init-failed` with a stable code and message.

## Public state and methods

`WolfpackBundles.state` returns frozen configuration snapshots and copied
selection maps. Hydrated steps expose product and variant catalog data; callers
cannot mutate SDK state by changing returned objects.

The stable public methods are:

- `addItem(stepId, variantId, quantity)`
- `removeItem(stepId, variantId, quantity)`
- `clearStep(stepId)`
- `validateStep(stepId)`
- `validateBundle()`
- `getDisplayPrice()`
- `addBundleToCart()`

Add and remove quantities must be positive integers. Add rejects unknown or
unavailable variants, per-product quantity violations, and quantity, amount,
weight, or category upper-bound violations without changing state. Validation
uses the same variant-to-product translation and hydrated metrics as the normal
PPB widget.

Display-price numeric fields are cents. Shopify cart and checkout remain the
source of truth. `addBundleToCart()` validates the bundle, requests the signed
Cart Transform runtime token, and then submits Shopify component lines.

## Events

| Event | Detail |
|---|---|
| `wbp:ready` | `{ bundleId, steps }` |
| `wbp:init-failed` | `{ code, message }` |
| `wbp:item-added` | `{ stepId, variantId, quantity }` |
| `wbp:item-removed` | `{ stepId, variantId, quantity }` |
| `wbp:step-cleared` | `{ stepId }` |
| `wbp:discount-tier-reached` | `{ bundleId, tierId, tierIndex, tierCount, feedbackState }` |
| `wbp:cart-success` | `{ bundleId }` |
| `wbp:cart-failed` | `{ error }` |

Initialization failure codes are `INVALID_CONFIGURATION`,
`MISSING_STOREFRONT_RUNTIME`, and `PRODUCT_HYDRATION_FAILED`.

## Safe rendering

Custom integrations must create known DOM elements and assign merchant or
Shopify product strings through `textContent`. Do not interpolate product data
into HTML strings. Register `wbp:ready` and `wbp:init-failed` listeners before
the extension initializes, then read a fresh state snapshot after every
successful mutation event.

## Release verification

Before claiming a release is ready:

- run the focused SDK tests, lint, typecheck, Remix build, widget build, CSS
  validation, generated SDK syntax check, website verification, and Graphify;
- manually deploy Shopify SIT and verify a support-enabled Product Page Bundle
  with direct Chrome DevTools on desktop and a genuinely resized 390 by 844
  window;
- cover real hydrated product/variant data, all four rule families, pricing,
  cart success and failure, and the served widget version;
- deploy the static website only after the repaired SDK is live.
