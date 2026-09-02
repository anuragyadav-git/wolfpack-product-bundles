---
schema_version: 1
id: fpb-host-evaluation
title: FPB App Proxy Host
type: architecture-decision
status: accepted
summary: Full Page Bundles use the signed app proxy as their sole storefront document host.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-app-proxy
source_paths:
  - app/config/storefront-proxy-routes.ts
  - scripts/build-storefront.mjs
  - extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js
  - app/lib/fpb-storefront-url.ts
  - app/routes/root/wpb.$bundleId.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route.tsx
  - app/services/bundles/fpb-public-number.server.ts
  - app/services/bundles/bundle-parent-product.server.ts
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - shopify.app.toml
  - shopify.app.wolfpack-product-bundles-sit.toml
related_docs:
  - Architecture/Widget Architecture.md
tags:
  - architecture
  - fpb
keywords:
  - application/liquid
  - wpb_preview
---

# FPB App Proxy Host

## Decision

`/apps/product-bundles/wpb/{publicNumber}` is the only FPB storefront document host. `publicNumber` is a positive, monotonic integer scoped to the shop. Shopify verifies and forwards the request through the installed default app-proxy root. The Remix route verifies the proxy HMAC before database access, resolves the bundle by `(shopId, publicNumber)`, and returns `application/liquid`, so Shopify wraps the response in the active theme layout.

Active and unlisted bundles are public. Draft bundles require a 15-minute `wpb_preview` token bound to version, shop, the internal bundle ID, and expiry. The public number is routing identity only; widget configuration, analytics, cart contracts, and authorization continue using the internal bundle ID. Archived, missing, cross-shop, invalid-number, opaque-ID, and invalid-preview requests return `404`; invalid Shopify signatures return `400`.

`Bundle.publicNumber` is unique with `shopId` and is non-null only for FPBs. `Shop.lastFpbPublicNumber` is incremented atomically in the same database transaction that creates an FPB. The migration backfills existing FPBs per shop in `createdAt`, then `id`, order and advances each shop counter to the assigned maximum. Deleted numbers are not reused.

Admin Preview actions mint a fresh signed URL for every FPB status. Public bundles do not require the token, but using the same stateless action for active, unlisted, and draft previews prevents Admin surfaces from diverging and guarantees a new URL on every click. The click handler reserves a blank tab synchronously, before awaiting the authenticated preview response, then navigates that tab to the signed URL so browser popup protection does not discard the preview.

The Liquid response embeds the complete formatted runtime configuration in `data-bundle-config`. The single app embed detects that marker and loads widget JavaScript and CSS from theme-extension assets through Shopify `asset_url`. App-proxy asset URLs and a Page fallback are not supported.

## Canonical URL

The application builds one canonical FPB URL:

```text
https://{shop}/apps/product-bundles/wpb/{publicNumber}
```

The application retains the established `/apps/product-bundles` root because
Shopify treats `prefix` and `subpath` as installation-scoped values. A TOML
change applies only to new installations; existing shops keep their installed
path unless the merchant customizes it or reinstalls the app. Shopify does not
provide an Admin or Storefront API for reading that path proactively. Keeping
the established root avoids split proxy contracts and preserves existing FPB
links and every signed FPB/PPB storefront API call. Merchant-customized proxy
paths remain unsupported by this host contract. PPB remains at
`/products/{handle}`.

The internal SIT app is the deliberate exception to the production root. Its
Shopify configuration and QA-store installation use
`/apps/product-bundles-sit`, and the SIT server sets
`STOREFRONT_PROXY_ROOT=/apps/product-bundles-sit`. This prevents PROD and SIT
from competing for one store-owned proxy path when both apps are installed on
the same QA store. Production does not set an override and therefore continues
to use `/apps/product-bundles`. Both configurations retain Shopify's `apps`
prefix; only the installation-specific subpath differs.

Embedded Admin code cannot infer an installed storefront path from its own
`/app/...` browser location, and browser bundles cannot read the server's Node
environment. The authenticated FPB configure loader therefore resolves the
environment-specific root on the server and carries that value through the
controller into preview URL construction. Storefront FPB code resolves the
root independently from the signed `/wpb/` document pathname. Neither surface
falls back to the production path when the required runtime context is absent.

The server writes the resolved complete root into the existing app-owned shop
`$app.ppb_storefront_runtime` JSON. Theme Liquid reads that Shopify-hosted value,
the app embed exposes it to its compiled runtime, and direct Product Page and SDK
entrypoints initialize the shared proxy-path builder from the same value. A
malformed configured value is rejected rather than silently sending requests to
the production app. An FPB document can also infer its active proxy root from
the current `/wpb/` pathname so subsequent same-page requests remain on the
signed path that served the document.

The storefront proxy resolver is bundled into the generated widget and SDK
assets. Any change to `app/config/storefront-proxy-routes.ts` must therefore be
followed by `npm run build:widgets`; committing only the TypeScript source leaves
Shopify serving a generated bundle that still calls the previous proxy root.
Chrome verification must inspect both the FPB document pathname and the actual
runtime-token request URL before the environments are considered isolated.

Changing only the SIT TOML is insufficient for an existing installation.
Shopify keeps the installed prefix and subpath until the merchant customizes
the App Proxy URL in Admin or reinstalls the app. The code configuration, SIT
environment value, and installed SIT proxy URL must agree.

## Parent product routing

Normal FPB parent-product synchronization ensures redirects from any stored or
live merchant-facing product handle to the app-proxy path, then moves the
synthetic parent to `wpb-parent-{bundleId}` with Shopify's automatic handle
redirect disabled. An already-correct redirect or internal handle is accepted.

The internal parent-product handle intentionally continues using the database
bundle ID because it is app-owned and not the merchant-facing FPB URL. Its
Shopify redirect target uses the public number. Normal storefront sync and the
deployment general sync both re-run this parent-host contract, updating stored
redirects after the public-number migration without accepting old opaque URLs.

Shopify can return percent-encoded URL redirect paths even when the stored
product handle contains Unicode. Redirect lookup and exact-path comparison
normalize percent escapes before deciding whether to create or update a
redirect; otherwise an existing redirect can be misclassified as missing and
`urlRedirectCreate` returns `Path has already been taken`.

Shopify applies URL redirects only when the source path returns `404`. Moving the synthetic FPB parent to its app-owned internal handle makes the old merchant-facing path redirect-eligible while keeping the product `UNLISTED`, published, and available as the storefront cart and Cart Transform identity. The handle update sends only product ID, handle, and `redirectNewHandle: false`; it does not write status, publication, media, variants, or merchandising metadata. New FPB parents start with the deterministic internal handle, while PPB handles remain product-hosted and merchant-owned.

The single app embed redirect remains a safety fallback for an FPB parent whose
handle has not yet been normalized by save/sync. It does not redirect PPB
parents and is disabled when `request.design_mode` is true so Theme Editor
remains usable. After normalization, Shopify's platform redirect is the primary
and faster path because the old product URL no longer owns a valid resource.

The Admin no longer creates, publishes, selects, renames, or writes metafields
to Shopify Pages. FPB preview performs the normal storefront sync and returns a
fresh signed app-proxy URL in the same authenticated response. Product-page
upsell placement opens the matching product-template Theme Editor block
directly; it does not select a Shopify Page.

The legacy Page columns remain temporarily in Prisma only so dashboard deletion
can clean the public and preview Page GIDs stored by older bundles. No current
save, sync, preview, placement, slug, or runtime DTO writes those columns.

Dashboard deletion is also a Page cleanup boundary while legacy Page columns
remain. Deleting an FPB deletes its distinct stored public and preview Page GIDs
before deleting the bundle row. An already-missing Page is accepted for retry;
any other Shopify Page deletion error preserves the bundle row and its Page
references. PPB deletion does not call the Page API.
