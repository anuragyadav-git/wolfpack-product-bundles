---
schema_version: 1
id: shopify-admin-api
title: Shopify Admin API
type: shopify-integration
status: active
summary: Authentication, rate-limit, and operational contracts for Wolfpack Admin API access.
last_audited: 2026-09-04
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - admin-api
  - offline-session-auth
source_paths:
  - app/shopify.server.ts
  - prisma/schema.prisma
  - app/lib/legacy-offline-token-cutover.server.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
tags:
  - shopify
  - authentication
keywords:
  - offline access token
  - unauthenticated admin
---

# Shopify Admin API

## Rate Limits (corrected)

> ⚠️ `docs/API_ENDPOINTS.md` states "40 requests/second" — **this is incorrect**.

### Actual Rate Limit: Leaky Bucket

- **Capacity**: 1,000 points
- **Leak rate**: 50 points/second (restores 50 points/sec back to 1,000)
- **Cost per query**: varies by operation complexity (1–1,000 points)
  - Simple queries: ~1–10 points
  - `inventoryAdjustQuantities` bulk mutation: higher cost
  - Exact cost returned in `X-GraphQL-Cost-Include-Fields` response header

### Practical Guidance
- Burst up to 1,000 points, then throttle
- Use `X-Shopify-Shop-Api-Call-Limit` header to monitor remaining
- Deduplicate identifiers, batch compatible reads, request at most 250 connection nodes per page, and follow cursors only for overflowing resources
- REST API: separate rate limit, roughly 2 req/sec per store on Basic plans

---

## Authenticated Clients

### Within a Remix request (merchant session)
```typescript
const { admin } = await authenticate.admin(request);
await admin.graphql(/* query */);
```

### Outside a request (webhooks, background jobs)
```typescript
import { unauthenticated } from '~/shopify.server';
const { admin } = await unauthenticated.admin(shopDomain);
await admin.graphql(/* query */);
```
`unauthenticated.admin(shopDomain)` uses the stored offline session token. Exported from `app/shopify.server.ts:140`.

### Expiring Offline Token Compliance

Shopify requires public apps to use expiring offline access tokens for new apps created on or after 2026-04-01, and for all public apps by 2027-01-01.

Wolfpack uses Shopify's official `PrismaSessionStorage` adapter. `Session` persists the adapter fields `expires`, `refreshToken`, and `refreshTokenExpires`; `future.expiringOfflineAccessTokens` is enabled so the Remix package acquires and refreshes expiring offline tokens. Do not read `Session.accessToken` directly from Prisma. Request-bound routes call `authenticate.admin(request)` directly, while background work uses `unauthenticated.admin(shopDomain)`.

Server-side navigation from an authenticated Admin loader or action must use the
`redirect` helper returned by `authenticate.admin(request)`. Do not import
Remix's generic `redirect` for these transitions: Shopify's helper preserves the
embedded Admin context and safely handles navigation inside the Admin iframe.
The `/app` layout is the authentication owner for matched child pages; child
resource routes and mutations that can be requested directly authenticate at
their own boundary. Avoid duplicating authentication only for a child loader
whose sole owner is the authenticated layout, because parallel one-time ID-token
exchanges can race.

Call `authenticate.admin(request)` before parsing or validating a direct Admin
resource request, and keep it outside broad application `try/catch` blocks.
Shopify uses thrown responses for reauthorization and embedded redirects;
catching those responses and converting them to generic JSON errors breaks the
platform auth flow. An action-only resource route should also authenticate its
direct loader before returning `405`.

The `/auth/login` loader and action delegate shop validation and OAuth navigation
to Shopify's `login(request)` helper. The `/auth/$` OAuth route calls
`authenticate.admin(request)` and returns `null` after successful completion;
it must not add a second generic Remix redirect.

Existing non-expiring rows require a one-time operator cutover. Select only offline rows with no expiry or refresh metadata, then call Shopify's native `migrateToExpiringToken` and store the returned session through `PrismaSessionStorage`. Run this temporary utility in SIT first. Production apply requires explicit approval because each successful exchange irreversibly revokes the previous non-expiring token; abort and report the first failed shop.

Production rollout requirement:
- New merchant launches naturally acquire expiring offline tokens.
- Do not deploy the schema cutover until the explicit SIT and production migration gates have completed successfully.

Read-only Admin audits must classify credential state before interpreting a
Shopify `401`. Enforcing PostgreSQL read-only transactions prevents an expiring
session from persisting its rotated token; a subsequent query can therefore
fail even though the refresh exchange itself succeeded. Refresh only rows with
an unexpired refresh token in a separately authorized session-maintenance step,
then rerun the audit read-only. Legacy rows rejected by token exchange and rows
with unusable refresh tokens require a merchant to launch the embedded app so a
fresh browser session token can be exchanged. Never weaken the audit by reading
raw stored access tokens or treating an unaudited shop as ready.

Treat successful authentication and sufficient scopes as separate gates.
`urlRedirects` requires online-store-navigation access; an older otherwise-valid
token can still return `Access denied for urlRedirects field` until the merchant
approves the app's current scopes. Shopify documents HTTP `402` as a frozen shop
that the owner must unfreeze and HTTP `404` as an unavailable resource or shop;
neither condition can be repaired by rotating an offline token.

---

## Embedded Admin Shell Title Bars

Embedded app routes should not emit a `ui-title-bar` when the target UI needs the default app-name shell row. Chrome proof on 2026-05-27 showed Shopify automatically renders the app-name title row after a route stops emitting `ui-title-bar`; adding a route-owned duplicate app header creates a second title strip.

For EB-style configure parity, omit the route breadcrumb title bar and keep the in-frame configure header (`Configure Bundle Flow`, readiness score, preview action) as the route-owned header.

---

## Key Mutations Used

### Product Create/Update

Shopify Admin GraphQL latest (`2026-04` as of 2026-05-27) exposes the current product mutations as:

```graphql
mutation CreateProduct($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
  productCreate(product: $product, media: $media) { ... }
}

mutation UpdateProduct($product: ProductUpdateInput!, $media: [CreateMediaInput!]) {
  productUpdate(product: $product, media: $media) { ... }
}
```

The older `input: ProductInput` argument remains documented only as deprecated for `productCreate` and should not be used for generated bundle product creation or update flows. `ProductUpdateInput` includes `id`, `title`, `descriptionHtml`, `status`, `vendor`, `productType`, `tags`, and related fields.

### Bundle Parent Product Contract

FPB and PPB share the parent-product lifecycle documented in [[Architecture/Bundle Parent Product]]. New parents are created with `ProductCreateInput` as `UNLISTED`, published to Online Store, and given one neutral default variant (`0.00`, continue selling, non-taxable, and `requiresComponents: true`). The returned product ID and actual Shopify handle are persisted before variant configuration or publication so a partial post-create failure can be retried without creating a duplicate.

After creation, title, description, handle, media, and product status are merchant-owned. Explicit bundle sync enforces only the neutral variant, publication, required metafields, and the locally stored live handle. Wolfpack bundle availability changes do not call `productUpdate` and therefore do not change Shopify discoverability.

### Product Media Cleanup

For existing product media, Shopify Admin GraphQL latest (`2026-04` as of 2026-05-27) marks `productDeleteMedia` as deprecated and points to `fileUpdate` instead. To remove an existing media file from a product gallery without using deprecated product media deletion, call:

```graphql
mutation UpdateFiles($files: [FileUpdateInput!]!) {
  fileUpdate(files: $files) {
    files { id }
    userErrors { field message code }
  }
}
```

with variables shaped like:

```json
{
  "files": [
    {
      "id": "gid://shopify/MediaImage/123",
      "referencesToRemove": ["gid://shopify/Product/456"]
    }
  ]
}
```

`FileUpdateInput.referencesToRemove` currently accepts product IDs and removes the file-product association from the product media gallery.

### Inventory Sync
```graphql
mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
  inventoryAdjustQuantities(input: $input) { ... }
}
```
Note: **NOT** `inventoryAdjustQuantity` (deprecated singular form).

### Metafield Write
Used by `bundle-config-metafield.server.ts` to cache bundle config for zero-latency widget load.

### Collection lookup

Admin GraphQL `2026-07` no longer accepts `collection(handle: ...)`. Resolve collection handles with `collectionByIdentifier(identifier: { handle: ... })`. Bundle metafield synchronization aliases unique handle lookups into bounded batches, requests the maximum 250 products in the first page, and follows cursors only for collections that overflow that page.

---

## Storefront API

- Rate limit: ~4 req/sec unauthenticated (higher for authenticated/private tokens)
- Used by widgets for product data when metafield cache is absent
- Proxy route: `/apps/product-bundles/` (Shopify app proxy)
- `/api/storefront-products` accepts numeric Shopify product IDs at the browser boundary, converts them to canonical `gid://shopify/Product/...` values before the Storefront API `nodes` query, and rejects malformed IDs before calling Shopify.
- Product Page category runtime configuration identifies configured products and variants with `selectionId`; category filtering must compare those values with hydrated Storefront API IDs after transport-only normalization.
- Variant `quantityAvailable` and `currentlyNotInStock` require the `unauthenticated_read_product_inventory` Storefront scope. Public proxy routes must include those fields only when the stored offline session scope contains that grant; otherwise Shopify rejects the whole query. When the scope is absent, map missing inventory quantity to `null` and treat it as unbounded in widgets.
