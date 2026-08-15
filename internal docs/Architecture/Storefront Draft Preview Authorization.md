---
schema_version: 1
id: storefront-draft-preview-authorization
title: Storefront Draft Preview Authorization
type: architecture-decision
status: accepted
summary: Draft FPB and PPB storefront previews use one short-lived stateless token bound to the shop and bundle.
last_audited: 2026-08-10
owners:
  - engineering
domains:
  - storefront
  - admin
systems:
  - bundle-preview
  - app-proxy
source_paths:
  - app/lib/bundle-preview-token.server.ts
  - app/lib/bundle-preview-url.ts
  - app/routes/api/api.bundle.$bundleId[.]json.tsx
  - app/routes/root/wpb.$bundleId.tsx
  - app/routes/app/shared/storefront-sync-action.server.ts
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.ts
related_docs:
  - Architecture/FPB Host Evaluation.md
  - Architecture/Widget Architecture.md
tags:
  - preview
  - security
  - fpb
  - ppb
keywords:
  - wpb_preview
  - draft bundle
  - signed preview
---

# Storefront Draft Preview Authorization

## Decision

Draft FPB and PPB previews use the same 15-minute stateless `wpb_preview` token. The token is HMAC-signed from `SHOPIFY_API_SECRET` and binds version, shop domain, bundle ID, and expiry. It is minted only after an authenticated Admin preview preparation successfully performs the normal storefront sync.

Active and unlisted bundles remain public. Draft bundles require a valid token. Archived, missing, cross-shop, expired, tampered, and cross-bundle requests return `404` so callers cannot distinguish private state from absence.

## Host flow

FPB places the token on the canonical signed app-proxy document URL. The FPB document route verifies both Shopify's app-proxy signature and the bundle preview token before rendering draft configuration.

PPB places the token on the Shopify product preview URL. The product-page widget forwards only `wpb_preview` to its bundle configuration request. Shopify signs that app-proxy request, and the API verifies the proxy shop before verifying the preview token. Other Shopify preview parameters stay on the product URL and are not forwarded to the app proxy.

## Caching and persistence

Preview tokens are not stored in Prisma, metafields, local storage, or app events. Authorized draft API responses use `Cache-Control: private, no-store` and do not participate in conditional public caching. Public active and unlisted responses retain their existing short cache policy.
