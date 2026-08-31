---
schema_version: 1
id: widget-architecture
title: Widget Architecture
type: architecture
status: authoritative
summary: FPB and PPB bootstrap, hydration, extension-asset, and widget runtime architecture.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - storefront
systems:
  - widget-runtime
source_paths:
  - app/config/storefront-proxy-routes.ts
  - app/assets/bundle-widget-full-page.ts
  - app/storefront/fpb-product-page-upsell.ts
  - app/storefront/fpb-upsell-handoff.ts
  - app/storefront/ppb-bundle-embed.ts
  - app/storefront/page-builder-embed.ts
  - app/assets/bundle-modal-component.ts
  - app/assets/widgets/shared
  - app/assets/widgets/shared/specific-link-offer-eligibility.ts
  - app/assets/widgets/shared/localized-bundle-config.ts
  - app/assets/sdk/config-loader.ts
  - app/assets/widgets/shared/discount-tier-feedback.ts
  - app/assets/widgets/shared-css/discount-tier-feedback.css
  - app/assets/widgets/shared/drawer-layer-manager.ts
  - app/assets/widgets/shared/rich-html.ts
  - app/assets/widgets/shared/message-segments.ts
  - app/assets/widgets/shared/managed-style.ts
  - app/assets/widgets/shared/theme-section-parser.ts
  - app/assets/widgets/full-page/initialization-guard.js
  - app/assets/widgets/full-page-css/base/bootstrap-reservation.css
  - app/assets/bundle-widget-product-page.ts
  - app/assets/widgets/product-page/ppb-modal-card-presentation.ts
  - app/assets/widgets/product-page/methods/modal-methods.ts
  - app/assets/widgets/product-page/methods/modal-state-methods.ts
  - app/routes/api/api.storefront-products.tsx
  - app/routes/api/api.storefront-collections.tsx
  - app/routes/api/api.fpb-upsells[.]json.tsx
  - app/routes/api/api.ppb-embed[.]json.tsx
  - app/routes/api/api.page-builder-embed[.]json.tsx
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/app/app.settings/DesignSettingsView.module.css
  - app/routes/app/app.settings/design-preview-model.ts
  - app/routes/app/app.settings/storefront-preview-fixtures.ts
  - app/routes/app/app.settings/storefront-preview-protocol.ts
  - app/routes/root/settings-design-preview-frame/route.tsx
  - app/lib/shop-brand-colors.ts
  - app/routes/root/wpb.$bundleId.tsx
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
  - extensions/bundle-builder/blocks/bundle-product-page-embed.liquid
  - extensions/bundle-builder/blocks/bundle-page-builder-embed.liquid
  - extensions/bundle-builder/blocks/bundle-upsell.liquid
  - scripts/build-storefront.mjs
  - scripts/minify-assets/targets.js
related_docs:
  - Architecture/FPB Host Evaluation.md
tags:
  - architecture
  - widgets
keywords:
  - data-bundle-config
  - asset_url
---

# Widget Architecture

## Two Widgets

| Widget                 | Source file                                | Bundle output                                                            | Shopify block                                       |
| ---------------------- | ------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------- |
| Full-Page Bundle (FPB) | `app/assets/bundle-widget-full-page.ts`    | `extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js`    | `bundle-app-embed.liquid` on the app-proxy document |
| Product-Page (PDP)     | `app/assets/bundle-widget-product-page.ts` | `extensions/bundle-builder/assets/bundle-widget-product-page-bundled.js` | `bundle-product-page.liquid`                        |

Shared runtime modules live under `app/assets/widgets/shared/`. Controllers, method modules, and template modules import each shared primitive directly from its owning module. The removed `bundle-widget-components` compatibility barrel must not be recreated: direct ownership lets esbuild close every method over real lexical bindings and prevents browser-only free-global failures. TypeScript entry points under `app/storefront/` import the required runtime graph, and esbuild resolves, tree-shakes, minifies, and emits browser IIFEs. Storefronts never load raw ESM source files.

FPB, PPB, and SDK config selection pass the selected public bundle through the
shared locale projector before exposing step, category, add-on, pricing,
widget, embed, and general text fields to their existing renderers. Locale
matching is case-insensitive, prefers the exact Shopify locale, then its base
language, and finally retains the base configured copy. The projector is
immutable and does not change the FPB metafield-first, proxy-fallback load
priority. Subscription copy is excluded because its dedicated storefront
resolver already performs exact/base locale resolution and deep-merges plan
copy. Pricing projection includes the localized global success message as well
as per-rule messages, progress tiers, and bundle-quantity labels. The dedicated
PPB Bundle Embed selector follows the same case-insensitive exact/base matching
and ignores blank overrides so its title and subtitle retain configured base
copy.

Template behavior is resolved through plain config modules and method modules:

- FPB configs: `app/assets/widgets/full-page/templates/{standard,classic,compact,horizontal}.config.ts`
- PPB configs: `app/assets/widgets/product-page/templates/{grid,list,horizontal-slots,vertical-slots}.config.ts`
- Registries resolve canonical app template identifiers to those target template configs. FPB Standard is stored and emitted as `STANDARD`.

## PPB modal-template picker ownership

PPB Horizontal Slots (`PDP_MODAL/MODAL`) and Vertical Slots (`PDP_MODAL/SIMPLIFIED`) share the single `#bundle-builder-modal` picker owned by `product-page/methods/dom-methods.ts`. Product List and Product Grid use their in-page surfaces and must not inherit modal-only layout behavior.

The shared picker is an 85dvh bottom sheet with three regions: a non-scrolling header, the only vertically scrolling catalog body, and a non-scrolling footer in normal flex flow. Footer geometry must never overlap product actions or focus rings. The catalog renders five tracks at 1440px, four at 1280px, and two at 768px and below; fixed track counts keep sparse rows from stretching. Modal lifecycle and exact opener-focus restoration remain owned by `modal-state-methods.ts`, while the global keyboard listener contains Tab focus only when the picker is the topmost drawer layer.

All four PPB templates resolve grouped-variant presentation from the active
category's canonical `variantSelectorMode`: Dropdown, Pills, Color swatches, or
Image swatches. Non-dropdown modes are semantic radio groups with unavailable
values disabled. Color swatches use only the merchant's exact
`variantColorMap`; unmapped values retain a neutral labeled presentation rather
than inferring a CSS color. Optional color tooltips are described to keyboard
focus, clamp/flip at viewport edges on precise pointers, and are replaced by a
persistent selected-value label on coarse/mobile pointers. The existing
delegated change path updates the active card variant, price, image, and
inventory context; Add remains the bundle-selection mutation. The modal focus
trap queries native interactive controls as one combined selector so results
stay in document order and variant radios remain keyboard reachable. A variant
rerender restores focus to the replacement selected radio without scrolling,
preserving arrow-key exploration and its focus tooltip.

Horizontal/Vertical modal cards keep these grouped-variant selectors inline at
every viewport. Product images and titles are informational and do not open a
nested product-details surface. A pure PPB modal-card presentation helper
resolves `add`, `quantity`, or `maximum-reached` from per-product quantity
validation. At maximum the localized `Added xN` action removes the full
selected quantity. These overrides ignore `showQuantitySelectorOnCard` only for
modal cards; Product List/Grid retain their in-page behavior.

Filled Horizontal slots remain bounded by the existing responsive tile block-size token, while filled Vertical slots use the existing responsive row block-size as both their minimum and maximum. Product names wrap and visually clamp only within that boundary; their complete value remains in the DOM and the product-specific accessible name of the overlaid cross-badge remove control. The cross badge keeps a 44px interaction target, stops propagation so it cannot open replacement, and uses the existing single-removal and same-index focus-recovery paths.

Template installer/prototype patch functions have been removed. Widget entry files compose exported template method objects in the same central `Object.assign` used for controller method modules.

The widgets do not accept the retired `individualSellingPlanSelection` field.
FPB and PPB instead consume the explicit public `subscription` object from
`bundle_ui_config`. A shared purchase-options component renders the selected
selling-plan group across every FPB and PPB template. Subscription submissions add the
same `selling_plan` to every component line and omit the merged-path public
`Box` metadata; one-time submissions retain the existing merged-parent flow.

## Admin Design Production Renderer Adapter

Settings -> Design resolves its eight template selections through
`mapTemplateSelection`, converts unsaved values with
`buildSettingsDesignRuntime`, and sends them to the isolated
`/settings-design-preview-frame` document through a versioned same-origin
protocol. The frame dynamically imports only the selected production FPB or PPB
controller and loads the same base, responsive, and template CSS sources used by
the storefront asset build.

Protocol version 2 separates the persistent editable area from transient
preview state. Bundle header, navigation, categories, product cards, product
slots, and cart/summary are template-filtered edit areas. Default, product
picker, loading, validation, and upsell are independently filtered preview
states. Upsell is FPB-only because it renders the external FPB product-page
offer; PPB templates do not expose a synthetic equivalent. Choosing an area
returns to Default; choosing a temporary state retains the previous area so
closing or resetting the state restores the same editing context. No version-1
surface compatibility path is retained.

The FPB frame initializes its mount with the same
`bundle-widget-container bundle-widget-full-page` host classes as the app-embed
storefront document before the controller renders. These are functional style
scope owners, not decorative aliases: the shared responsive grid, template
columns, and inline summary rules depend on them. PPB retains the host classes
owned by its production controller.

FPB category identity has one visual owner at a time. When category tabs are
enabled, the selected tab is the active-category label and the standalone
category title is omitted during both initial rendering and step navigation.
The standalone title remains available only when category tabs are disabled.
Because Settings -> Design runs the production controller, this rule is shared
by its preview and the deployed storefront widget.

Deterministic fixture bundles hydrate the controller without Shopify, app-proxy,
or storefront requests. Controller persistence, analytics, add-to-cart,
post-cart behavior, and external navigation are disabled; links, forms, and cart
actions are also blocked at the frame boundary. Interactions otherwise use the
production renderer. Product picker, Loading, Validation, and Upsell use their
real modal, overlay, toast, and offer implementations.

The FPB Upsell preview uses a deterministic production-shaped block offer after
the local product purchase form and delegates its markup to
`renderFpbUpsellOffers`. Its action background, action text, border, and body
text consume the same generated `--bundle-upsell-*` variables as the deployed
offer, so unsaved Design values and storefront output share one token contract.

In Default state, the frame scrolls the selected production region into view
and applies a preview-only focus attribute. The frame-owned stylesheet renders
a persistent outline and localized `Editing` label without altering production
widget CSS or intercepting storefront interactions. Temporary states suspend
the region focus; validation remains visible while selected and product-picker
dismissal is reported to the parent so the state selector returns to Default.

The frame supplies an adaptive neutral store shell: FPB is presented in a
full-page collection context, while PPB is presented beside product media and
product information. This context is intentionally theme-neutral; bundle DOM,
styling, responsive behavior, and interactions remain production-owned. The
logical desktop renderer remains 1280×1136, while its gutterless stage uses the
preview-column width to establish the same aspect ratio. Releasing the inspector
column therefore enlarges the rendered storefront instead of leaving unused
canvas space. The mobile renderer remains exactly 390×844 and is wrapped outside
the iframe by a 428×882 decorative iPhone 14 Pro footprint adapted from the
MIT-licensed Devices.css geometry. The frame adds its chrome around the full
renderer instead of reducing or cropping the iframe viewport. Fit calculation
includes that body without changing the storefront breakpoint. Both modes stay
centered within the available stage. The preview-frame document keeps its root
vertical scrolling behavior but suppresses root scrollbar chrome so the live
storefront remains scrollable without drawing a browser scrollbar inside the
device body.
Field-to-surface focus remains a one-shot request per edit so later manual
surface selection stays authoritative.

The separate storefront Preview Bundle action consumes saved Design settings
only. It lists active or unlisted bundles with a valid storefront identifier,
reserves a browser tab synchronously, and posts the existing authenticated
configure `/prepare-preview` route. FPB navigates to the signed shareable URL;
PPB appends the returned preview token to the parent product URL. Preparation
failure closes the reserved tab and leaves the Polaris modal open with an error.

The Design workspace is preview-first: template, component surface, and logical
desktop/mobile selectors stay with the canvas, while one inspector exposes only
settings mapped to the visible component. Desktop merchants can collapse that
inspector from a Polaris boundary chevron so the fit-scaled canvas consumes the
released width; disclosure state is local and does not reset the preview or
unsaved values. ResizeObserver updates are coalesced into one browser-frame
style write without React render state or scale transitions. Phones hide the
boundary control and switch between Preview and
Customize panes without duplicating the preview model. Component color controls
have no Expert-mode gate. `inheritedColorFieldKeys` records which fields resolve
from the first Storefront API Shop Brand primary or secondary pair; editing a
field removes it from that list and reset restores it. Existing saved payloads
without the list remain explicit. `buildSettingsDesignRuntime` and the public
Design CSS endpoint both use the same pure resolver, so Admin and storefront
precedence is explicit component value, Shop Brand semantic pair, then canonical
template default.

The store-level product-slot image is persisted inside the shared Design JSON,
not as direct `DesignSettings` columns. `stylePresets.images.slotIconUrl` and
`slotIconFit` feed both local previews and generated storefront CSS for all four
FPB and all four PPB templates. `badge` replaces the native centered plus icon;
`cover` fills the responsive slot; `fit` contains the image within it. Admin
labels `badge` as Centered badge and recommends a transparent 96 x 96 px square;
Fit recommends an 800 x 800 px square. The generated CSS variables are the
store-level authority when a slot image is configured, so older bundle-level
placeholder markup cannot override its presentation.

Source module names should describe their storefront responsibility. Avoid mechanical names such as `chunk-01.js` or `part-01.css`; those hide ownership and make stale widget code harder to spot.

The FPB-only Bundle Product Modal owns the product image carousel, name,
description, variant controls when needed, quantity, and Add To Box. Direct
product and collection hydration preserve up to 50 Shopify product images in
source order. One image renders without navigation; multiple distinct images
enable previous/next controls on desktop and horizontal swipe navigation in the
mobile drawer. The same shared component owns both responsive surfaces.
When explicit-step data and collection hydration produce the same selectable
variant, deduplication merges the records instead of keeping the first payload
unchanged. The merged record preserves the richer image gallery, description,
and variant inventory metadata so an earlier compact step record cannot disable
the shared carousel. A direct product whose metafield payload contains only a
compact single-image record is also hydrated through the existing storefront
products endpoint before rendering; product identifiers may arrive in `id`,
`selectionId`, or `productId`, and must resolve to the same product lookup key.

Because the FPB product-details overlay is mounted under `document.body`, its responsive surface is viewport-owned rather than widget-container-owned. FPB product cards explicitly opt into the shared card's image/title details affordance; PPB cards do not render that affordance or construct the product-details overlay.

While product details are open, the storefront document root and body are both
scroll-locked. The modal or drawer remains the only vertical scroll owner, and
overscroll must not chain into the storefront page behind it.

The shared multi-step FPB timeline sizes its navigation track from the rendered step count and caps it to the available shell width, so additional steps remain evenly spaced without pushing a two-step timeline to opposite page edges. Its 44px circular icon frame keeps the step image at its intrinsic aspect ratio, bounded by the available width and height with `object-fit: contain` and a small inner inset, so merchant images do not overflow or clip. Active icon emphasis is painted as an inset ring over the same reserved border box used by inactive icons; changing timeline state must not resize the inner icon.

PPB Product List (`PDP_INPAGE + CASCADE`) owns its multi-step navigation in the Product Page layout, footer, and validation method modules. A multi-step Product List renders only `currentStepIndex`; intermediate primary actions navigate Next after current-step validation, the final step uses Add Bundle to Cart, and Back preserves selections across steps. Single-step Product List and the other PPB templates keep their existing rendering paths. Product List exact-rule over-selection is blocked before state mutation so the current step and selected-items drawer remain stable.

PPB drawer ownership is explicit through `data-ppb-drawer-surface` values for
`selected-summary`, `bundle-picker`, and, where still used by in-page templates,
`variant-selector`.
The selected summary belongs to widget flow and never participates in document
scroll locking. The modal surfaces share the drawer layer manager: only
the top layer owns Escape and backdrop dismissal, document scroll locks once
across nested overlays, the root reserves its existing scrollbar gutter while
locked, and the final close restores the prior scroll styles and gutter value.
Horizontal/Vertical variants remain native and inline on both viewport classes.
Focus returns to the originating slot or variant trigger after the
owning layer closes.

FPB product grids do not pre-disable or dim unselected cards when a step reaches its exact or maximum quantity. Returning to a completed step keeps the full product set interactive; an attempted increase beyond the configured rule is rejected by `validateStepCondition` before selection state changes, and the rule toast explains the limit.

Quantity, Amount, and Weight step rules share the same selection and navigation
gates in both storefront widgets. Quantity sums selected units, Amount sums
variant prices in cents against merchant-entered currency-unit thresholds, and
Weight sums Shopify variant weights normalized to grams. Metric lookup follows
the selected variant ID into grouped-product variant data; it must not fall back
to the card's default variant or treat an unmatched nested variant as zero.
Rule toasts resolve the matching metric and operator language field before
substituting `{{conditionQuantity}}`, `{{conditionAmount}}`, or
`{{conditionWeight}}`.

Before PPB category-as-step expansion, the runtime removes steps whose persisted `enabled` value is `false`. This visibility normalization also applies when category expansion is off, so a disabled Admin step can never render or prevent a single enabled multi-category step from expanding into navigable category steps.

Product Page inventory normalization preserves `sourceVariantCount` after unavailable variants are filtered. Product List uses that metadata only when a grouped product originally had multiple variants but now has one sellable variant: the shared row shows the surviving variant title as static identity while keeping the selector absent. Fully unavailable products and unavailable options remain filtered.

---

## Storefront Surfaces

- Theme Editor exposes one FPB body app embed: `bundle-app-embed` (`Wolfpack Bundle`). It is the activation/status surface and hydrates the canonical app-proxy marker. The retired `bundle-full-page` Page block is not part of the extension contract.
- Embedded Admin status comes only from `shopify.app.extensions()` published-theme data. Server loaders do not parse `settings_data.json` or provide a status fallback. Theme Editor uses the documented `themes/current` `activateAppId` deep link.
- FPB and embed/page-builder product, collection, and cart-metafield requests use
  the signed `/apps/product-bundles` app proxy. The parent-product PPB block is
  the deliberate exception: it uses the synchronized public Storefront token
  and calls the shop's Storefront API directly, so its buyer path remains
  available without the Wolfpack web service.
- Parent-product PPB rendering continues to use the `bundle-product-page` app
  block. Greenfield Bundle Embed rendering is separately owned by the global
  `bundle-app-embed` runtime: it resolves an eligible PPB, lazily loads PPB
  assets, and mounts before the primary visible Add to Cart control. The
  `bundle-product-page-embed` product-template block is a setting-free custom
  placement anchor and takes precedence when visible.
- Page builders use the separate provider-neutral `bundle-page-builder-embed`
  block. It emits data only; `bundle-app-embed` continues to own signed
  resolution, Shopify CDN asset URLs, lazy runtime loading, and rendering.
  `eligible-product` mode becomes the preferred PPB custom anchor and reuses
  `/apps/product-bundles/api/ppb-embed.json`. `product-page-bundle` resolves an
  exact Active or Unlisted PPB by its generated parent-product handle, while
  `full-page-bundle` resolves an exact Active or Unlisted FPB by its per-shop
  public number through `/apps/product-bundles/api/page-builder-embed.json`.
  The first valid marker is authoritative. Existing parent-product PPB and FPB
  app-proxy roots win; direct page-builder modes suppress automatic PPB builder
  initialization so only one primary bundle builder exists per page.
- Before opening a PPB storefront preview, the preview flow first synchronizes the selected product template, then posts to the dedicated authenticated `/validate-widget-placement` JSON resource route. That route reads the parent product's effective `templateSuffix`, inspects that product JSON template in the MAIN theme, and verifies an app block owned by the current app with handle `bundle-product-page`. The placement check must not post to the rendered configure document route because an embedded document response can be HTML rather than the JSON contract expected by the client. Missing, malformed, or unreadable template data fails closed and opens Shopify's Theme Editor deep link for that exact template and product. A parent product alone is not evidence that the PPB widget is installed.

### FPB Bootstrap Idempotency and First-Paint Reservation

The app embed and the FPB bundle have two legitimate initialization triggers: the embed's script-load callback and the bundle's own DOM-ready bootstrap. They can overlap on app-proxy pages. The FPB entry point must synchronously claim the container with `data-initializing` before constructing a controller, set `data-initialized` only after successful initialization, and release the in-progress claim in `finally` so a failed attempt remains retryable.

The app-proxy marker is server-rendered with `hidden` and is hydrated near the end of the document. Without earlier geometry, the theme footer can paint in the future widget area and then leave the viewport when the controller renders. The marker therefore contains one pure loading screen that reserves `100svh`; it never renders provisional product cards, summary content, or layout skeletons. `bundle-widget-bootstrap.css` is loaded from the app embed's schema into the document head so the screen does not depend on the main widget stylesheet. During hydration, the app embed moves the same loading screen into the FPB root and marks the root `aria-busy="true"`; widget initialization removes it and clears the busy state only after rendered bundle content is ready. The canonical app-proxy marker must contain this loading screen, and missing markup fails fast rather than invoking a compatibility path. Keep the bootstrap asset small and marker/root-specific because the enabled app embed loads it across storefront pages.

Settings -> Design owns the store-level FPB loading appearance. `generalSettings.loadingScreen` carries an optional HTTPS GIF URL and a validated background color. The app-proxy route reads those settings before first paint, renders the merchant GIF when present, and otherwise renders the default CSS spinner. The app embed also transfers these values to the controller so later product-grid and step transitions use the same full-screen overlay. All four FPB presets use this loading screen; no preset may restore transient card or sidebar skeletons.

Rendered FPB summaries have a separate empty-selection contract and are not a
loading state. When Product
Slots is disabled, Standard, Classic, Compact, and Horizontal all render the
same responsive product-row skeleton behavior on desktop and mobile. The
baseline target is two rows for a new bundle; an explicit larger quantity
requirement becomes the target, and each selected unit removes one skeleton.
When Product Slots is enabled, slot tiles own the empty state and summary
skeleton rows are not rendered.

The app embed is a separate small entry. It handles redirects and marker hydration, then loads the FPB asset only when a full-page marker exists. It must not import the FPB controller graph because the embed is enabled globally.

The app embed is also the sole FPB stylesheet loader. It loads the base,
mobile-summary, shared responsive, and active-preset assets in that order before
starting the widget runtime, and deduplicates links by resolved URL. This makes
the shared gutter, sidebar, and mobile-footer components the common default and
keeps each preset asset as the final visual override layer. The controller only
applies preset and summary markers; it does not create, disable, or switch
stylesheets during rendering.

Keep the embed runtime as an explicit deferred `asset_url` script after the
body marker unless initialization is redesigned. A schema-level `javascript`
asset is injected asynchronously into the document head and can execute before
the marker exists.

- FPB product-page upsells are owned by the global app-embed runtime. The embed supplies product, collection, locale, selected-variant, and signed endpoint context. `/apps/product-bundles/api/fpb-upsells.json` returns only shop-scoped eligible public offers and uses short private caching with ETag revalidation.
- `bundle-upsell` is a setting-free custom-placement anchor. The first visible custom anchor wins; otherwise the runtime inserts once below the primary product add-to-cart form through a bounded observer. The runtime never falls back to arbitrary body placement and renders no shell for empty or failed responses.
- Product-page clicks capture the currently selected variant into a ten-minute, bundle-scoped, consume-once session handoff. The shared FPB controller reconciles only the exact available variant into the first matching enabled paid step and refreshes the existing desktop sidebar and mobile footer from `selectedProducts`. This flow is template-neutral across Standard, Classic, Compact, and Horizontal.
- PPB Bundle Embed uses the same global loader but a separate signed
  `/apps/product-bundles/api/ppb-embed.json` contract. It returns one
  shop-scoped Active or Unlisted PPB selected by `createdAt ASC, id ASC`, plus
  localized title/subtitle and the browsed-product preselection flag. Responses
  use private 30-second ETag caching.
- The PPB embed host consumes the endpoint's preloaded formatted bundle instead
  of making the parent-product configuration request. It marks the controller
  as an embed source, preventing controller relocation and native price/dynamic
  checkout hiding. Product Page CSS/runtime load only after a non-null eligible
  response. Section reload reconciliation reuses the request result and never
  creates a second widget.
- A visible `bundle-product-page-embed` anchor wins; otherwise the host mounts
  immediately before the first visible primary Add to Cart control. Exact
  available current-variant preselection runs only when enabled and no shopper
  session selection was restored.
- Direct page-builder responses use private 30-second ETag caching and preload
  the formatted bundle. Direct PPB sets the existing embed-source contract and
  therefore never relocates itself or hides native product price, dynamic
  checkout, or product forms. Direct FPB marks its signed inline configuration
  as `app_proxy`, preserving the canonical full-page load priority and avoiding
  a second configuration request. Section reloads reuse the resolved payload.
- PageFly and GemPages should use their Shopify App elements to place
  `bundle-page-builder-embed`. Shogun custom layouts can emit the same plain
  HTML marker because it contains no Shopify Liquid or external asset URL.
- Full-page bundle public links use the signed app-proxy document URL (`/apps/product-bundles/wpb/{publicNumber}`). The positive integer is unique per shop and hides the internal database ID. Shopify wraps `application/liquid` in the active theme layout and the app embed loads extension assets through `asset_url`.
- Storefront JS/CSS must be loaded from Shopify theme-extension assets with Liquid `asset_url`. App proxy routes are only for API/data responses, not widget asset hosting.

Proxy URL ownership is centralized at each build boundary. TypeScript callers use
`app/config/storefront-proxy-routes.ts` for the installed proxy root and API or
document path composition. Theme-extension blocks use the canonical relative
proxy root directly. Do not capture a theme-app-extension snippet to construct a
URL: Shopify wraps rendered extension snippets in diagnostic HTML comments, and
capturing that output corrupts URL attributes. The production and SIT TOMLs
retain their required literal `subpath` values because Shopify reads those
deployment manifests directly.

## FPB Load Strategy

> **Do not modify the load order** — see `CLAUDE.md` → "Do Not Touch" section.

### App-Proxy Marker and API Fallback

The app-proxy document writes the complete source-marked configuration into
`data-bundle-config`. If that primary marker is absent or malformed, the widget
uses the existing bundle API fallback. There is no Page block or Page-body
marker stage.

### App Proxy Document — Public FPB Route

The public FPB route is `GET /apps/product-bundles/wpb/{publicNumber}`. Shopify forwards it to Remix as `/wpb/{publicNumber}` and app-proxy HMAC verification is required before lookup. The route rejects non-positive or opaque path segments and resolves by `(shopId, publicNumber)`. Preview-token authorization and the emitted widget marker remain bound to the resolved internal bundle ID.

The route returns an escaped full `formatBundleForWidget()` payload in the existing marker, marks it with `data-bundle-config-source="app_proxy"`, and responds with `Content-Type: application/liquid` and `Cache-Control: no-store`. The widget treats only this source-marked, bundle-ID-matched full payload as authoritative and renders it without requesting bundle JSON. If the app-proxy marker is absent or malformed, the widget uses the bundle JSON fallback. Active and unlisted bundles render publicly; drafts require a 15-minute shop-and-bundle-bound `wpb_preview` token. The route never emits `/apps/product-bundles/assets/...` URLs.

### API Fallback

If metafield cache is absent/malformed → `GET /apps/product-bundles/api/bundle/{id}.json`

- Single retry after 3s for `503`/`504` responses (Render cold-start tolerance)

## PPB Load Strategy

### Product-Page Block Stage — Shopify-Hosted Snapshot

The PPB app block serializes only a complete schema-v3
`$app.bundle_ui_config` into `data-bundle-config`. Compact v2 pointers are
retired for this surface and are not fetched through the app proxy.

Runtime behavior in `app/assets/widgets/product-page/methods/config-lifecycle-methods.js`:

1. Accept only a complete schema-v3 Product Page snapshot with signed v2
   authorization.
2. Read store controls, locale data, Storefront API version/token, and generated
   Design CSS from Shopify-hosted shop metafields emitted by Liquid.
3. Hydrate product and variant state directly from Shopify Storefront API;
   category and collection membership is already materialized at sync time.
4. If the snapshot is missing/invalid:
   - show theme editor preview when in editor mode and `bundleId` exists
   - otherwise hide the container on storefront

The schema-v3 snapshot also carries a safe `offerDelivery` marker containing
only `specificLinkRequired` and `ruleVersion`. When the marker is enabled, both
the standard PPB widget and SDK mode forward the one opaque `wpb_offer` URL
token to the signed app-proxy eligibility endpoint before exposing bundle state.
Missing tokens, rejected decisions, and endpoint failures hide the widget. When
the marker is disabled, initialization remains network-free. Link-only bundles
are excluded from PPB embed, page-builder, and FPB upsell discovery surfaces so
the generated direct link remains the sole entry point.

There is no Wolfpack fallback for this surface. Storefront API failure fails
closed rather than rendering stale catalog or price data. See
[[Architecture/Storefront Outage Resilience]].

---

## Build Process

Source files use ES modules. Shopify extensions require bundled IIFEs.

```bash
npm run build:widgets          # build all
npm run build:widgets:full-page
npm run build:widgets:product-page
```

**Forgetting to build = storefront sees old code.**

---

## Widget Version

`widgetVersion` is defined in `scripts/build-storefront.mjs`.
Embedded as `window.__BUNDLE_WIDGET_VERSION__` in every bundled file.

Verify live version in DevTools:

```javascript
console.log(window.__BUNDLE_WIDGET_VERSION__);
```

Version bump rules:
| Change | Bump |
|---|---|
| Bug fix | PATCH |
| New storefront feature | MINOR |
| Breaking change / redesign | MAJOR |

**Mandatory before every deploy**: increment version → build → check CSS file sizes → deploy.

### CSS Size Limit

Shopify enforces **100,000 B** on app block CSS assets.

```bash
wc -c extensions/bundle-builder/assets/*.css
```

Keep base CSS below the limit by moving template-specific rules into separate extension assets:

- FPB base: `bundle-widget-full-page.css`
- FPB templates: `bundle-widget-full-page-{standard,classic,compact,horizontal}.css`
- PPB base: `bundle-widget.css`
- PPB templates: `bundle-widget-product-page-{cascade,cognive,modal}.css`

The current CSS minifier does not preserve the descendant combinator before a
leading `:is(...)` selector. Write those rules as explicit comma-separated
selectors and verify the generated asset; otherwise `.parent :is(.child-a,
.child-b)` can be emitted as `.parent:is(...)` and silently stop matching.

## Placeholder Media Strategy

- Bundle product placeholders now render from a local AVIF artifact:
  - `/bundle-product-placeholder.avif`
- App fallback still accepts `/bundle-product-placeholder.png` for backward compatibility in browsers or clients that do not decode AVIF or when an image transport path does not support AVIF.
- The fallback is applied at image render time (`onerror`), so the UI keeps working in all supported storefront clients without regressing existing media URLs.
- `public/bundle-product-placeholder.svg` has been decommissioned and should not be used anymore.

The app embed exposes the extension asset URLs and loads exactly one active
preset stylesheet. The widget runtime must not take over stylesheet ownership.
Do not solve the limit by minifying readable source into one-line CSS; remove
redundant or conflicting rules and split assets only along real ownership
boundaries.

The app embed must map canonical uppercase FPB preset IDs to explicit
`DOMStringMap` properties: `presetStandard`, `presetClassic`, `presetCompact`,
and `presetHorizontal`. Do not derive a dataset property as
`preset${preset}`; an uppercase preset such as `STANDARD` would look for the
nonexistent `presetSTANDARD` property and silently leave the widget with only
base CSS. A base-only render can appear functional, so live verification must
also confirm that the expected dedicated template stylesheet is loaded.

### Native DOM and trusted content boundaries

Storefront browser renderers construct elements and fragments with DOM APIs.
Dynamic text is assigned through `textContent`, mutable regions are replaced
with `replaceChildren`, and handlers are attached with event listeners. Shared
renderers return `HTMLElement` or `DocumentFragment` values through
`create*Element` and `create*Fragment` APIs; string-returning component
generators and HTML-valued child arguments are not part of the runtime
contract.

Two rich-content inputs retain formatting through
`sanitizeRichHtmlFragment`: Shopify product descriptions use the
`product-description` profile and provider review badges use the
`review-badge` profile. Both profiles reject scripts, embedded documents,
forms, inline styles, event attributes, and unsafe URLs, then return a detached
sanitized fragment that callers append directly. Merchant discount templates
never enter that boundary. `formatMessageSegments` produces text, condition,
and discount segments, and `createMessageFragment` creates only the known
emphasis elements while rendering templates and substituted values as text.

Fetched Shopify section markup has one separate boundary:
`parseThemeSectionResponse` accepts only successful same-origin HTML responses,
requires the requested selector, and imports the selected node into the active
document. Do not add another general HTML parser or move this boundary into
ordinary component rendering.

### Runtime styling boundary

Static layout and presentation belong in source CSS. Runtime styling is limited
to values that are inherently data-driven, such as measured timeline progress,
timeline entry counts, validated variant swatch color, and merchant-authored
Custom CSS. The runtime must not inject structural widths, heights, spacing,
display state, or template stylesheets. Native attributes such as `hidden` and
state markers such as `data-fpb-summary-mode` own visibility and responsive
branching.

All legitimate runtime stylesheets are owned by `replaceManagedStyle`. A caller
supplies a stable key and already validated CSS; the helper creates, replaces,
or removes the single matching `<style>` element. Settings Controls CSS is
processed by the existing CSS pipeline when saved and again when projected
into the public runtime response. Generated Design CSS and bundle-level CSS
retain their existing payload contracts but use the same managed-style
lifecycle. Static presentation belongs in the raw widget CSS sources, while
validated colors, counts, and percentages may cross the DOM boundary only as
CSS custom properties.

The FPB desktop summary and mobile tray rebuild their contents after selection
changes. Simple and Step-Based discount-progress transitions must therefore
read the visible fill percentage before clearing the old summary DOM, render
the replacement at that percentage, and move it to the new target on the
following frames. A transition declared only on the fill width cannot animate
across an element replacement. Initial renders and reduced-motion mode apply
the target immediately.

### Discount Tier Pill Feedback

Widget version `12.3.0` adds shared color-only feedback for pricing tiers when
`pricing.enabled` is true. Immediately before a selection mutation, the FPB and
PPB controllers capture the effective pricing tier; after a successful mutation,
the normal selection events and totals/pills rerender complete before the shared
transition helper compares the new tier. An advance dispatches one
`wpb:discount-tier-reached` event from the widget root. Custom SDK mode dispatches
the equivalent `wbp:discount-tier-reached` event after its normal selection
event. Both use this detail contract:

```ts
{
  bundleId: string;
  tierId: string;
  tierIndex: number; // zero-based
  tierCount: number;
  feedbackState: "tier" | "complete";
}
```

Initial hydration, restored selection state, same-tier changes, downgrades,
failed mutations, and disabled pricing do not emit. A later re-earned tier emits
again, a multi-tier jump emits once for its highest newly reached tier, and a
single configured tier is a completion.

The widget-root listener applies `data-wpb-discount-feedback` to every currently
mounted eligible pricing/count pill. The shared FPB/PPB stylesheet animates only
background and text colors: an intermediate tier uses one 650 ms beat, while
completion uses two beats over 1.2 seconds. The listener then removes the state
attribute so each pill returns to its owned appearance. Reduced-motion mode holds
the selected colors for the same duration without animation before restoration.

Merchant colors are stored under `pageCustomization.stylePresets.colors` as
`discountTierBackgroundColor`, `discountTierTextColor`,
`discountCompletionBackgroundColor`, and `discountCompletionTextColor`. They are
published as `--bundle-discount-feedback-tier-bg`,
`--bundle-discount-feedback-tier-text`,
`--bundle-discount-feedback-complete-bg`, and
`--bundle-discount-feedback-complete-text`.

### Merchant Pricing Tier Badges

Widget version `16.0.2` projects the optional canonical
`pricing.rules[].tierBadge` object to FPB and PPB. The shared renderer supports
`pill`, `folded`, and `banner_rounded` shapes and either `always` or `selected`
visibility. PPB attaches badges to its bundle-quantity tier pills; FPB attaches
them to stepped progress milestones. Badge presentation is owned by the shared
raw stylesheet and uses validated CSS custom properties for merchant-selected
foreground and background colors.

Static badge copy is valid for every pricing method. The
`{{saved_percentage}}` variable is valid only for percentage rules and
percentage Buy X, get Y rules; `{{saved_total}}` is valid only for fixed-amount
rules. The Admin and runtime share this truthfulness boundary. Missing or
invalid values suppress the badge instead of presenting fabricated savings.
The rendered text remains part of the tier's accessible description, and
selected-only badges follow the existing keyboard-operable tier-selection
state.

---

## Cache Busting

Shopify CDN `asset_url` filter appends `?v=HASH` — this hash only changes on `shopify app deploy`. Custom query params are NOT on the allowlist. Always deploy after widget changes.

Storefront JS/CSS loading strategy: FPB and Product Page bundle blocks load assets from Shopify theme-extension assets with Liquid `asset_url`. App proxy remains for API/data routes only.

### JS/CSS Asset Skew

Do not trust `window.__BUNDLE_WIDGET_VERSION__` by itself for CSS-only or CSS-heavy storefront fixes. The value proves the served JS bundle executed, but Product Page template CSS is a separate Shopify extension asset such as `bundle-widget-product-page-cascade.css`.

Observed 2026-07-13 in SIT: the storefront served `bundle-widget-product-page-bundled.js` with `window.__BUNDLE_WIDGET_VERSION__ = "5.0.145"` while the exact Shopify CDN `bundle-widget-product-page-cascade.css` still lacked `--bw-ppb-cascade-action-radius` and still contained the older `border-radius:100px` Product List quantity-wrapper rule. The local generated CSS asset was correct.

For storefront visual proof after CSS changes:

- Hard reload after clearing Cache Storage.
- Record `window.__BUNDLE_WIDGET_VERSION__`.
- Record the exact active CSS asset URL.
- Fetch the active CSS asset URL and verify the expected token/rule is present.
- Then measure computed styles. If JS is current but CSS is stale, proof is blocked by extension asset propagation/deploy state, not by the source patch.

### Dev Preview Asset 404 / ORB Failure

When a Shopify CLI dev preview asset hash expires or points at a missing theme-extension build, the storefront can still emit normal Liquid `asset_url` script/link tags while the referenced `https://cdn.shopify.com/extensions/.../dev-.../assets/...` URLs return Shopify `404` HTML. Chrome then reports the subresource loads as `net::ERR_BLOCKED_BY_ORB` or CORB because the browser requested CSS/JS but received `text/html`.

Do not diagnose that state as a widget boot or Classic template bug until the asset URL is checked directly. Required proof:

- Hard reload the storefront with cache bypass after clearing Cache Storage.
- Verify `window.__BUNDLE_WIDGET_VERSION__`; a missing value means the widget JS did not execute.
- Open or fetch the exact blocked asset URL. If it returns Shopify `404: Page not found` with `content-type: text/html`, the live proof is blocked by the dev-extension asset state, not by storefront source.
- Compare against any older already-open tab before trusting it. A stale tab can keep a previous dev asset hash and `window.__BUNDLE_WIDGET_VERSION__` while fresh tabs point at a newer missing hash.
