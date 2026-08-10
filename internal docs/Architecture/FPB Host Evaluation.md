---
schema_version: 1
id: fpb-host-evaluation
title: FPB App Proxy Host
type: architecture-decision
status: accepted
summary: Full Page Bundles use the signed app proxy as their sole storefront document host.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - storefront
systems:
  - fpb-app-proxy
source_paths:
  - app/routes/root/wpb.$bundleId.tsx
  - app/services/bundles/bundle-parent-product.server.ts
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
  - extensions/bundle-builder/blocks/bundle-app-embed.liquid
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

`/apps/product-bundles/wpb/{bundleId}` is the only FPB storefront document host. Shopify verifies and forwards the request through the installed default app-proxy root. The Remix route verifies the proxy HMAC before database access and returns `application/liquid`, so Shopify wraps the response in the active theme layout.

Active and unlisted bundles are public. Draft bundles require a 15-minute `wpb_preview` token bound to version, shop, bundle ID, and expiry. Archived, missing, cross-shop, and invalid-preview requests return `404`; invalid Shopify signatures return `400`.

Admin Preview actions mint a fresh signed URL for every FPB status. Public bundles do not require the token, but using the same stateless action for active, unlisted, and draft previews prevents Admin surfaces from diverging and guarantees a new URL on every click. The click handler reserves a blank tab synchronously, before awaiting the authenticated preview response, then navigates that tab to the signed URL so browser popup protection does not discard the preview.

The Liquid response embeds the complete formatted runtime configuration in `data-bundle-config`. The single app embed detects that marker and loads widget JavaScript and CSS from theme-extension assets through Shopify `asset_url`. App-proxy asset URLs and a Page fallback are not supported.

## Canonical URL

The application builds one canonical FPB URL:

```text
https://{shop}/apps/product-bundles/wpb/{bundleId}
```

Merchant-customized proxy prefixes and subpaths are unsupported by this host
contract. PPB remains at `/products/{handle}`.

## Parent product routing

Normal FPB parent-product synchronization ensures redirects from any stored or
live merchant-facing product handle to the app-proxy path, then moves the
synthetic parent to `wpb-parent-{bundleId}` with Shopify's automatic handle
redirect disabled. An already-correct redirect or internal handle is accepted.

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
