---
schema_version: 1
id: only-bundles-brand-compatibility-boundary
title: Only Bundles Brand and Compatibility Boundary
type: architecture
status: authoritative
summary: Defines the Only Bundles visible identity and the legacy technical identifiers intentionally preserved for installed-shop compatibility.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - architecture
  - branding
systems:
  - application
  - storefront
  - shopify-extensions
source_paths:
  - app/lib/app-brand.ts
  - public/branding/only-bundles/
  - shopify.app.toml
related_docs:
  - Architecture/System Overview.md
  - Architecture/Bundle Parent Product.md
tags:
  - rebrand
  - compatibility
keywords:
  - Only Bundles
  - legacy identifiers
---

# Only Bundles Brand and Compatibility Boundary

## Visible identity

The production application and publisher identity is **Only Bundles**. The approved bundle-box mark lives in `public/branding/only-bundles/` and uses deep green `#1F3D2E`, sage `#A7C29A`, cream `#F4EDE2`, with coral `#FE8A65` reserved for secondary accents. Production and SIT display names are `Only Bundles` and `Only Bundles SIT`.

All merchant-visible Admin copy, Theme Editor labels, extension descriptions, analytics exports, loading/error states, and product-configuration ownership messages use the current brand.

## Preserved identifiers

The rebrand does not rename contracts that existing installations, carts, bundles, or integrations depend on:

- Shopify client IDs, app handles, extension UIDs, and extension handles.
- App-proxy prefix and subpath.
- `window.WolfpackBundles`, `__WOLFPACK_*`, and `wolfpack-bundles-sdk.js`.
- `_wolfpackProductBundle:*`, `_wolfpack_bundle_runtime`, `_wolfpack_line_auth`, and related cart attributes.
- Existing metafield keys, browser storage keys, Inngest IDs, and package names.
- The `Wolfpack PPB Storefront Runtime` Storefront API token title.

These strings are implementation identifiers, not co-branding. No dual-read fallback or compatibility shim is introduced.

## Parent-product transition

New parents use `Only Bundles`, `only-bundles-parent`, and `smart-cart-hide-bundle-options`. Explicit Sync Product or Sync Bundle adds those tags to existing parents and removes only `WP-Bundles` and `wolfpack-bundle-parent`, preserving all merchant-authored tags.

## Legacy URL stage

The current Render, documentation, company, webhook, and OAuth hostnames remain operational during stage one. Link destinations are centralized in `APP_BRAND.links` where the application owns them, but displayed labels use Only Bundles. Domain migration is a separate coordinated release after replacement endpoints, TLS, DNS, redirects, and installed-shop runtime updates are available.
