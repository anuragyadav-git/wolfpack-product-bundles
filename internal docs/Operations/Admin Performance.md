---
schema_version: 1
id: admin-performance
title: Admin Performance
type: operations
status: authoritative
summary: Embedded Admin Web Vitals instrumentation, route-level LCP findings, and critical-path constraints.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - app-bridge
  - remix
source_paths:
  - app/components/AdminSectionLoadingState.tsx
  - app/routes/app/app.tsx
  - app/routes/app/app.settings.tsx
  - app/routes/app/app.settings/SettingsLandingShell.module.css
  - app/routes/app/app.settings/SettingsRoute.tsx
  - app/routes/app/app.settings/DesignSettingsView.tsx
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/app/app.dashboard/route.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.dashboard/DashboardDeferredProxyHealthBanner.tsx
  - app/routes/app/app.dashboard/dashboard-app-embed-presentation.ts
  - app/routes/app/app.dashboard/AppEmbedEnableModal.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - app/routes/app/_shared/bundle-configure/deferred-configure-sections.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureOverlays.tsx
  - app/lib/bundle-configure-loader.server.ts
  - app/routes/app/app._index.tsx
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
related_docs:
  - internal docs/Operations/LCP and CLS Playbook.md
tags:
  - web-vitals
  - lcp
keywords:
  - wpbWebVitalsDebug
  - settings
---

# Admin Performance

## Web Vitals Source

Shopify App Bridge is the source of embedded Admin Web Vitals used for Built for Shopify assessment. The root document must keep:

- `<meta name="shopify-api-key" ...>`
- `<script src="https://cdn.shopify.com/shopifycloud/app-bridge.js">`

The App Bridge script should be the first script in `<head>` and should not be pinned to a versioned URL.

Wolfpack does not ship an Admin Web Vitals collector or endpoint. Shopify Web Vitals remains the field-data source. For a major Admin UI change, temporarily recreate the documented Chrome-only LCP bridge in dev/SIT, measure the exact embedded route and candidate, and remove the bridge before commit. Never restore app-owned persistence or `/api/web-vitals`.

Temporary cross-origin verification bridge:

Do not keep the parent-frame `postMessage` verification bridge in committed
runtime code. It was removed after the local dashboard optimization pass. When a
future major Admin UI change requires route-level LCP work and DevTools cannot
read the cross-origin iframe directly, recreate the bridge temporarily in dev/SIT
using the local console API above as the data source, then remove it before
shipping.

Use the summary after repeated route loads to prove local p75. A route passes
the local target only when its p75 is strictly below `2500` ms. For field proof, collect
enough real Shopify Web Vitals samples by route and device class; a single
Chrome session or dev tunnel run is not field p75 proof.

## Embedded Admin LCP Findings

Measured in the Shopify Admin chrome on `agent-5sfidg3m` / SIT using
`?wpbWebVitalsDebug=1`.

| Route | Iframe LCP candidate / source-audited candidate | Fix status |
|---|---|---|
| `/app/dashboard` | Measured: support card description text | Render useful Dashboard content as soon as route data is available. Resolve proxy-health and App Embed status asynchronously in their owned warning surfaces; neither lookup may gate the whole workspace. Keep row action-menu content lazy until merchant intent because closed overlays are not Dashboard page content. Mount the app-embed tutorial media only after the merchant opens its instructional modal so the initial Dashboard route does not request either video source. |
| `/app/bundles/create` | Measured: bundle type thumbnail rendered via `/ppb.avif` | Preloaded in route `links()` and HTTP `Link`; adjacent `/fpb.avif` also preloaded. The thumbnail is now a CSS background with stable dimensions, and local candidate paint was under target. |
| `/app/integrations` | Measured: text content | Remove the artificial 800ms readiness interval; the static integration catalog paints immediately. |
| `/app/events` | Source audit: no first-viewport owned image | No image preload fix |
| `/app/billing` | Source audit: no first-viewport owned image | No image preload fix |
| `/app/pricing` | Measured: pricing text | Render the title immediately and use a small Polaris loading state while deferred subscription data resolves. Do not render card-shaped skeleton geometry. |
| `/app/bundles/cart-transform` | Source audit: no first-viewport owned image | No image preload fix |
| `/app/attribution` | Measured: critical funnel heading | Render the title and critical funnel heading before deferred data. Keep pixel status and the dashboard behind one inline Polaris loading boundary, with dashboard JavaScript and CSS resolving atomically. |
| `/app/settings` | Measured: landing text | Paint the landing cards without awaiting deferred workspace data. The complete Settings workspace, including Design, remains lazy-loaded through one post-click boundary. Do not add speculative preloads. |
| `/app/store-files` / `/app/upload-store-file` | Source audit: images are picker/file content, not initial route hero content | No route preload |
| Configure routes | Measured: text paragraph in the initial configure canvas | Render the loaded configure canvas immediately, fetch product/currency/locales in one Admin GraphQL request, and split inactive sections and closed overlays from the initial production chunk. The App Embed lookup remains a live guard before Preview; it must not gate the editor. |

Pages without first-viewport owned media should be treated as text/bootstrap-bound
unless a future debug run logs an owned image candidate. For text LCP pages, do
not add image preloads speculatively; focus on loader critical path and reducing
first-render JavaScript instead.

## Settings Design Control Panel

The Settings landing route paints its small Polaris card shell immediately;
deferred workspace data is needed only after a merchant selects a workspace.
The workspace implementation remains behind a separate React lazy boundary. The 2026-07-23 local
production build split the initial Settings route (`app.settings`, 2.99 kB /
1.27 kB gzip) from the complete `SettingsRoute` workspace (81.39 kB / 18.60 kB
gzip, plus 22.22 kB / 4.30 kB gzip CSS). The template-specific scene registry,
fixture model, and local surface renderers account for the workspace increase.
Design is statically part of that post-click workspace chunk, so entering Design
does not wait for a second sequential JavaScript request. The workspace chunk is
not required for the first Settings paint.

The landing stylesheet is a CSS-module dependency of `SettingsLandingShell` and
is declared as a Settings-route CSS dependency in the production build manifest.
Do not expose it as an independent route `links()` URL: during client-side Admin
navigation, that separate request can finish after the landing component renders
and cause an unstyled first paint followed by a second styled layout. Keeping the
CSS in the component dependency graph lets Remix preload it with the route module
without adding a render delay or loading-state workaround. The three
landing cards are the complete interactive targets and do not render
separate button-like `Configure` labels. Each card uses a framed section icon,
clear title and description hierarchy, and a trailing directional affordance;
hover, keyboard-focus, and reduced-motion states are owned by the landing shell.
Their desktop content area uses the same two-of-twelve-column gutter on each
side as the template selection surface, and the card group is centered in the
available viewport. The grid uses three columns at wide widths and one column
when the embedded app surface is narrow. After a Design or Language card is
selected, the destination title remains visible and a small Polaris spinner
occupies only the unresolved workspace region. There is no card skeleton or
artificial minimum loading interval.

Controls uses a dedicated route. Selecting its Settings card leaves the landing
cards visible while Shopify's native Admin header indicator reports the Remix
navigation. The Controls route renders its title and a small Polaris spinner
until deferred Settings data is ready.

The Settings workspace owns the Design inspector/preview layout and the
eight-template representative preview. Wide containers use three columns for
section navigation, the larger preview surface, and the active fields. Medium
containers place the preview across the first row with navigation and fields
beneath it. Phone containers expose Preview and Customize as a two-state
segmented control so only one dense workspace pane renders at a time. All
breakpoints are container-driven because the usable width of a Shopify Admin
iframe is independent of the browser's top-level viewport.

The preview uses local fixture markup and media, canonical template descriptors
derived from the storefront registries, and theme values from the normalized
storefront Design runtime. It renders Bundle header, Navigation, Categories,
Product cards, Product slots, Product picker, Cart / Summary, Loading,
Validation, and Upsell as separate deterministic local surfaces. It does not
compose or claim parity for a whole builder. Preview scenes use fixed logical
1280×1136 desktop and 390×844 mobile canvases that scale as a whole to fit their
Admin host, preserving the storefront breakpoint under test. Only slot templates
include Product slots and Product picker. The preview does not
fetch bundle data, load remote media, embed a storefront iframe, duplicate the
widget runtime, mutate a cart, or persist preview state. Local Design editing and
preview rendering therefore remain available when the shop has no storefront-ready
bundle; only the separate Preview Bundle action requires one.

Fixture product PNGs are rendered through `OptimisedImage`, so production builds
emit AVIF/WebP siblings while preserving explicit dimensions. Keep those sources
compact and local; do not preload them on the Settings landing route because the
Design workspace remains behind the post-click lazy boundary.

For interaction acceptance, measure at least ten cache-bypassed Design entries
from card activation until the live preview controls and surface are usable.
The click-to-preview target is p75 at or below `750ms`. Intent-based workspace
prefetching is justified only if the single-boundary implementation misses that
target in SIT.

For local acceptance, collect at least ten cache-bypassed loads of
`/app/settings?wpbWebVitalsDebug=1`, enter Design on each pass, and inspect the
app-owned sample set. The planned Design target is LCP p75 at or below `2000ms`,
with a hard failure at or above `2500ms`, and CLS below `0.1`. Shopify/App Bridge field
metrics after a manual SIT deployment remain the final p75 source of truth.

## Removed Custom Telemetry

The previous app-owned Web Vitals pipeline was retired on 2026-06-12:

- `app/lib/web-vitals.client.ts`
- `app/routes/api/api.web-vitals.tsx`
- Prisma model/table `AdminWebVital`
- npm dependency `web-vitals`

Do not recreate custom `/api/web-vitals` telemetry for BFS eligibility. Use Shopify-collected metrics for BFS and Chrome Performance / Network `Server-Timing` for local diagnosis.

The retired `/api/web-vitals` tombstone route has been removed. Stale clients
receive the normal missing-route response; no app-owned collector, persistence,
or compatibility endpoint remains.

## Critical Path Rule

The `/app` layout loader keeps Shopify authentication on the critical path.
Expiring offline-token acquisition, refresh, and session serialization belong
to Shopify's Remix authentication and Prisma session-storage integration; the
loader does not run app-owned migration or refresh maintenance.

The `/app/dashboard` loader keeps non-critical Admin checks off the response
path. App-embed status is read client-side from `shopify.app.extensions()`;
web-pixel reconciliation remains a post-response background task. The initial
payload contains the shop, bundle summary, and API key required for the native
App Bridge check.

The shared `/app` shell must not import or await providers that do not have
runtime consumers on every Admin page. On 2026-07-10, the global Mantle provider
and server-side Mantle identify call were removed from the app shell after an
audit found no `@heymantle/react` hook usage in Admin routes. Billing still uses
the Shopify billing service directly. Keep any future third-party billing or
analytics provider route-scoped until a shared runtime consumer exists.

## Admin Mobile and First-Load Contract

The authenticated `/app` index renders a centered Polaris spinner with the
localized `Loading your workspace` message while the client resolves auth
parameters and the Dashboard destination. It must not return a blank iframe or
render a route-shaped skeleton during that interval. The `/app/dashboard`
route then paints useful content without waiting for proxy-health or App Embed
status; those checks update only their owned warning surfaces. The App Embed
surface shows a non-dismissible informational spinner while its App Bridge
check is unresolved, even when a resolved banner was dismissed earlier in the
session.

The authenticated `/app` shell calls Shopify's App Bridge `shopify.loading`
API for every child-route transition to a different pathname and stops it when
the destination commits or the effect cleans up. The existing route stays
rendered during that transition. Same-screen revalidation and form submission
do not start the Admin header indicator.

Redux Toolkit, React Redux, Redux, Reselect, and Immer are isolated in
`vendor-state`. Chart-only dependencies remain in `vendor-charts`. Production
manifest verification must show that the app layout and every non-analytics
route avoid `vendor-charts`; only the lazy attribution dashboard and its chart
helpers may reference that chunk.

Merchant workflow roots should use descriptive `s-query-container` names when
their responsive behavior depends on embedded app width. Current shared roots
include `dashboard-bundles`, `settings-landing`, `design-settings`,
`pricing-page`, `billing-page`, `events-page`, `storefront-setup-card`,
`integrations-page`, `analytics-page`, `file-picker`, and
`bundle-configure`. Page shells remain shrinkable, use responsive inline
padding, and keep horizontal scrolling inside labelled data regions rather than
on the document.

Analytics imports the dashboard component and its CSS from the eager
`AttributionRouteShell`. This is an intentional ownership boundary: keeping the
CSS module behind a lazy React component produced a visible unstyled interval
in the Vite-served embedded app, including after hot reloads.
The pixel status promise resolves independently into a native top banner, while
the title and critical funnel heading remain immediately available and the
dashboard data/chart boundary uses the shared CSS-free Polaris loading state.
Analytics has one page-level banner owner: UTM pixel status. Zero-value metric
surfaces communicate the no-data state without a second banner, and backfill
action results use Shopify toast feedback. Informational banners inside the
pixel, backfill, and custom-UTM modals are local to those overlay contexts.

## 2026-07-30 Shared Shell and Onboarding Completion

The authenticated Admin layout uses the App Bridge global and Polaris web
components. `app/root.tsx` loads the unversioned `polaris.js` script immediately
after the required unversioned App Bridge script. The shared `/app` route no
longer loads the React Polaris provider, Polaris translation JSON, the 444KB
legacy stylesheet, or a global Redux provider. The standalone auth login route
retains its route-local React Polaris styling.

The production chunk graph keeps legacy React Polaris in
`vendor-polaris-react`, App Bridge React hooks in
`vendor-app-bridge-react`, Redux in `vendor-state`, and charts in
`vendor-charts`. The 2026-07-30 production manifest showed no shared shell CSS
and no Admin route violations: non-state routes avoided `vendor-state`,
non-Analytics routes avoided `vendor-charts`, and embedded Admin routes avoided
the legacy Polaris chunk and stylesheet. Analytics continued to request its
lazy dashboard JavaScript and CSS in the same import boundary.

The standalone onboarding route has been removed. Authenticated `/app` entries
always continue to the dashboard, so the shared layout no longer queries
`firstCreateTourEligible`. The create handler still claims that flag atomically
after required creation succeeds and uses it only to open the post-create
configure tour. Settings returns its established `settingsPage` and
`previewBundles` loader fields as deferred promises; the landing cards paint
without awaiting them, and the selected workspace owns inline Polaris loading
and its existing error state.

First-create eligibility is claimed with one conditional `updateMany` only
after the bundle and required Shopify parent product exist. A later widget
installation status failure is logged as noncritical and returns
`widgetStatus.checked = false`; it cannot convert the already-created bundle
into a failed create response. Guided-tour dismissal and completion remain
shop-keyed, and Escape now follows the same persistence, focus restoration, and
body-scroll cleanup path.

## 2026-07-06 Attribution LCP Follow-up

A fresh Chrome trace on `/app/attribution?wpbWebVitalsDebug=1&days=7` showed
the lab LCP candidate as the outer Shopify Admin page-title H1 (`Analytics`),
not an iframe chart, banner, or image. The app-owned lever for that candidate is
how quickly the route emits `<ui-title-bar title="Analytics">`.

The attribution route now uses a lightweight shell that renders the title bar
before loading the analytics dashboard module. The dashboard module is delayed
briefly after shell mount so chart and analytics chunks do not compete with the
Admin shell title paint. Support chat auto-load also uses the delayed fallback
instead of `requestIdleCallback`, because Chrome can run idle callbacks before
LCP on quiet traces; explicit support-click loading still opens chat
immediately.

If attribution remains above target in field data, keep optimizing the route
shell and parent Admin boot path first. Do not add attribution image preloads:
the confirmed candidate is text in the Shopify Admin shell.

## 2026-07-10 Candidate Fix Proof

Dev/SIT measurements used a temporary parent-frame `postMessage` bridge to read
the iframe's browser `largest-contentful-paint` candidate from
`PerformanceObserver`. The bridge was removed before committing runtime code.

Spot checks after the candidate fixes:

| Route | Previous candidate/value | Post-fix candidate/value |
|---|---:|---:|
| `/app/attribution` | inactive tracking body copy and deferred funnel title, ~8-9s | `h2#wpb-critical-funnel-hero-title`, 1460ms |
| `/app/dashboard` | `/bundleGallery.avif` ~6164ms, then `/appEmbed.avif` ~4572ms | support card text, 1700ms |
| `/app/bundles/create` | `/ppb.avif` p75 previously above target | `/ppb.avif`, 1156ms |

These are dev tunnel spot checks, not Shopify field p75. Final BFS proof still
comes from Shopify-collected field metrics after deployment.

## 2026-08-23 Settings Design workspace follow-up

Settings -> Design remains behind the existing lazy workspace boundary. Its
preview is deterministic local React/CSS and does not import a storefront
runtime, iframe, or remote bundle data. The workspace now presents the template,
component, and viewport controls with the preview canvas and renders one
contextual inspector; phone containers switch between Preview and Customize
without creating a second preview or persisted pane state.

The Settings loader starts the Storefront Shop Brand query alongside deferred
workspace reads, so the Settings landing response is not held until Brand data
resolves. A fresh Design-entry LCP measurement still requires the temporary
`?wpbWebVitalsDebug=1` bridge in user-provided SIT. Do not commit that bridge;
record the measured candidate and value here after direct Chrome verification,
then remove the temporary runtime code before shipping.

## 2026-08-25 Agent-Store LCP Matrix

Direct Chrome DevTools measured the signed-in `agent-5sfidg3m` SIT app iframe.
Each row uses ten cache-bypassed iframe document loads at 1440 x 900 desktop and
390 x 844 mobile, except PPB first-create mobile, which has nine valid entries.
The temporary cross-origin observer was removed after the pass. Values are local
development-tunnel p75, not Shopify field data.

| Admin surface | Observed iframe candidate | Desktop p75 | Mobile p75 | Baseline result |
|---|---|---:|---:|---|
| App entry redirect (`/app`) | Dashboard text after redirect | 3328ms | 3008ms | Bootstrap flow fails; not a distinct page |
| Dashboard | Support-card description / heading | 2268ms | 2004ms | Pass |
| Create Bundle | PPB thumbnail | 1544ms | 1136ms | Pass |
| Settings landing | Landing text | 3700ms | 2448ms | Desktop fail |
| Additional Configurations | Description paragraph | 2072ms | 1860ms | Pass |
| Integrations | Catalog text | 2876ms | 2412ms | Desktop fail |
| Analytics | Critical funnel heading | 2412ms | 2472ms | Pass, narrow |
| Pricing | Pricing text | 1588ms | 1352ms | Pass |
| Updates and FAQs | Page text | 1304ms | 1064ms | Pass |
| Billing | Plan heading | 2140ms | 2068ms | Pass |
| FPB configure, edit | Step/category paragraph | 3332ms | 4324ms | Fail |
| FPB configure, first-create | Step/category paragraph | 3140ms | 3772ms | Fail |
| PPB configure, edit | Step Setup paragraph | 3012ms | 2592ms | Fail |
| PPB configure, first-create | Step Setup paragraph | 2800ms | 2848ms | Fail |

Candidate-owned fixes from this pass:

- Dashboard, FPB, and PPB no longer gate useful content on App Embed or proxy
  warning lookups.
- Settings landing no longer waits for deferred workspace data or an artificial
  loading-bar interval.
- Integrations no longer waits for an artificial 800ms readiness interval.
- FPB and PPB use one route-blocking Admin GraphQL request for product, currency,
  and published locales instead of three concurrent requests.
- Configure Step Setup stays in the initial module while inactive sections and
  closed overlays are production code-split and loaded after document load.

Ten-load desktop post-fix p75 was 2448ms for Settings and 1304ms for
Integrations. FPB edit improved to 2876ms. PPB edit produced nine valid samples
with a provisional 2900ms p75. Navigation timing showed two dev-only modes:
2.2-2.9s route responses followed by paint within about 20-40ms, or fast
0.5-0.6s responses followed by the unbundled Vite module graph. The production
build emitted the two configure route chunks at 30.18 and 31.60 kB gzip and
separate chunks for every inactive section and overlay group. Therefore the
strict configure target is not proven by the dev tunnel; verify `<2500ms` with
Shopify route/device field p75 after manual SIT deployment. Do not add more
local-only loading placeholders or speculative preloads to force the lab metric.

## 2026-08-27 Settings Design context-frame follow-up

Direct Chrome DevTools repeated ten cache-bypassed Settings loads at 1440 x 900
on `agent-5sfidg3m` while the temporary iframe-to-parent LCP bridge was active.
Nine app-content candidates produced a 2416ms p75. One late 13832ms candidate
was a 1050px data-URI SVG inside a `span`, distinct from the 10808px Settings
content candidate; retaining it makes the raw ten-sample observer p75 2880ms.
This is local dev-tunnel evidence, not an App Bridge or Shopify field p75 pass.

The rapid mobile cache-bypass loop stopped mounting the Shopify app iframe and
left it at `about:blank`, so no mobile LCP sample set was accepted. Mobile
layout verification had already passed in the mounted iframe before the loop.
The temporary observer and parent bridge were removed after measurement. The
Design context-frame work remains behind the existing post-click lazy boundary
and does not add work to the Settings landing render path.
