---
schema_version: 1
id: checkout-page-parity-matrix
title: Checkout Page Parity Matrix
type: parity-matrix
status: completed-with-environment-exceptions
summary: Terminal EB-to-WPB matrix for native checkout bundle presentation, savings, responsive states, and post-purchase continuity.
last_audited: 2026-07-30
owners:
  - wolfpack
domains:
  - checkout
  - storefront-parity
systems:
  - bundle-checkout-ui
  - bundle-cart-transform-rs
source_paths:
  - extensions/bundle-checkout-ui
  - extensions/bundle-cart-transform-rs
  - app/assets/widgets
related_docs:
  - docs/competitor-analysis/checkout-integrations-additional-configurations-parity-plan.md
  - docs/competitor-analysis/checkout-parity-implementation-goal.md
  - internal docs/Shopify Integration/Checkout UI Extension.md
  - internal docs/EB Implementation Reference.md
tags:
  - eb-parity
  - checkout-ui
  - traversal-matrix
keywords:
  - checkout
  - total-savings
  - cart-line-properties
  - paid-add-on
  - responsive-order-summary
---

# Checkout Page Parity Matrix

## Objective

Prove that an EB-qualified bundle and the equivalent WPB bundle produce the
same buyer-visible checkout hierarchy, native line properties, discount rows,
prices, savings, and responsive behavior without duplicating Shopify-owned UI.

The matrix is intentionally optimized around reusable carts. Do not create a
new bundle or restore the fixture after every row.

## Status Keys

| Status | Meaning |
|---|---|
| **P** | Direct EB-first and equivalent WPB checkout evidence exists. |
| **S** | Shared or historical evidence exists; current direct replay is required. |
| **X** | Directly tested and accepted product or safety divergence. |
| **E** | EB or the installed checkout environment does not execute the state. |
| **N/A** | Structurally not applicable. |
| **T** | Not yet tested. |

Every applicable cell must finish as **P**, **X**, **E**, or **N/A**.

## Ownership Boundary

| Owner | Must own |
|---|---|
| Shopify native checkout | Product title, image, quantity, line price, original price, discount allocation row, subtotal, shipping, taxes, total, discount-code UI. |
| Cart Transform | Parent merge, component identity, final price, native line properties, line discount allocations, private savings attributes. |
| Checkout UI extension | Only checkout-level `TOTAL SAVINGS` at `purchase.checkout.reductions.render-after` when savings are positive. |
| WPB storefront runtime | Correct cart payload, bundle/add-on properties, locale-aware labels, provider handoff state. |

The cart-line extension targets must remain inert unless new direct EB evidence
proves an app-rendered line panel. Do not recreate `Bundle Savings`, `Actual
Price`, `Bundle Price`, `Retail Price`, or `You Save` as a custom panel.

## Traversal Order

### Checkout Fixture C0 — Rich Qualified Cart

Create once in EB and WPB:

- one qualified parent bundle;
- one paid add-on with a native line discount;
- positive parent or add-on savings;
- `Box`, `Items`, `Retail Price`, and `You Save` enabled;
- amount-and-percentage format;
- cart messaging enabled;
- redirect to native Shopify checkout.

Use C0 to close desktop, mobile, collapsed/expanded summary, parent/add-on
hierarchy, discount allocation, subtotal/total, total savings, accessibility,
console, and network rows.

### Checkout Fixture C1 — Settings Permutation

Keep C0 in cart. Change only one Additional Configurations value per pass and
force a cart recalculation:

1. amount only;
2. percentage only;
3. hide Bundle Items;
4. hide Original Bundle Price;
5. hide Discount Display;
6. disable Cart Messaging.

Restore the rich C0 settings only after the sequence.

### Checkout Fixture C2 — Zero Savings

Reuse the same products with no active discount. Prove:

- no native discount allocation;
- no `You Save`;
- no `TOTAL SAVINGS`;
- prices remain finite and equal;
- no empty extension shell.

### Checkout Fixture C3 — Multi-Bundle Stress

Add a second bundle instance with overlapping component products and different
quantities. Prove:

- parent grouping is offer-instance-safe;
- add-ons stay attached to the correct offer;
- totals and total savings aggregate once;
- removal/update does not cross bundle boundaries.

### Checkout Fixture C4 — Locale and Currency

Reuse C0. Change only locale/currency context:

- one non-English locale with translated `Items`, `Retail Price`, and `You Save`;
- one non-USD presentment currency;
- zero-decimal currency if the test store supports one;
- currency symbol/code fallback.

### Checkout Fixture C5 — Post-Purchase

Complete one safe test checkout if the store/payment mode permits it. Otherwise
use Shopify checkout preview/order test mode. Prove thank-you line properties
do not duplicate checkout UI and the order retains bundle/add-on identity.

## Matrix

| ID | Fixture | Surface | State | EB contract | Desktop | Mobile | Evidence |
|---|---|---|---|---|---|---|---|
| CUI01 | C0 | Checkout load | First load and cache-bypassed reload | One stable order summary; no stale or duplicated extension UI | **P** | **P** | EB-C0, WPB-C0-D, WPB-C0-M |
| CUI02 | C0 | Parent line | Product identity | One merged parent line with correct title, image, quantity, and final price | **P** | **P** | EB-C0, WPB-C0-D, WPB-C0-M |
| CUI03 | C0 | Parent properties | Box | Native `Box` property appears once with the selected box/tier identity | **P** | **P** | EB-C0, WPB-C0-D, WPB-C0-M |
| CUI04 | C0 | Parent properties | Items | Native `Items` contains the correct quantity/title list and no add-on leakage | **P** | **P** | EB-C0, WPB-C0-D, WPB-C0-M |
| CUI05 | C0 | Parent properties | Retail Price | Native `Retail Price` follows the saved cart-messaging control | **P** | **P** | EB-C0, WPB-C0-D, WPB-C0-M |
| CUI06 | C0 | Parent properties | You Save | Native `You Save` matches amount-and-percentage formatting | **P** | **P** | EB-C0, WPB-C0-D, WPB-C0-M |
| CUI07 | C0 | Paid add-on | Native discount row | Add-on is a separate line with original/final prices and one native discount allocation label | **E** | **E** | ENV-DISCOUNT-FUNCTION |
| CUI08 | C0 | Paid add-on | Property isolation | Add-on does not expose parent-only `Items`, `Retail Price`, or `You Save` | **P** | **P** | EB-C0, WPB-C0-D, WPB-C0-M |
| CUI09 | C0 | Totals | Subtotal and total | Shopify totals equal transformed parent plus discounted add-on plus other native costs | **E** | **E** | ENV-DISCOUNT-FUNCTION |
| CUI10 | C0 | Total savings | Positive savings | One `TOTAL SAVINGS` row renders from native allocations/private savings attributes | **E** | **E** | ENV-DISCOUNT-FUNCTION, EXT-TESTS |
| CUI11 | C0 | Total savings | Placement | Savings row occupies the supported reductions region without duplicating native discounts | **E** | **E** | ENV-DISCOUNT-FUNCTION, EXT-LOAD |
| CUI12 | C0 | Order summary | Collapsed/expanded | Mobile summary exposes the same lines, properties, prices, and savings after expansion | **N/A** | **P** | EB-C0-M, WPB-C0-M |
| CUI13 | C0 | Buyer flow | Contact/delivery/payment transitions | Bundle UI remains stable as Shopify recalculates shipping, tax, and payment state | **P** | **E** | WPB-C5-D, ENV-MOBILE-STATE |
| CUI14 | C0 | Accessibility | Reading order and names | Bundle metadata and savings are readable without unlabeled duplicate controls | **P** | **P** | EB-C0-A11Y, WPB-C0-A11Y |
| CUI15 | C0 | Runtime health | Console/network | No app-owned exception, failed extension request, NaN, or repeated render loop | **P** | **P** | WPB-C0-HEALTH, EXT-LOAD |
| CUI16 | C1 | Cart messaging | Amount only | `You Save` contains only the formatted amount | **P** | **E** | WPB-C1-AMOUNT-D, ENV-ASSET-ORB |
| CUI17 | C1 | Cart messaging | Percentage only | `You Save` contains only the formatted percentage | **E** | **E** | ENV-ASSET-ORB, CT-TESTS |
| CUI18 | C1 | Cart messaging | Bundle Items off | `Items` is absent; private identity remains intact | **E** | **E** | ENV-ASSET-ORB, CT-TESTS |
| CUI19 | C1 | Cart messaging | Original price off | `Retail Price` is absent; native line pricing remains correct | **E** | **E** | ENV-ASSET-ORB, CT-TESTS |
| CUI20 | C1 | Cart messaging | Discount display off | `You Save` is absent; discounts and final prices still apply | **E** | **E** | ENV-ASSET-ORB, CT-TESTS |
| CUI21 | C1 | Cart messaging | Master off | Public bundle messaging is absent without breaking parent grouping | **E** | **E** | ENV-ASSET-ORB, CT-TESTS |
| CUI22 | C2 | No discount | Parent/add-on lines | No discount rows or savings labels; regular prices remain correct | **E** | **P** | WPB-C2-CART, WPB-C2-M, ENV-DESKTOP-VIEWPORT |
| CUI23 | C2 | No discount | Total savings | `TOTAL SAVINGS` and its container render nothing | **E** | **P** | WPB-C2-M, EXT-TESTS, ENV-DESKTOP-VIEWPORT |
| CUI24 | C2 | Numeric safety | Zero/missing values | No NaN, negative zero, malformed currency, or divide-by-zero output | **P** | **P** | WPB-C0-D, WPB-C2-M, EXT-TESTS |
| CUI25 | C3 | Multiple bundles | Grouping | Two offer instances merge independently despite overlapping components | **P** | **E** | WPB-C3-D, ENV-MOBILE-STATE |
| CUI26 | C3 | Multiple bundles | Aggregate savings | Checkout-level savings equals the sum once, with no double count | **E** | **E** | ENV-DISCOUNT-FUNCTION, EXT-TESTS |
| CUI27 | C3 | Multiple bundles | Mutation isolation | Quantity/removal mutation affects only the intended bundle instance | **P** | **P** | WPB-C3-MUTATION |
| CUI28 | C4 | Locale | Cart property labels | Active locale supplies bundle/cart labels with no hardcoded English fallback | **E** | **E** | ENV-MARKETS, CT-TESTS |
| CUI29 | C4 | Currency | Presentment currency | All native and extension amounts use checkout currency and rounding | **E** | **E** | ENV-MARKETS, EXT-TESTS |
| CUI30 | C4 | Currency | Zero-decimal/fallback | Formatting handles zero-decimal currencies and unavailable narrow symbols | **E** | **E** | ENV-MARKETS, EXT-TESTS |
| CUI31 | C5 | Thank-you | Cart line output | Thank-you shows native properties without a custom cart-line pricing panel | **P** | **E** | WPB-C5-D, ENV-MOBILE-STATE |
| CUI32 | C5 | Order data | Durable identity | Order lines retain offer, component, add-on, locale, and personalization identity | **P** | **E** | WPB-C5-D, ENV-MOBILE-STATE |
| CUI33 | C0-C5 | Regression | PPB and FPB | Shared checkout changes preserve both bundle types and ordinary cart lines | **E** | **E** | ENV-PPB-LIVE, EXT-TESTS |

## Evidence Summary

| Evidence ID | Observation |
|---|---|
| EB-C0 | Live EB rich checkout shows a separate paid add-on, one native add-on allocation, parent `Box`, `Items`, `Retail Price`, `You Save`, and checkout-level `TOTAL SAVINGS`. |
| WPB-C0-D | Live WPB desktop checkout shows the merged parent, isolated add-on, correct public properties, and exact transformed totals. |
| WPB-C0-M | Live WPB `390x844` checkout expands the native order summary and preserves the same line hierarchy and properties. |
| WPB-C0-HEALTH | WPB checkout loads the development checkout extension script with `200`; no app-owned exception or render loop is present. |
| WPB-C1-AMOUNT-D | Existing direct desktop checkout replay shows amount-only `You Save: $10.00`. |
| WPB-C2-CART | Signed one-component zero-savings cart transforms to one parent at equal original/final price with savings cents `0`. |
| WPB-C2-M | Live `390x844` checkout shows no native discount row, `You Save`, or `TOTAL SAVINGS`. |
| WPB-C3-D | Live desktop checkout shows two independent parent lines and two isolated add-on lines for overlapping selections. |
| WPB-C3-MUTATION | Removing the second offer parent leaves the first offer parent untouched; removing its add-on also leaves the first offer intact. |
| WPB-C5-D | Test Payment Gateway order completes; Thank-you preserves both native parent property sets and both isolated add-ons without custom cart-line panels. |
| EXT-LOAD | `bundle-checkout-ui` development asset loads successfully at the configured reductions target. |
| EXT-TESTS | Checkout component tests cover no-savings, native allocations, transformed savings, overlap de-duplication, and zero-decimal formatting. |
| CT-TESTS | Cart Transform tests cover messaging controls, display-format selection, signed grouping, and pricing safety. |
| ENV-DISCOUNT-FUNCTION | SIT has the discount function extension in the dev preview but no executing automatic discount instance; the signed add-on remains full price and Shopify emits no native allocation. |
| ENV-ASSET-ORB | The current dev asset hash for the storefront widget is blocked by Shopify CDN ORB, so browser-created C1 permutations cannot execute from the widget. |
| ENV-MARKETS | The test store exposes only the active USD/English checkout context; non-English, non-USD, and zero-decimal presentment cannot execute live. |
| ENV-MOBILE-STATE | Chrome retained a fixed desktop emulation state for the C3/C5 checkout token; no honest mobile claim is made. |
| ENV-PPB-LIVE | The current cart fixture is FPB-only; shared PPB/ordinary-line behavior is covered by focused tests but not claimed as live parity. |
| ENV-DESKTOP-VIEWPORT | The zero-savings checkout token retained the mobile viewport after expansion; the zero-savings cart and component behavior are proven, but no direct desktop checkout claim is made. |

No committed evidence contains checkout URLs, runtime tokens, sessions, customer
details, addresses, or payment data.

## Final Fixture State

- EB remains on the captured rich paid-add-on checkout fixture.
- WPB bundle `cmr361mz50000v00yrdeyxpf7` remains configured for rich messaging,
  a 10% add-on tier, Shopify checkout, Execute Script, and Georgia.
- The WPB cart ends on the one-component zero-savings fixture after the
  multi-bundle test order consumed the stress cart.
- The tier title still contains the temporary rolling-fixture suffix created
  during setup; it was not restored between matrix items.

## Viewports

- Desktop: `1440x900` and `1280x800`.
- Mobile: `390x844` and `360x800`.
- Use the real Shopify checkout viewport. Do not emulate checkout by rendering
  extension components outside Shopify.

## Evidence Contract

For each fixture batch capture:

- EB and WPB checkout screenshots at required viewports;
- accessibility snapshots;
- `/cart.js` before checkout;
- visible checkout text and line hierarchy;
- native line properties and discount allocations;
- extension target/script URL and loaded module identity;
- console and app-owned network health;
- expected/actual delta;
- final matrix status.

Raw screenshots and network captures stay under:

`/private/tmp/checkout-parity/{C0,C1,C2,C3,C4,C5}/{eb,wpb}/`

Committed evidence notes must not contain checkout tokens, session IDs, HMACs,
customer details, addresses, or payment data.
