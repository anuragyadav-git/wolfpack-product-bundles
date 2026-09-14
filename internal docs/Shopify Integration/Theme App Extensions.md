---
schema_version: 1
id: theme-app-extensions
title: Theme App Extensions
type: shopify-integration
status: authoritative
summary: Theme extension handles, activation status, and App Bridge status source for Wolfpack storefront resources.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - shopify
  - storefront
systems:
  - theme-app-extension
source_paths:
  - apps/OnlyBundles-app/extensions/bundle-builder/shopify.extension.toml
  - apps/OnlyBundles-app/extensions/bundle-builder/blocks/bundle-app-embed.liquid
  - apps/OnlyBundles-app/app/lib/theme-extension-status.ts
  - apps/OnlyBundles-app/app/lib/app-embed-status-check.client.ts
  - apps/OnlyBundles-app/app/storefront/app-embed-marker.ts
  - apps/OnlyBundles-app/app/storefront/app-embed.ts
  - apps/OnlyBundles-app/app/routes/app/app.dashboard/dashboard-app-embed-enable-flow.ts
  - apps/OnlyBundles-app/app/routes/app/app.dashboard/AppEmbedEnableModal.tsx
  - apps/OnlyBundles-app/app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleController.ts
  - apps/OnlyBundles-app/app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbBaseConfigureState.ts
related_docs:
  - docs/bfs-review-remediation-plan.md
tags:
  - shopify
  - theme-extension
keywords:
  - app-embed
  - app.extensions
  - bundle-product-page
---

# Theme App Extensions

Shopify stores app embed activation per theme. `ThemeRole.MAIN` is the currently published storefront theme, and Shopify allows only one main theme at a time. Unpublished and development themes can also have the app embed enabled, but that does not make the live storefront embed active.

The homepage and preview gate now use Shopify App Bridge `shopify.app.extensions()` in the embedded Admin context. The response is normalized into the five resources declared by the extension TOML, with explicit `active`, `available`, or `unavailable` status. The app embed is the global preview gate; product-page previews validate the product-page block separately and do not require the global embed.

The Dashboard warning banner opens an instructional modal before sending the
merchant to Theme Editor through the existing `activateAppId` deep link. Opening
the modal or Theme Editor does not optimistically change status. After the
merchant returns, focus and visibility events are deduplicated into one App
Bridge extension check. A confirmed active `bundle-app-embed` is the only
success result; inactive and rejected checks remain unresolved and expose retry
and support actions. Closing after visiting Theme Editor performs one final
deduplicated check.

Dashboard and configure routes do not parse theme files and do not return an app-embed status payload. They call `shopify.app.extensions()` after mount and fail closed if native extension data is unavailable. Shopify documents this theme-extension data as sourced from the published theme.

Theme Editor links use Shopify's current-theme route:
`https://{shop}/admin/themes/current/editor?context=apps&activateAppId={apiKey}%2F{blockHandle}`.

## SIT and production isolation

An app installation, an app dev preview, and a theme's extension activation are
separate Shopify-owned states. Uninstalling the dormant SIT or production app is
not the normal way to change the storefront environment: uninstall removes that
app's blocks from themes and exercises install-lifecycle cleanup. Theme Editor
activation is the correct control for app embeds and app blocks.

Use separate test stores for SIT and production when possible. When the same
store must retain both apps, isolate them by theme: the production theme must
contain only production app embeds and app blocks, and an unpublished or
development SIT theme must contain only SIT app embeds and app blocks. Preview
the intended theme explicitly. `shopify.app.extensions()` reports the published
theme, so an Admin status check does not prove that an unpublished SIT theme is
configured correctly; verify that theme through its own preview.

For sequential checks on the same theme, activate only one environment at a
time and remove or disable the other environment's app blocks as well as its app
embed. The two installations intentionally have different app-proxy roots
(`/apps/product-bundles` and `/apps/product-bundles-sit`), but they render into
the same storefront document and therefore cannot both own the single bundle
surface deterministically.

Each storefront runtime version containing the ownership guard boots only when
the document contains exactly one `[data-wpb-app-embed]` marker. Multiple
markers produce one diagnostic containing the observed proxy roots and stop
that entry before it publishes the active flag, proxy root, country context,
section-load listeners, or bundle hydration. After the guard is released in
both environments, neither current entry can win through load order. Until
then, and for all normal testing, the dormant embed must remain disabled. This
guard is diagnostic containment for a misconfigured theme; it does not replace
the Shopify-owned activation workflow or select an environment on the
merchant's behalf.

Shopify keeps an `app dev` preview on the selected store after the process
stops. Use the Dev Console **Clean dev preview** action or `shopify app dev clean`
with the SIT configuration before validating the released extension. Cleaning
the preview restores the active released app version; it does not change which
theme app embed or app blocks are active.

Opening an Admin **Preview in store** action and hard-reloading is not sufficient
when Shopify's remote dev preview itself is incomplete. On 2026-09-09, a fresh
SIT product document contained one correctly isolated SIT marker and referenced
the current `dev-<handle>`, but every theme-extension asset under that handle
returned Shopify CDN 404 and Chrome surfaced `net::ERR_BLOCKED_BY_ORB`. The
corresponding files existed in `.shopify/dev-bundle`, including the small
bootstrap stylesheet, so widget code, asset size, browser cache, and duplicate
PROD/SIT embeds were not the cause.

Treat this signature as a stale remote preview session. Stop the active dev
process, run `shopify app dev clean --config
shopify.app.wolfpack-product-bundles-sit.toml`, restart with `npm run dev:sit`,
and open the fresh preview emitted by Shopify CLI. Do not clean while the dev
process is running. Do not disable the app embed as a CDN repair: the PPB app
block independently resolves its JavaScript and CSS through the same extension
version. Do not uninstall either environment; installation lifecycle cleanup is
unrelated to dev-preview publication.

The Admin Dev Console **Previews** column is only a weak diagnostic signal for a
Theme App Extension. It can continue to show `--` after a successful clean
restart even while Shopify serves a new `dev-<handle>` and every extension asset
returns `200`. Do not diagnose the preview from that column alone.

Use a fresh **Preview Bundle** URL, clear Cache Storage, hard-reload with cache
bypass, and inspect the document's actual extension requests. A changed
`dev-<handle>` with successful JavaScript and CSS responses proves the current
preview is usable. If those requests retain the old handle and return `404` or
`net::ERR_BLOCKED_BY_ORB`, stop and repair the CLI preview session before
evaluating PPB or FPB behavior. Chrome can also retain an unused Early Hints
preload for an older handle; treat that warning as non-blocking when the assets
used by the rendered widget come from the new handle and return `200`.
