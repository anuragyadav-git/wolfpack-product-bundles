---
schema_version: 1
id: checkout-integrations-additional-configurations-parity-plan
title: Checkout Integrations and Additional Configurations Parity Plan
type: implementation-plan
status: completed-with-environment-exceptions
summary: Implemented EB-first checkout provider, Integrations Hub, and Additional Configurations parity with terminal live-environment decisions.
last_audited: 2026-07-30
owners:
  - wolfpack
domains:
  - checkout
  - integrations
  - admin-settings
systems:
  - bundle-checkout-ui
  - checkout-integrations
  - settings-controls
source_paths:
  - app/lib/checkout-integrations.ts
  - app/lib/admin-configuration-surfaces.ts
  - app/routes/app/app.integrations.tsx
  - app/routes/app/app.settings
  - extensions/bundle-checkout-ui
related_docs:
  - docs/competitor-analysis/checkout-page-parity-matrix.md
  - docs/competitor-analysis/checkout-parity-implementation-goal.md
  - internal docs/EB Integrations Reference.md
  - internal docs/Shopify Integration/Checkout UI Extension.md
tags:
  - eb-parity
  - checkout-integrations
  - additional-configurations
keywords:
  - GoKwik
  - Shopflo
  - checkout-provider-adapter
  - Integrations Hub
  - Additional Configurations
---

# Checkout Integrations and Additional Configurations Parity Plan

## Goal

Deliver complete EB-first parity for:

1. bundle presentation in Shopify checkout;
2. checkout and side-cart handoff providers;
3. the Integrations Hub;
4. the full Additional Configurations Admin surface.

Checkout correctness takes priority over visual additions. Shopify-native
checkout output remains the source of truth wherever EB also uses native UI.

## Confirmed Current Evidence

### EB Integrations Hub

Live EB on 2026-07-30 still exposes:

- Pre-orders, Pickup & Delivery: Stoq, Zapiet.
- Subscriptions: Skio, Appstle, Bold.
- Reviews: Judge.me.
- Page Builders: PageFly, GemPages.
- Checkout: GoKwik, Shopflo.
- `Request Integration`.
- `View Setup` on every card.
- Zapiet setup through chat; the other captured cards use setup articles.

### EB Additional Configurations

Live EB on 2026-07-30 confirmed:

- dedicated `Additional Configurations` route with Back action;
- layout selector for Landing Page Layout and Product Page Layout;
- Landing tabs: Configuration, CSS & Scripts, Integrations, Advanced;
- Product Page tabs: Configuration, CSS & Scripts;
- cart messaging and three discount formats;
- checkout/redirect settings and Execute Script;
- theme integration script;
- developer-only cart selectors/script;
- Judge.me toggle and public token;
- inventory `Know More` article and its tracked/untracked behavior.

### Current WPB

WPB already has:

- a two-card GoKwik/Shopflo checkout Integrations page;
- a ten-provider checkout registry;
- provider normalization and discount-code classification;
- Additional Configurations field models for both layouts;
- post-add provider callbacks;
- checkout-integration discount-code service;
- native checkout line properties and a reductions-target total-savings extension.

The work must consolidate these into one explicit provider contract and remove
gaps between visible Admin controls, saved runtime values, storefront behavior,
and checkout outcomes.

## Internet Research Baseline

Refresh these sources at implementation time:

- Shopify Checkout UI targets:
  `https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets`
- Shopify order-summary targets:
  `https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets/checkout/order-summary`
- Shopify standard storefront actions:
  `https://shopify.dev/docs/storefronts/themes/best-practices/standard-actions`
- Shopflo Token API:
  `https://shopflo.com/help/token-api`
- Shopflo custom Shopify checkout:
  `https://intercom.help/shopflo-a9de00772be8/en/articles/15896402-shopflo-checkout-custom-shopify`
- Rebuy cart refresh integration:
  `https://help.rebuyengine.com/en/articles/6120657-how-to-add-rebuy-to-a-native-cart-flyout-drawer-or-modal`
- Fastrr platform configuration:
  `https://support.shiprocket.in/support/solutions/articles/152000000916-sr-checkout-platform`
- GoKwik Shopify product contract:
  `https://www.gokwik.co/product/shopify`

Current research implications:

- Prefer `Shopify.actions.updateCart()` and `Shopify.actions.openCart()` for
  native/theme cart behavior when available.
- Do not replace a provider’s documented token/checkout-URL flow with a guessed
  global callback.
- Treat legacy globals captured from EB as compatibility adapters, not the
  canonical abstraction.
- Provider availability, timeout, rejection, popup blocking, and partial SDK
  load must have deterministic fallback behavior.

## Architecture Decision

Create one provider-adapter contract owned by `app/lib/checkout-integrations.ts`
and consumed by FPB and PPB post-add flows.

Each provider record must define:

- stable ID and merchant label;
- mode: native checkout, cart page, theme cart, provider checkout, cart refresh;
- availability detector;
- invocation strategy;
- whether a Shopify discount-code handoff is required;
- discount-code transport method;
- timeout;
- success signal;
- failure/fallback action;
- cart refresh requirement;
- test fixture requirements;
- documentation/setup destination.

No provider-specific branching should remain duplicated across FPB and PPB
widget methods.

## Provider Matrix

| Provider | Mode | Primary contract | Discount handoff | Required fallback | Live proof |
|---|---|---|---|---|---|
| Shopify checkout | Native checkout | Shopify checkout URL/redirect | Native cart state | Cart page with visible error | Required |
| Theme cart drawer | Side cart | `Shopify.actions.updateCart/openCart` first | None | `/cart` | Required on Dawn plus one non-Dawn theme if available |
| GoKwik | Accelerated checkout | Installed GoKwik checkout adapter; refresh current official contract | Required | Shopify checkout | Required only if installed; otherwise terminal environment evidence |
| Shopflo | Accelerated checkout | Current checkout URL/token flow or installed SDK adapter | Required | Shopify checkout | Required only if installed; otherwise terminal environment evidence |
| Zecpay | Accelerated checkout | Current installed provider adapter | Required | Shopify checkout | Required only if installed |
| Shiprocket / Fastrr | Accelerated checkout | Current installed checkout adapter | Required | Shopify checkout | Required only if installed |
| Rebuy | Cart refresh | Rebuy cart refresh event/API | None | Shopify standard cart action, then `/cart` | Required only if installed |
| Monster cart | Side cart | Installed Monster adapter | None | Shopify standard cart action, then `/cart` | Required only if installed |
| Upcart | Side cart | Installed Upcart adapter | None | Shopify standard cart action, then `/cart` | Required only if installed |
| Kaching Cart | Side cart | Installed Kaching adapter | None | Shopify standard cart action, then `/cart` | Required only if installed |
| Custom script | Merchant callback | Saved script through bounded post-add lifecycle | Depends on selected provider | Configured native redirect | Required with safe SIT fixture |

Do not mark an unavailable third-party provider as proven. Use **E** for an
environment where EB/WPB cannot execute it and retain focused adapter tests.

## Workstream A — Checkout Page UI

Execute `checkout-page-parity-matrix.md` in its defined fixture order.

Implementation rules:

- keep cart-line extension targets inert;
- keep `TOTAL SAVINGS` at reductions-after only;
- use checkout currency and supported Preact hooks;
- never read customer/payment data for parity;
- never add a panel because source code historically contained one;
- prove desktop and mobile order-summary behavior.

## Workstream B — Checkout Provider Runtime

### B1. Normalize provider contracts

- Replace label/string branching with provider IDs.
- Make FPB and PPB consume the same adapter.
- Add capability detection and bounded timeouts.
- Prevent double invocation on repeated clicks, rerenders, or cart retries.
- Preserve the one-shot Execute Script lifecycle.

### B2. Make discount handoff atomic

- Create a discount code only for providers that bypass Shopify-native pricing.
- Complete cart mutation before requesting the code.
- Pass code/state by the provider-supported transport.
- Revoke or expire failed handoffs where supported.
- Never generate a code for side-cart/cart-refresh providers.
- Log only non-sensitive provider ID, phase, result, and error category.

### B3. Fallback behavior

For every provider test:

1. unavailable SDK;
2. SDK appears after delay;
3. callback throws;
4. callback rejects;
5. callback times out;
6. popup/navigation blocked;
7. discount endpoint fails;
8. cart refresh fails.

Fallback must preserve the added bundle and send the buyer to the configured
native cart/checkout rather than leaving the page stuck.

### B4. End-to-end proof

For each executable provider:

- add a valid FPB bundle;
- repeat with PPB;
- prove one cart mutation;
- prove one provider invocation;
- prove discount state where required;
- prove bundle/add-on metadata at the destination;
- prove back navigation does not invoke again.

## Workstream C — Integrations Hub

### C1. Visual parity

Match EB’s:

- page heading/subtitle/action;
- category cards and descriptions;
- integration tile density, logo sizing, hierarchy, and CTA placement;
- desktop and mobile responsive grids;
- keyboard order, names, focus, and external-link behavior.

Use Polaris web components wherever an equivalent exists. Custom CSS may own
the responsive card grid.

### C2. Functional parity

- `Request Integration` opens a WPB-owned request/contact flow.
- Guide cards open WPB-owned docs, never EB URLs.
- Chat-type integrations visibly distinguish assisted setup.
- Cards show support status: Supported, Guided setup, Assisted setup, Planned.
- Do not claim an integration is connected merely because its card exists.
- Do not emit vendor-intent notifications without explicit merchant action.

### C3. Inventory scope

Implement all ten EB cards as documentation/supportability inventory, but only
mark runtime support where WPB has proof:

- Stoq, Zapiet;
- Skio, Appstle, Bold;
- Judge.me;
- PageFly, GemPages;
- GoKwik, Shopflo.

The checkout provider registry may remain broader than the hub cards. The hub
is a merchant guidance surface; the registry is a runtime adapter surface.

## Workstream D — Additional Configurations Full Parity

This is included as a complete workstream, not an untracked bonus.

### D1. Shell and navigation

- Dedicated route/view with Back action.
- `Additional Configurations` title.
- App Configurations heading and description.
- Layout selector.
- Correct tab availability by layout.
- Desktop sidebar and mobile disclosure behavior.
- Deep-linkable layout/tab/group state.
- Unsaved-change protection when switching layout/tab/back.

### D2. Landing Page Layout

#### Configuration

- Show Compare At Price.
- Hide Irrelevant variant images.
- Track inventory on Add To Cart plus full help content.
- Redirect Collection Page Quick Add.
- Cart Messaging master and Edit Language.
- Bundle Items.
- Original Bundle Price.
- Discount Display.
- Three discount formats and examples.
- Redirect to Checkout / Redirect to Cart.
- Checkout Integration provider.
- Execute Script.
- Custom Font and theme-font default.

#### CSS & Scripts

- Bundle builder CSS.
- Dummy product CSS.
- Theme-page CSS.
- Scoped selector guidance using WPB-owned classes.
- Bundle-page script.
- Button selectors.
- Add-to-cart selector.
- Buy-now selector.

#### Integrations

- Custom theme integration enable/script.
- Cart integration enable.
- Cart item selector.
- Parent remove selector.
- remove selector.
- quantity button selector.
- custom cart integration script.
- Judge.me enable/public token.
- developer-only warning and secret-safe input behavior.

#### Advanced

- Video player logo.
- Background color.
- File upload.
- Update action.
- Loading, success, failure, replace, and persistence states.

### D3. Product Page Layout

#### Configuration

- Hide Out Of Stock Products.
- Track inventory on Add To Cart.
- Auto-add after final step.
- Empty state boxes from condition.
- Hide completed step titles.
- Add when card clicked.
- Redirect collection Quick Add.
- Cart Messaging and discount formats.
- Default side-cart update / checkout / cart redirect.
- Execute Script.

#### CSS & Scripts

- Product-page bundle CSS.
- post-load script.
- side-cart selector and section ID.
- cart-page selector and section ID.
- side-cart open selector.
- product-page price selector.

### D4. Behavior and persistence

For every field:

- load persisted value;
- edit;
- dirty state;
- save request shape;
- success/error feedback;
- hard reload persistence;
- storefront/cart/checkout effect;
- discard;
- dependency-disable behavior;
- locale behavior where applicable.

Use one rolling settings fixture. Remove incompatible values and add only the
current row’s values; do not restore the entire fixture after every field.

### D5. Security

- Never execute merchant scripts in Admin preview.
- Treat scripts and selectors as untrusted strings.
- Never expose Judge.me tokens in logs or client loader payloads beyond the
  authenticated settings surface.
- Confirm Content Security Policy and storefront injection ownership.
- Add explicit warnings before enabling global theme CSS or scripts.

## TDD and Validation

Write behavior tests before implementation for:

- provider normalization and adapter selection;
- provider availability/fallback;
- discount-code eligibility and handoff;
- one-shot callback lifecycle;
- settings load/save/runtime mapping;
- dependency behavior;
- integration card destinations/status;
- checkout total-savings calculations.

Do not write CSS, class-name, source-order, or pixel-contract unit tests.
Visual parity is proven with direct Chrome DevTools MCP.

Required validation:

- focused Jest tests;
- Rust Cart Transform tests when checkout metadata changes;
- checkout extension TypeScript and Shopify component validation;
- ESLint on modified files;
- widget/SDK/checkout builds as applicable;
- `git diff --check`;
- `npm run graphify:rebuild`;
- desktop/mobile EB/WPB browser replay.

## Evidence and Commit Strategy

Commit by bounded group:

1. checkout matrix baseline and ownership corrections;
2. provider adapter/runtime;
3. discount handoff/fallback;
4. Integrations Hub;
5. Additional Configurations shell and Landing Configuration;
6. CSS & Scripts and Integrations tabs;
7. Advanced and Product Page Layout;
8. final cross-surface regression.

Each commit must include only its source, generated assets, tests/specs,
matrix/evidence updates, and graph output. Preserve unrelated working-tree
changes.

## Completion Gates

The work is complete only when:

- every checkout matrix cell is terminal;
- every provider row is terminal with direct proof or environment evidence;
- all ten Integration Hub cards have accurate support status and setup action;
- every Additional Configurations field has persistence and runtime evidence;
- desktop/mobile visual parity is complete;
- FPB, PPB, ordinary products, and no-discount carts regress cleanly;
- no sensitive checkout or provider data is committed;
- both EB and WPB fixtures are left in a documented stable state.

## Implementation Result

### Refreshed Official Contracts

| Source | Audited | Applied contract | Confidence |
|---|---|---|---|
| `https://shopify.dev/docs/api/checkout-ui-extensions/latest/targets` | 2026-07-30 | `purchase.checkout.reductions.render-after` owns the single checkout-level savings row; cart-line targets remain inert. | High |
| `https://shopify.dev/docs/storefronts/themes/best-practices/standard-actions` | 2026-07-30 | Prefer `Shopify.actions.updateCart()` and `openCart()`; handle `userErrors` and bound failures. | High |
| `https://shopflo.com/help/token-api` | 2026-07-30 | Require backend token/checkout URL plus `Shopflo.openFloCheckout(url)`; do not invoke the undocumented legacy callback. | High |
| `https://www.gokwik.co/platform/shopify` | 2026-07-30 | Treat GoKwik as an installed checkout capability with native Shopify fallback when unavailable. | Medium |
| `https://help.rebuyengine.com/en/articles/6120657-how-to-add-rebuy-to-a-native-cart-flyout-drawer-or-modal` | 2026-07-30 | Treat Rebuy as cart refresh, not checkout redirect. | Medium |
| `https://support.shiprocket.in/support/solutions/articles/152000000916-sr-checkout-platform` | 2026-07-30 | Keep Shiprocket/Fastrr behind installed capability detection and native checkout fallback. | Medium |

### Provider Terminal Matrix

Contract tests cover normalization, capability detection, delayed SDK
availability, one-shot lifecycle, invocation success, throw/rejection, timeout,
blocked navigation, cart-refresh rejection, discount eligibility, and fallback
metadata.

| Provider | Contract | Live | Evidence or terminal reason |
|---|---|---|---|
| Shopify checkout | **P** | **P** | Rich, zero-savings, stress, and test-order checkouts complete through Shopify. |
| Theme cart drawer | **P** | **E** | Standard Actions contract passes; the available SIT theme checkout fixture does not expose a replayable drawer destination. |
| GoKwik | **P** | **E** | Provider SDK is not installed in the available store. |
| Shopflo | **P** | **E** | Canonical checkout-URL flow is enforced; Shopflo SDK/token backend is not installed. |
| Zecpay | **P** | **E** | Provider SDK is not installed. |
| Shiprocket / Fastrr | **P** | **E** | Provider SDK is not installed. |
| Rebuy | **P** | **E** | Rebuy cart runtime is not installed. |
| Monster cart | **P** | **E** | No installed Monster cart capability is present. |
| Upcart | **P** | **E** | Upcart SDK is not installed. |
| Kaching Cart | **P** | **E** | Kaching cart API is not installed. |
| Custom script | **P** | **E** | One-shot behavior is covered; the Shopify CDN ORB block prevents a fresh widget-created live invocation. |

### Integrations Hub Terminal Matrix

Desktop and mobile traversal expose five categories and ten cards in the EB
order. Every setup action is merchant-initiated, uses a WPB-owned destination,
and displays supportability rather than connection state.

| Card | Admin | Status contract | Setup action |
|---|---|---|---|
| Stoq | **P** | Planned | **P** |
| Zapiet | **P** | Assisted setup | **P** |
| Skio | **P** | Guided setup | **P** |
| Appstle | **P** | Guided setup | **P** |
| Bold | **P** | Guided setup | **P** |
| Judge.me | **P** | Guided setup | **P** |
| PageFly | **P** | Guided setup | **P** |
| GemPages | **P** | Guided setup | **P** |
| GoKwik | **P** | Guided setup | **P** |
| Shopflo | **P** | Guided setup | **P** |

### Additional Configurations Field Matrix

`Admin` covers EB-equivalent field presence, shared load/edit/dirty/save/error/
discard/hard-reload persistence, deep-link navigation, and dependency behavior.
`Runtime` is direct behavior where executable, otherwise an explicit
environment decision. Script fields are stored as untrusted text and never run
inside Admin.

| Layout / Tab | Field | Admin | Runtime |
|---|---|---|---|
| Landing / Configuration | Show Compare At Price | **P** | **E** — storefront widget CDN ORB |
| Landing / Configuration | Hide Irrelevant variant images | **P** | **E** — storefront widget CDN ORB |
| Landing / Configuration | Track inventory on Add To Cart (in beta) | **P** | **E** — storefront widget CDN ORB |
| Landing / Configuration | Redirect Collection Page Quick Add to Bundle | **P** | **E** — no collection quick-add fixture |
| Landing / Configuration | Cart Messaging | **P** | **P** — rich and zero-savings transforms |
| Landing / Configuration | Bundle Items | **P** | **P** — live rich checkout |
| Landing / Configuration | Original Bundle Price | **P** | **P** — live rich checkout |
| Landing / Configuration | Discount Display | **P** | **P** — live rich and zero-savings checkout |
| Landing / Configuration | Discount format | **P** | **P** amount/combined; **E** percentage-only live replay |
| Landing / Configuration | Checkout Settings | **P** | **P** — native checkout |
| Landing / Configuration | Checkout Integration | **P** | Provider matrix |
| Landing / Configuration | Execute Script | **P** | **E** — storefront widget CDN ORB |
| Landing / Configuration | Custom Font | **P** | **E** — storefront widget CDN ORB |
| Landing / CSS & Scripts | Custom CSS for bundle builder pages | **P** | **E** — storefront widget CDN ORB |
| Landing / CSS & Scripts | Custom CSS for bundle dummy product page | **P** | **E** — storefront widget CDN ORB |
| Landing / CSS & Scripts | Custom CSS for theme pages | **P** | **E** — storefront widget CDN ORB |
| Landing / CSS & Scripts | Custom JS Bundle Script | **P** | **E** — storefront widget CDN ORB |
| Landing / CSS & Scripts | Button Selectors | **P** | **E** — no compatible theme fixture |
| Landing / CSS & Scripts | Add to Cart Button Selectors | **P** | **E** — no compatible theme fixture |
| Landing / CSS & Scripts | Buy now button | **P** | **E** — no compatible theme fixture |
| Landing / Integrations | Enable Custom Theme Integration Script | **P** | **E** — storefront widget CDN ORB |
| Landing / Integrations | Custom Theme Integration Script | **P** | **E** — storefront widget CDN ORB |
| Landing / Integrations | Enable Cart Integration | **P** | **E** — no compatible cart fixture |
| Landing / Integrations | Cart Item Selectors | **P** | **E** — no compatible cart fixture |
| Landing / Integrations | Cart Item Remove Parent Selectors | **P** | **E** — no compatible cart fixture |
| Landing / Integrations | Cart Item Remove Selectors | **P** | **E** — no compatible cart fixture |
| Landing / Integrations | Cart Item Quantity Button Selectors | **P** | **E** — no compatible cart fixture |
| Landing / Integrations | Custom Cart Integration Script | **P** | **E** — no compatible cart fixture |
| Landing / Integrations | Enable Judge Me Integration | **P** | **E** — Judge.me is not installed |
| Landing / Integrations | Public token | **P** | **E** — Judge.me is not installed |
| Landing / Advanced | Logo | **P** | **E** — video redeem runtime unavailable |
| Landing / Advanced | Background Color | **P** | **E** — video redeem runtime unavailable |
| Landing / Advanced | Upload file | **P** | **P** — authenticated Shopify staged-upload/poll flow |
| Landing / Advanced | Update Image | **P** | **P** — applies uploaded URL to saved logo preview |
| Product / Configuration | Hide Out Of Stock Products | **P** | **E** — no live PPB fixture |
| Product / Configuration | Track inventory on Add To Cart (in beta) | **P** | **E** — no live PPB fixture |
| Product / Configuration | Add bundle to cart after the last step is completed | **P** | **E** — no live PPB fixture |
| Product / Configuration | Display empty state boxes based on bundle condition | **P** | **E** — no live PPB fixture |
| Product / Configuration | Hide Step Titles in completed state | **P** | **E** — no live PPB fixture |
| Product / Configuration | Add to cart when product card is clicked | **P** | **E** — no live PPB fixture |
| Product / Configuration | Redirect Collection Page Quick Add to Bundle | **P** | **E** — no live PPB fixture |
| Product / Configuration | Cart Messaging | **P** | **E** — no live PPB fixture |
| Product / Configuration | Bundle Items | **P** | **E** — no live PPB fixture |
| Product / Configuration | Original Bundle Price | **P** | **E** — no live PPB fixture |
| Product / Configuration | Discount Display | **P** | **E** — no live PPB fixture |
| Product / Configuration | Discount format | **P** | **E** — no live PPB fixture |
| Product / Configuration | Redirect Settings | **P** | **E** — no live PPB fixture |
| Product / Configuration | Execute Script | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Custom CSS for Mix And Match Bundles | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Execute Custom Script | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Selectors | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Side cart selector | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Side cart section ID | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Cart page items selector | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Cart page items section ID | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Side cart open button selector | **P** | **E** — no live PPB fixture |
| Product / CSS & Scripts | Product page price selector | **P** | **E** — no live PPB fixture |

### Live Admin Evidence

- EB and WPB desktop traversals cover both layouts and every available tab.
- WPB dependency replay proves Cart Messaging and integration child fields
  disable without erasing their saved values.
- Dirty layout/tab/group navigation remains blocked until Discard or a
  successful controls save, then executes the latest requested destination.
- Hard reload preserves the canonical layout/tab/group query state.
- Advanced renders the saved logo, color control, authenticated upload button,
  and Update Image action without the prior missing-Redux-provider exception.
- Existing mobile traversal proves the disclosure navigation and stable field
  order; no browser action brought Chrome to the foreground.

### Final Fixture State

- Additional Configurations remains on Landing Page / Advanced.
- Saved rich checkout controls remain amount-and-percentage, native Shopify
  checkout, the approved one-shot SIT script, and Georgia.
- Third-party providers remain uninstalled and no connection state is claimed.
- No deployment, backfill, repair, or development-server command was run.
