---
schema_version: 1
id: admin-performance
title: Admin Performance
type: operations
status: authoritative
summary: Embedded Admin Web Vitals instrumentation, route-level LCP findings, and critical-path constraints.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
  - performance
systems:
  - app-bridge
  - remix
source_paths:
  - app/components/AdminRouteLoadingBar.tsx
  - app/lib/admin-web-vitals-diagnostics.client.ts
  - app/routes/app/app.settings.tsx
  - app/routes/app/app.settings/SettingsLandingShell.css
  - app/routes/app/app.settings/SettingsRoute.tsx
  - app/routes/app/app.settings/DesignSettingsView.tsx
  - app/routes/app/app.settings/DesignLivePreview.tsx
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

The Admin shell registers `shopify.webVitals.onReport(...)` through `app/lib/admin-web-vitals-diagnostics.client.ts`. Shopify's callback reports metric data such as LCP value and ID; it does not include the DOM node. For LCP element attribution, the client pairs Shopify's LCP report with the browser `largest-contentful-paint` `PerformanceObserver` candidate.

Debug usage:

```js
localStorage.setItem("wpb:web-vitals-debug", "1");
location.reload();
```

For embedded Admin URLs where the parent page cannot write iframe storage, add
`wpbWebVitalsDebug=1` to the Admin app URL. Shopify forwards it into the app
iframe and the app logs `Admin Browser LCP Candidate` from the iframe's own
`largest-contentful-paint` observer.

When enabled, LCP reports are logged to the browser console as `Admin Web Vitals` with the metric value and latest candidate element selector. This is diagnostic only and does not persist data.

The debug hook also keeps a local, iframe-only p75 sample set in
`localStorage["wpb:web-vitals-debug:lcp-samples"]`. Each sample stores:

- `route` and generated `routeLoadId` (single page-load correlation)
- `id`, `value`, `timestamp`
- `country` (from Shopify Web Vitals payload)
- `candidate`, `candidateType`, `candidateResource`, `blockingTime`

This does not send data to the app server and must not replace Shopify-collected
field data for BFS.

Console helpers:

```js
window.__wpbAdminWebVitals.getLcpP75Summary()
window.__wpbAdminWebVitals.clearLcpSamples()
```

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

Measured in the Shopify Admin chrome on `wolfpack-store-test-1` / SIT using
`?wpbWebVitalsDebug=1`.

| Route | Iframe LCP candidate / source-audited candidate | Fix status |
|---|---|---|
| `/app/dashboard` | Current local app candidate: support card content text; historical candidates: `/bundleGallery.avif`, `/appEmbed.avif` | Keep only the above-the-fold support avatar preload; render the top cards immediately; do not load decorative dashboard guide screenshots in the initial viewport; use CSS-only thumbnail placeholders for app-embed and resources-card previews. Keep the support card outside delayed Polaris custom-element wrappers; defer the lower resources card until the main content has settled; render row action-menu content only after a row menu is opened. App-embed theme detection is deferred from the initial loader payload and hydrated via a deferred promise; the app-embed card can still run an on-demand status check before opening the theme editor. |
| `/app/bundles/create` | Measured: bundle type thumbnail rendered via `/ppb.avif` | Preloaded in route `links()` and HTTP `Link`; adjacent `/fpb.avif` also preloaded. The thumbnail is now a CSS background with stable dimensions, and local candidate paint was under target. |
| `/app/integrations` | Measured: text subtitle (`p._subtitle...`) | No image preload fix; page LCP is text/bootstrap-bound |
| `/app/events` | Source audit: no first-viewport owned image | No image preload fix |
| `/app/billing` | Source audit: no first-viewport owned image | No image preload fix |
| `/app/pricing` | Source audit: no first-viewport owned image | No image preload fix |
| `/app/bundles/cart-transform` | Source audit: no first-viewport owned image | No image preload fix |
| `/app/attribution` | Loading bar during readiness; historical candidates: critical funnel heading, inactive tracking body copy, deferred funnel hero title | Keep the entire Analytics surface, including the title bar, funnel heading, and pixel-status banner, behind one readiness boundary. Reveal it only after data, lazy modules, and the black loading-bar fill are complete. |
| `/app/settings` | Source audit: dynamic settings preview images are not route hero content | The complete Settings workspace, including Design, is lazy-loaded through one post-click boundary. Its representative preview uses local markup and CSS with no remote media, storefront iframe, widget runtime, or fake Images & GIFs loading state. Do not add speculative preloads; use repeated `?wpbWebVitalsDebug=1` samples for concrete settings-subview evidence. |
| `/app/store-files` / `/app/upload-store-file` | Source audit: images are picker/file content, not initial route hero content | No route preload |
| Configure routes | Source audit: dynamic product/template images depend on loaded bundle state and active section/modal | Do not globally preload; measure concrete FPB/PPB configure URLs and preload only confirmed above-fold candidates |

Pages without first-viewport owned media should be treated as text/bootstrap-bound
unless a future debug run logs an owned image candidate. For text LCP pages, do
not add image preloads speculatively; focus on loader critical path and reducing
first-render JavaScript instead.

## Settings Design Control Panel

The Settings landing route keeps its small Polaris card shell behind the shared
top-edge loading boundary until deferred Settings data and the minimum bar fill
are complete. The bar uses a staged black fill over a subtle track, then keeps a
moving highlight visible if route readiness takes longer than the initial fill.
Reduced-motion users receive the complete static bar without animation. It keeps
the workspace implementation behind a separate React
lazy boundary. The 2026-07-23 local
production build split the initial Settings route (`app.settings`, 2.99 kB /
1.27 kB gzip) from the complete `SettingsRoute` workspace (81.39 kB / 18.60 kB
gzip, plus 22.22 kB / 4.30 kB gzip CSS). The template-specific scene registry,
fixture model, and local surface renderers account for the workspace increase.
Design is statically part of that post-click workspace chunk, so entering Design
does not wait for a second sequential JavaScript request. The workspace chunk is
not required for the first Settings paint.

The landing stylesheet is emitted by the Settings route as a document-head link,
so its centering geometry is present before streamed landing markup can paint;
do not move this CSS back behind the component JavaScript boundary. The three
landing cards are the complete interactive targets and do not render
separate button-like `Configure` labels. Each card uses a framed section icon,
clear title and description hierarchy, and a trailing directional affordance;
hover, keyboard-focus, and reduced-motion states are owned by the landing shell.
Their desktop content area uses the same two-of-twelve-column gutter on each
side as the template selection surface, and the card group is centered in the
available viewport. The grid uses three columns at wide widths and one column
when the embedded app surface is narrow. The same shared
top-edge loading bar is used for initial Settings route readiness and after a
card is selected while the workspace chunk becomes ready. The black bar fills
for a minimum of 800 milliseconds before content can replace it. It does not
use a spinner or card skeleton.

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

`/api/web-vitals` remains only as a no-op tombstone route so stale browser sessions can POST old beacons without hitting authenticated code or emitting warning logs. It must not persist data, authenticate Admin sessions, or import app-owned Web Vitals collection code.

## Critical Path Rule

The `/app` layout loader must keep Shopify authentication on the critical path, but non-critical maintenance should not block the initial shell. Offline-session migration runs in the background and logs failures instead of delaying first render.

The `/app/dashboard` loader must also keep non-critical Admin checks off the
response path. App-embed refresh/status checks and web-pixel reconciliation are
deferred or scheduled as post-response background tasks; the first dashboard
payload should come from the shop, bundle summary, and subscription data needed
to render above the fold.

The shared `/app` shell must not import or await providers that do not have
runtime consumers on every Admin page. On 2026-07-10, the global Mantle provider
and server-side Mantle identify call were removed from the app shell after an
audit found no `@heymantle/react` hook usage in Admin routes. Billing still uses
the Shopify billing service directly. Keep any future third-party billing or
analytics provider route-scoped until a shared runtime consumer exists.

## Admin Mobile and First-Load Contract

The authenticated `/app` index must render a route-shaped skeleton while the
client resolves auth parameters and the dashboard destination. It
must not return a blank iframe during that interval. The skeleton reserves
stable hero and card geometry, exposes an accessible busy state, and disables
its shimmer under `prefers-reduced-motion`.

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

Analytics keeps shell styles with `AttributionRouteShell` and dashboard styles
with the lazy `AttributionDashboard` chunk. One outer readiness boundary owns
the title bar, funnel heading, pixel-status banner, dashboard data, and lazy
chart suspension. Its only fallback is the shared black top-edge loading bar,
which fills for at least 800 milliseconds and remains visibly active while
readiness is pending. Analytics content therefore appears as one
ready surface without skeleton cards, an early banner, or partially assembled
chart panels.

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
without awaiting them, and the selected workspace owns the route-shaped
loading and error states.

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
