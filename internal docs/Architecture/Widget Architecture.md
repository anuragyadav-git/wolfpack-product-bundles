---
schema_version: 1
id: widget-architecture
title: Widget Architecture
type: architecture
status: authoritative
summary: FPB and PPB bootstrap, hydration, extension-asset, and widget runtime architecture.
last_audited: 2026-08-14
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
  - app/assets/bundle-modal-component.ts
  - app/assets/widgets/shared
  - app/assets/widgets/full-page/initialization-guard.js
  - app/assets/widgets/full-page-css/base/bootstrap-reservation.css
  - app/assets/bundle-widget-product-page.ts
  - app/routes/api/api.storefront-products.tsx
  - app/routes/api/api.storefront-collections.tsx
  - app/routes/api/api.fpb-upsells[.]json.tsx
  - app/routes/app/app.settings/design-preview-model.ts
  - app/routes/root/wpb.$bundleId.tsx
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
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

Template behavior is resolved through plain config modules and method modules:

- FPB configs: `app/assets/widgets/full-page/templates/{standard,classic,compact,horizontal}.config.ts`
- PPB configs: `app/assets/widgets/product-page/templates/{grid,list,horizontal-slots,vertical-slots}.config.ts`
- Registries resolve canonical app template identifiers to those target template configs. FPB Standard is stored and emitted as `STANDARD`.

Template installer/prototype patch functions have been removed. Widget entry files compose exported template method objects in the same central `Object.assign` used for controller method modules.

The widgets do not accept the retired `individualSellingPlanSelection` field.
PPB instead consumes the explicit public `subscription` object from
`bundle_ui_config`. A shared purchase-options component renders the selected
selling-plan group across every PPB template. Subscription submissions add the
same `selling_plan` to every component line and omit the merged-path public
`Box` metadata; one-time submissions retain the existing merged-parent flow.

## Admin Design Preview Adapter

Settings -> Design resolves its eight local preview descriptors from
`mapTemplateSelection` and the same FPB/PPB template config registries listed
above. The descriptor reads canonical product-card mode, configured columns,
timeline mode, summary mode, and slot orientation; its Admin-only adapter adds
supported surfaces, semantic fixture regions, and responsive composition.

The Admin preview must remain a local structural representation. It uses
deterministic fixture records and `buildSettingsDesignRuntime` theme values, but
does not import storefront CSS, instantiate a widget controller, fetch a bundle,
embed an iframe, mutate a cart, or persist preview state. Public template images
are reference evidence only. This boundary lets template IDs and runtime design
tokens stay canonical without coupling the Settings chunk to the storefront
runtime.

The Admin preview does not compose a synthetic whole builder. It renders each
applicable major component independently: Bundle header, Navigation, Categories,
Product cards, Product slots, Product picker, Cart / Summary, Loading,
Validation, and Upsell. Component surfaces render inside fixed logical
1280×1136 desktop and 390×844 mobile canvases, then scale as a whole to fit the
available Admin panel; the scale must not change the storefront breakpoint
being represented. Transient Product picker, Loading, Validation, and Upsell
states remain deterministic representations and must not be described as exact
storefront interactions.

Source module names should describe their storefront responsibility. Avoid mechanical names such as `chunk-01.js` or `part-01.css`; those hide ownership and make stale widget code harder to spot.

The shared Bundle Product Modal owns the product image carousel, name,
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

Because the shared product-details overlay is mounted under `document.body`, its responsive surface is viewport-owned rather than widget-container-owned. Product image activation opens a bounded, centered modal on desktop and a bounded bottom drawer on mobile. Both surfaces suppress horizontal overflow and keep excess content scrollable only on the vertical axis.

While product details are open, the storefront document root and body are both
scroll-locked. The modal or drawer remains the only vertical scroll owner, and
overscroll must not chain into the storefront page behind it.

The shared multi-step FPB timeline sizes its navigation track from the rendered step count and caps it to the available shell width, so additional steps remain evenly spaced without pushing a two-step timeline to opposite page edges. Its 44px circular icon frame keeps the step image at its intrinsic aspect ratio, bounded by the available width and height with `object-fit: contain` and a small inner inset, so merchant images do not overflow or clip. Active icon emphasis is painted as an inset ring over the same reserved border box used by inactive icons; changing timeline state must not resize the inner icon.

PPB Product List (`PDP_INPAGE + CASCADE`) owns its multi-step navigation in the Product Page layout, footer, and validation method modules. A multi-step Product List renders only `currentStepIndex`; intermediate primary actions navigate Next after current-step validation, the final step uses Add Bundle to Cart, and Back preserves selections across steps. Single-step Product List and the other PPB templates keep their existing rendering paths. Product List exact-rule over-selection is blocked before state mutation so the current step and selected-items drawer remain stable.

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
- Shopify stores enabled app embed blocks in `config/settings_data.json` under `current.blocks`. Per Shopify's Theme app extension configuration docs, an app embed appears there only after first enable; if the merchant disables it later, the block remains and has `disabled: true`. App embed status detection reads the active theme settings file, supports `OnlineStoreThemeFileBodyText.content`, `OnlineStoreThemeFileBodyBase64.contentBase64`, and `OnlineStoreThemeFileBodyUrl.url`, tolerates Shopify's generated comment header before parsing the settings JSON, matches the block `type` shape `shopify://apps/{app-handle}/blocks/{block-handle}/{unique-id}`, and treats `disabled: true` as inactive. Shopify Admin `currentAppInstallation.app.handle` is the sole app-identity source; environment, client-key, and hardcoded handle fallbacks are prohibited. A missing handle or unreadable settings file fails closed so merchants see the enable banner instead of a false Active state.
- The embedded Admin enable flow opens Theme Editor in a new tab and hides the configure warning plus updates Bundle Visibility status optimistically after the merchant clicks `Enable here`. Configure page-load status comes from the server loader's parallel Shopify theme settings read. Every FPB preview action synchronously reserves a tab, requests a new stateless signed URL, and navigates the reserved tab after the response; the token is required for drafts and harmless for public statuses.
- Product-page builder placement uses the `bundle-product-page` app block. The app embed does not inject PPB markup because the merchant controls the widget's product-page position through this section block.
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

### Product-Page Block Stage — Marker Bootstrap

The PPB app block writes only a compact pointer into `data-bundle-config`:

```liquid
data-bundle-config='{"v":2,"type":"product_page","bundleType":"product_page","id":"{{ bundle_id }}"}'
```

`bundle_ui_config` is still read to validate bundle-type context for container detection, but it is no longer serialized as a full bundle payload into the DOM.

Runtime behavior in `app/assets/widgets/product-page/methods/config-lifecycle-methods.js`:

1. Parse `data-bundle-config` as a bootstrap marker only when `data-bundle-type="product_page"`.
2. If marker is valid, fetch from:
   - `GET /apps/product-bundles/api/bundle/{bundleId}.json`
   - accept the `response.bundle` payload and hydrate `this.bundleData`.
3. If marker is missing/invalid:
   - show theme editor preview when in editor mode and `bundleId` exists
   - otherwise hide the container on storefront
4. Preserve transient retry for `503`/`504` only (3-second delay).

### Migration intent (PPB)

- Remove full-bundle payload writes into PPB HTML attributes.
- Keep API as source of truth for runtime hydration.
- Keep non-bundle and theme-editor behavior stable.

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

### FPB Runtime Styling Boundary

Static layout and presentation belong in source CSS. Runtime styling is limited
to values that are inherently data-driven, such as measured timeline progress,
timeline entry counts, validated variant swatch color, and merchant-authored
Custom CSS. The runtime must not inject structural widths, heights, spacing,
display state, or template stylesheets. Native attributes such as `hidden` and
state markers such as `data-fpb-summary-mode` own visibility and responsive
branching.

The FPB desktop summary and mobile tray rebuild their contents after selection
changes. Simple and Step-Based discount-progress transitions must therefore
read the visible fill percentage before clearing the old summary DOM, render
the replacement at that percentage, and move it to the new target on the
following frames. A transition declared only on the fill width cannot animate
across an element replacement. Initial renders and reduced-motion mode apply
the target immediately.

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
