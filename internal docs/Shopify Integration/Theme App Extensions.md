---
schema_version: 1
id: theme-app-extensions
title: Theme App Extensions
type: shopify-integration
status: authoritative
summary: Theme extension handles, activation status, and App Bridge status source for Wolfpack storefront resources.
last_audited: 2026-08-24
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
  - app/routes/app/app.dashboard/dashboard-app-embed-enable-flow.ts
  - app/routes/app/app.dashboard/AppEmbedEnableModal.tsx
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
