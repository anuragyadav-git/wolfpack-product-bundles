---
schema_version: 1
id: shopify-sidekick-integration
title: Shopify Sidekick Integration
type: architecture
status: authoritative
summary: Shopify-native Sidekick data discovery and merchant-confirmed bundle creation contracts for Only Bundles.
last_audited: 2026-09-06
owners:
  - engineering
domains:
  - admin
  - sidekick
systems:
  - bundle-data
  - bundle-create
source_paths:
  - apps/OnlyBundles-app/extensions/sidekick-bundle-data/
  - apps/OnlyBundles-app/extensions/sidekick-create-bundle/
  - apps/OnlyBundles-app/app/routes/app/app.sidekick.bundles.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.create/route.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - shopify-native
  - sidekick
keywords:
  - admin.app.tools.data
  - admin.app.intent.link
  - shopify-product-import
---

# Shopify Sidekick Integration

Only Bundles integrates with Sidekick through Shopify app extensions. It does not expose a custom chatbot, MCP server, AI model, or parallel authentication system.

## Supported capabilities

| Capability | Shopify surface | App implementation |
|---|---|---|
| Search bundles | `admin.app.tools.data` | `search_bundles` queries the current shop's app-owned bundle records |
| Inspect one bundle | `admin.app.tools.data` | `get_bundle_summary` returns a compact current-shop summary |
| Open configuration | Embedded app protocol URL | Data results include the existing configure route as an `app://` URL |
| Create a bundle product | `admin.app.intent.link` with `shopify/product` `import` | Sidekick opens the existing create route and receives the created Shopify Product GID only after merchant confirmation |
| Stage proposed create values | App action tool | `stage_bundle_draft` updates in-page form state without submitting it |

Direct edits of existing bundles and analytics retrieval are not exposed in this version. Shopify doesn't publish a supported application intent type for an app-owned bundle resource. The integration therefore uses documented embedded-app links for existing bundles instead of declaring an unrelated intent or inventing a MIME type.

## Data flow

```text
Sidekick
  -> admin.app.tools.data sandbox
  -> POST /app/sidekick/bundles
  -> authenticate.admin(request)
  -> current-shop Prisma query
  -> compact JSON with app:// configure links
```

The resource route is read-only. It accepts only `search_bundles` and `get_bundle_summary`, bounds result counts to 20, bounds text input to 255 characters, excludes archived bundles by default, returns `private, no-store`, and scopes every database query by the authenticated shop. It reuses the `cors` helper returned by `authenticate.admin`; the Shopify Remix package answers cross-origin requests with the authorization headers required by the Sidekick sandbox.

The data extension calls only the configured application domain. Shopify attaches the sandbox Authorization header automatically, so the app does not issue or persist a separate Sidekick credential.

The 2026-09-06 simplification audit confirmed that request validation has one owner per boundary: the server service validates data-tool requests, while the client helper validates the separate product-import intent and staging-tool payload through one shared draft validator. No duplicated validator or dead extension entrypoint remains. Browser access uses Shopify's typed App Bridge global after checking that the intent response is available, and server status parsing narrows directly to the supported `BundleStatus` values without unsafe casts.

## Creation flow and confirmation boundary

```text
Sidekick invokes shopify/product import
  -> Shopify opens /app/bundles/create
  -> intent data and stage_bundle_draft can prefill name/type
  -> merchant reviews and clicks Save
  -> existing handleCreateBundle path creates the bundle and Shopify parent product
  -> route returns the Product GID
  -> shopify.intents.response.ok({id}) returns control to Sidekick
```

The in-page tool never submits the form. A failed Sidekick create returns the stable `bundle_create_failed` code to the route, and the route resolves the intent with existing localized generic failure copy. Plan limits or upgrade copy are not returned to Sidekick. Leaving the workflow resolves it with `shopify.intents.response.closed()` and creates nothing.

Register `stage_bundle_draft` before reading the current intent or subscribing to intent changes. Sidekick can invoke the tool as soon as the route opens, so consuming the intent first creates a race where the requested tool does not yet exist. The create route must also resolve the global App Bridge object only after client hydration; reading `shopify` during server rendering fails before the intent workflow can mount.

Normal, non-Sidekick bundle creation keeps its existing configure redirect and first-load behavior.

## Extension contracts

- Both app configurations declare one factual `[sidekick].extensions_summary`.
- Every tool uses Shopify's published `tool.json` schema.
- The action declares the supported `shopify/product` `import` intent and Shopify's `shopify-intent.json` meta-schema.
- Intent inputs have no required fields, allowing the merchant to supply missing values in the app.
- Intent success returns exactly one Shopify Product GID through the published product GID schema.
- Descriptions and instructions contain no promotion, credentials, customer data, or instructions that override Sidekick behavior.
- Data responses are capped well below Shopify's 4,000-token response limit. Warm authenticated responses meet Shopify's one-second target; see the SIT infrastructure finding below for the verified cause of longer first-connection timings.

## Development and release verification

The Homebrew Shopify CLI can remain earlier in `PATH` than the upgraded Node-managed CLI. QA must verify the resolved executable, not only the result of a separate global install. Shopify CLI 4.7.1 successfully built the complete SIT app, including both Sidekick extensions and both Rust functions, when the CLI and rustup binary directories were selected explicitly.

Agent-store QA on 2026-09-06 confirmed tenant-scoped discovery, `app://` navigation, cancellation without creation, and a merchant-confirmed product-page bundle create returning Shopify Product GID `gid://shopify/Product/9626660372739`. The created draft then appeared in both the app dashboard and the Sidekick data response. A warm authenticated data request returned in 787 ms with a 435-byte response. Shopify's Dev Dashboard also reported `OK` for the Agent-store Sidekick `extensions/security_scan` target.

Render MCP verification confirmed that both the SIT web service and SIT PostgreSQL database use Render's Free plan. The database is in Ohio, has no connection pool, and expires on 2026-09-16. The Agent-store development requests were served through the local Shopify tunnel, with no corresponding Render web-service request or log entry, so Render web-service spin-down did not cause the measured Sidekick latency. On the same database, `EXPLAIN ANALYZE` measured 0.375 ms of SQL execution, while a new local Prisma process took 3,752.6 ms for its first external database request and 492.7-497.0 ms for subsequent requests on the established connection. The observed cold delay is therefore attributable to the Free, unpooled, remotely accessed SIT database connection path rather than the Sidekick handler or query. Production uses a paid pooled database configuration and must continue to be monitored independently.

For SIT verification:

1. Start the user-managed environment with `npm run dev:sit`.
2. Open the SIT app through Shopify Admin; don't use the CLI `p` shortcut for Sidekick.
3. Use the dev-panel preview for `admin.app.tools.data` and ask Sidekick to search for, inspect, and open an Only Bundles bundle.
4. Ask Sidekick to create a bundle, verify that values are only staged, and confirm that no bundle exists until Save is clicked.
5. Verify success returns to Sidekick with the Shopify Product GID, cancellation creates nothing, and the Dev Dashboard Sidekick security scan reports `OK`.
6. Measure representative data calls against Shopify's one-second target and inspect the sandbox browser console for tool errors.

Deployment remains a manual Shopify app-version release through the repository's approved deploy scripts.
