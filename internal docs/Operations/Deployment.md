---
schema_version: 1
id: deployment
title: Deployment
type: operations
status: active
summary: Deployment commands, environment configuration, and Shopify-managed installation rules.
last_audited: 2026-09-02
owners:
  - engineering
domains:
  - operations
systems:
  - deployment
source_paths:
  - package.json
  - apps/OnlyBundles-app/shopify.app.toml
  - apps/OnlyBundles-app/shopify.app.wolfpack-product-bundles-sit.toml
  - apps/OnlyBundles-website/wrangler.jsonc
related_docs:
  - Operations/Deployment General Sync.md
tags:
  - deployment
keywords:
  - Shopify-managed-installation
---

# Deployment

## Environments

| Environment | App | Command |
|---|---|---|
| Production | `wolfpack-product-bundles` | `npm run deploy:prod` |
| SIT | `wolfpack-product-bundles-sit` | `npm run deploy:sit` |

**Never run `shopify app deploy` directly.** Use the root npm commands, which delegate to the Shopify workspace and preserve its configured deployment sequence.

## App Server (Render)

- Node.js 22
- PostgreSQL database
- Server cold-starts: ~3–10s on starter plans (widget has retry logic for this)

### Remix stream dependency contract

The Remix 2 Admin server must use the `turbo-stream` version declared by its
installed `@remix-run/react` package. Do not force a different serializer major
through npm `overrides` or `resolutions`. Remix 2.17.5 declares
`turbo-stream@2.4.1`; forcing version 3 makes the server-side `StreamTransfer`
reader pass an incompatible value to `TextDecoder.decode()`, aborting the HTML
stream before hydration and leaving the embedded app on `Loading your
workspace`.

Single Fetch stays disabled while the application remains on Remix 2. This
keeps the affected serializer off the Admin request path. Re-enable it only as
part of a separately verified framework upgrade whose declared serializer
contract includes the security-patched version.

After changing dependency overrides, regenerate the lockfile with the same npm
major used by the Node 22 image and run `npm ci --dry-run --ignore-scripts`.
`npm install` can succeed against an existing `node_modules` tree even when
optional WASM peer packages are missing from the lockfile; Render's clean
install will reject that lockfile with `EUSAGE` before the build begins.

## Shopify Extension Deploy

1. Increment `widgetVersion` in `apps/OnlyBundles-app/scripts/build-storefront.mjs`
2. Run `npm run build:widgets`
3. Check CSS file sizes: `wc -c apps/OnlyBundles-app/extensions/bundle-builder/assets/*.css` (must be < 100,000 B)
4. Run `npm run deploy:prod` or `npm run deploy:sit`
5. Wait 2–10 min for Shopify CDN cache to propagate
6. Verify: `console.log(window.__BUNDLE_WIDGET_VERSION__)` in storefront DevTools

For CSS changes, also verify the exact served CSS asset. `window.__BUNDLE_WIDGET_VERSION__` only proves the JS bundle is current. Product Page template styles are separate assets such as `bundle-widget-product-page-cascade.css`; Shopify CDN can serve an updated JS bundle while still serving an older CSS asset. Fetch the active CSS URL from the storefront and confirm the expected token or rule exists before accepting visual proof.

## Cart Transform WASM

```bash
cd apps/OnlyBundles-app/extensions/bundle-cart-transform-rs
rustup run stable cargo build --target=wasm32-unknown-unknown --release
```

The SIT and production deploy scripts run this build before `shopify app deploy`:

```bash
npm run deploy:sit
npm run deploy:prod
```

If the rustup proxy cannot find the `wasm32-unknown-unknown` target in a local shell, the explicit stable compiler path has been verified:

```bash
RUSTC="$(rustup which rustc)" cargo build --target=wasm32-unknown-unknown --release
```

## Prisma Migrations

```bash
npx prisma migrate dev   # dev
npx prisma migrate deploy # production
```

## Environment Variables

- App server env: Render dashboard
- App and Prisma dev env: `apps/OnlyBundles-app/.env`
- Extension env: `apps/OnlyBundles-app/shopify.app.toml` + Shopify Partner Dashboard
- Required access scopes come only from each environment's
  `[access_scopes].scopes` TOML value. Shopify-managed installation applies
  required scope changes during app deployment. Do not add a Render `SCOPES`
  variable or a runtime `shopifyApp({ scopes })` duplicate.
- `currentAppInstallation.accessScopes` reports scopes already granted to an
  authenticated installation. It is a verification source, not a bootstrap
  source for required scopes.

## Static Website (Cloudflare Workers)

`apps/OnlyBundles-website` builds to static files and deploys through Wrangler. The production and preview commands are:

```bash
npm run website:verify
npm run website:deploy
npm run website:preview
```

The Worker is `only-bundles-website`. It publishes only to `workers.dev`; no custom domain, runtime bindings, build secrets, routes, or Wrangler environments are configured.

Workers Builds uses the repository root so installation consumes the root lockfile:

- Production branch: `PROD`
- Build command: `npm run website:verify`
- Production deploy command: `npm run website:deploy`
- Non-production deploy command: `npm run website:preview`
- Include paths: `apps/OnlyBundles-website/*`, `package.json`, `package-lock.json`, `.node-version`, `.nvmrc`

Connect the Git repository only after the monorepo commits exist on `PROD`. Repository ownership is dashboard configuration and must not be hardcoded in source.

## Note on vercel.json

`DEPLOYMENT.md` references `vercel.json` for potential Vercel use. This format is deprecated — prefer `vercel.ts` (`@vercel/config`) for new Vercel configuration. The app currently runs on Render, not Vercel.
