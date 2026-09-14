---
schema_version: 1
id: public-website
title: Public Website
type: architecture
status: active
summary: Defines the static Only Bundles public site, production-renderer demo, merchant tutorial evidence, limited-release SDK guide, legal content, and release gate.
last_audited: 2026-09-14
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

`/developers/sdk/` is the canonical indexable developer guide for the
limited-release Only Bundles SDK. Header, mobile navigation, footer, sitemap,
and the embedded Admin Dashboard SDK resource all resolve to this one route.
The guide must match `window.WolfpackBundles` runtime behavior and explicitly
retain the support-enabled, Product Page Bundle, Online Store 2.0, single-SDK,
and no-package-distribution boundaries. Examples construct known DOM elements
and assign product data through `textContent`.

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
canonical origin is `https://onlybundles.com`; `SITE_ORIGIN` owns generated
canonical, Open Graph, structured-data, and sitemap URLs. The static
`public/robots.txt` sitemap destination must match this origin.

Merchant-facing Admin help destinations are centralized in
`apps/OnlyBundles-app/app/lib/tutorial-links.ts`, using
`APP_BRAND.links.company` as the single application website origin. Contextual actions link to a
specific tutorial or section, while the Welcome footer links to `/blogs/`.
During the custom-domain cutover, update both the website `SITE_ORIGIN` and this
application URL owner so canonical metadata and in-app destinations change
together.

Tutorial screenshots are read-only captures of verified Admin and storefront
states. Capturing documentation must not save incidental fixture changes. Public
pages normally use the cropped app iframe rather than the outer Shopify Admin
shell. A tutorial about Shopify-owned catalog configuration may show the
relevant product-editor controls because those controls are the feature being
taught, but the capture must exclude account details, unrelated navigation,
private URLs, and unrelated store data. Every image includes descriptive
alternative text and must not imply behavior that was not verified in the
current app, Shopify's current documentation, or authoritative internal feature
notes.

## Demo boundary

`/demo/` imports the same `BundleWidgetFullPage` and
`BundleWidgetProductPage` controllers used by the storefront, along with the
same source stylesheets and the Settings Design preview fixture builder. It is
therefore a production-renderer preview, not a separately modelled simulator.

The production renderer mounts directly in `/demo/`; there is no device frame,
iframe, scale transform, or manual Desktop/Mobile mode. The template controls
sit above the storefront surface so they do not compress its desktop container
into an artificial narrow column. The renderer receives the browser's actual
available inline size and its production media and container queries therefore
own component placement. A narrow mobile browser renders the production mobile
layout, while a desktop browser renders the production desktop layout.

The direct mount must preserve the storefront bootstrap contract. Every preview
root uses `bundle-widget-container`; full-page roots additionally use
`bundle-widget-full-page`, which activates the `fpb-shell` and `fpb-catalog`
container-query owners. Template changes wait for every stylesheet in
`getStorefrontPreviewStylesheetManifest` to finish loading before the production
controller renders or the demo announces readiness. This is the same ordering
used by the Settings Design preview.

On desktop, the marketing page bounds the direct storefront surface with a
content-driven block size and vertical scrolling so a tall fixture does not
expand the full page. This changes neither the renderer's inline size nor its
internal CSS. At the mobile breakpoint the bound is removed and the widget
returns to natural document flow, avoiding a nested mobile scroll region.

The only public state encoded in the URL is the `template` query. Selecting a
template replaces the direct production mount and preserves the browser's real
responsive context; the demo wrapper does not add rules targeting storefront
widget components.

The public boundary deliberately overrides analytics, selection persistence,
controls scripts, external navigation, network, and cart actions. Products,
prices, and preselected quantities are deterministic Shopify-shaped preview
data from `buildStorefrontPreviewFixture`; no merchant data or live store is
connected. The query accepts the four current FPB
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

The target Worker is `only-bundles-website`, with `onlybundles.com` and
`www.onlybundles.com` declared as custom domains in `wrangler.jsonc`.
GoDaddy retains domain registration; Cloudflare owns authoritative DNS through
`moura.ns.cloudflare.com` and `olga.ns.cloudflare.com`. The existing DMARC and
Domain Connect records are preserved; no MX records existed at cutover.
DNSSEC signing is enabled in Cloudflare. GoDaddy holds the matching DS record
(key tag `2371`, algorithm `13`, digest type `2`). Cloudflare owns signing keys;
GoDaddy owns their delegation in the `.com` registry.
Cloudflare Single Redirect rule `6eae210d712b439996368877a2028f48` redirects
`www` and apex HTTP requests to HTTPS on `onlybundles.com`, preserving paths
and query strings. The generated `workers.dev` hostname remains available for
existing links; canonical metadata points to the custom domain.

Workers Builds installs from the repository root and
uses the root workspace lockfile. Website deployment does not alter Render,
Shopify configuration, merchant data, database schema, or extension versions.

Astro 7 prerender output imports `cookie` from the website build directory.
The website explicitly declares `cookie@2.0.1` as a build dependency so this
import does not resolve to the Shopify app's hoisted `cookie@0.7.2`, which lacks
`parseCookie` and `stringifySetCookie`. A clean lockfile install reproduces the
failure without this workspace dependency.
