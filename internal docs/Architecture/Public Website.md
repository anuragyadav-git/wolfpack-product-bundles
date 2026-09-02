---
schema_version: 1
id: public-website
title: Public Website
type: architecture
status: active
summary: Defines the static Only Bundles public site, production-renderer demo boundary, legal content, and release gate.
last_audited: 2026-09-03
owners:
  - product
  - engineering
domains:
  - website
systems:
  - astro
  - cloudflare-workers
source_paths:
  - apps/OnlyBundles-website/
related_docs:
  - Architecture/Repository Layout.md
  - Operations/Deployment.md
tags:
  - public-website
keywords:
  - interactive-demo
  - workers.dev
---

# Public Website

## Purpose and ownership

`apps/OnlyBundles-website` is the public product-education surface for Only
Bundles. It is separate from the authenticated Shopify application and does not
share its Remix runtime, database, Admin API clients, merchant sessions, theme
app extensions, or storefront cart endpoints.

Product claims must be grounded in the current internal feature notes, app
behavior, or Shopify App Store listing. Pricing mirrors the published Free and
Growth plan values and carries a visible verification date. Mutable review
counts, ratings, adoption metrics, or conversion claims are not stored as static
marketing copy.

## Static runtime

Astro pre-renders every route to `dist`. Wrangler uploads that directory as
Worker static assets with `404-page` not-found handling. The project has no
Worker entry point, adapter, bindings, database, Node compatibility flag,
runtime secret, or server-rendered route.

Wrangler validates `compatibility_date` against the current UTC date. During an
Asia/Kolkata date boundary, the local calendar date can still be future-dated
from Wrangler's perspective; use the latest accepted UTC date instead of
forcing the local date.

The public information architecture contains marketing, feature, pricing, Help,
editorial, tutorial, changelog, and legal routes. `/blog/` owns the focused
strategy journal; `/blogs/` owns the production-audited step-by-step tutorial
library. Both remain deliberate public paths rather than aliases.

## Tutorial content model

Tutorials live in `src/content/tutorials/` and are loaded through Astro's
build-time content collection. Every tutorial uses the repository's exact
14-field documentation frontmatter contract. Presentation-only data such as
reading time, screenshot path, alt text, and navigation order lives in
`src/data/tutorials.ts`; it is intentionally separate from durable editorial
metadata.

Only entries with `status: published` are emitted at `/blogs/{id}/`. The
collection schema rejects malformed metadata, and the route rejects a filename
whose content entry ID differs from its stable frontmatter `id`. Tutorial pages
publish canonical and Open Graph metadata plus `HowTo` structured data. The
Workers hostname is the canonical origin until a custom domain is connected;
`SITE_ORIGIN` is the single source to update during that cutover.

Merchant-facing Admin help destinations are centralized in
`apps/OnlyBundles-app/app/lib/tutorial-links.ts`. Contextual actions link to a
specific tutorial or section, while the Welcome footer links to `/blogs/`.
During the custom-domain cutover, update both the website `SITE_ORIGIN` and this
application URL owner so canonical metadata and in-app destinations change
together.

Tutorial screenshots are read-only captures of existing production Admin
states. Capturing documentation must not save fixture changes. Public pages use
the cropped app iframe rather than the outer Shopify Admin shell, include
descriptive alternative text, and must not imply behavior that was not verified
in the current app or authoritative internal feature notes.

## Demo boundary

`/demo/` imports the same `BundleWidgetFullPage` and
`BundleWidgetProductPage` controllers used by the storefront, along with the
same source stylesheets and the Settings Design preview fixture builder. It is
therefore a production-renderer preview, not a separately modelled simulator.

The public boundary deliberately overrides analytics, selection persistence,
controls scripts, external navigation, network, and cart actions. Products,
prices, and preselected quantities are deterministic Shopify-shaped preview
data from `buildStorefrontPreviewFixture`; no merchant data or live store is
connected. The only query interface is `template`, with the four current FPB
and four current PPB template keys. Any invalid value normalizes to `standard`.

## Legal release gate

The website has no visitor analytics beacon, advertising tracker, customer
identifier, merchant-data integration, or custom event sink. Cloudflare serves
the static assets only; introducing analytics later requires a deliberate
implementation and corresponding privacy-policy review.

The public Privacy Policy and Terms of Service identify Only Bundles in Delhi,
India and use `onlybundlesappsupport@gmail.com` as the legal and privacy contact.
The policy is grounded in the application's current Prisma models, Shopify web
pixel, compliance webhook behavior, and evidenced infrastructure providers.
Both routes are indexable and included in the sitemap.

Production deployment runs `npm run release:check` before Wrangler. The legal
content is marked approved, so the current release prerequisites are satisfied
without an analytics environment variable.

## Deployment boundary

The target Worker is `only-bundles-website` on the account's generated
`workers.dev` hostname. Workers Builds installs from the repository root and
uses the root workspace lockfile. Website deployment does not alter Render,
Shopify configuration, merchant data, database schema, or extension versions.
