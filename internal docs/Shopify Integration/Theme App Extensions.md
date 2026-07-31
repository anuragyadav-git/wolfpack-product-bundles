---
schema_version: 1
id: theme-app-extensions
title: Theme App Extensions
type: shopify-integration
status: authoritative
summary: Theme extension handles, activation status, and App Bridge status source for Wolfpack storefront resources.
last_audited: 2026-07-31
owners:
  - engineering
domains:
  - shopify
  - storefront
systems:
  - theme-app-extension
source_paths:
  - extensions/bundle-builder/shopify.extension.toml
  - app/lib/theme-extension-status.ts
  - app/lib/app-embed-status-check.client.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleController.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/usePpbBaseConfigureState.ts
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

The server-side MAIN-theme `settings_data.json` checker remains available for legacy banner hydration and migration diagnostics, but it is not the authoritative client-side status source for the homepage or preview gate.

Configure pages must also reconcile their initial server state with `shopify.app.extensions()` after mount. Shopify app embeds are activated per theme, so a development-theme preview can have the embed active while the published MAIN theme checker reports inactive. Keeping only the loader result produces a false enablement banner even though the same preview theme is already executing the embed. FPB and PPB both use the App Bridge result for their visible banner and Bundle Visibility state. While that result is pending, the configure UI suppresses the disabled banner to avoid flashing stale MAIN-theme state; if the client lookup fails, it falls back to the loader result.

Server-side app embed detection depends on the app handle and app embed block handle in Shopify's settings data, not the extension UID alone. The app handle is fetched only from:

```graphql
currentAppInstallation {
  app {
    handle
  }
}
```

No environment or hardcoded app-handle fallback is allowed. The detected theme
block must start with `shopify://apps/{current-app-handle}/blocks/` and contain
the requested block handle. Missing or mismatched handles fail closed.

An earlier production capture found a mismatch between the queried current app
handle and a legacy handle persisted in theme settings. The detector no longer
masks that configuration mismatch; the Shopify app identity or theme embed must
be corrected instead.
