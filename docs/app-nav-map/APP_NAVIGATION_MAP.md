---
schema_version: 1
id: app-navigation-map
title: Wolfpack Product Bundles App Navigation and UI Map
type: navigation-map
status: authoritative
summary: Routes, screens, actions, modals, and storefront-preview flows for the embedded app.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
systems:
  - remix-routes
source_paths:
  - app/routes/app/
  - app/routes/api/
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - navigation
keywords:
  - dashboard
  - configure
---

# Wolfpack Product Bundles — App Navigation & UI Map

> **KEEP THIS UP TO DATE.**
> Any time a new page, modal, tab, sidebar section, or user flow is added or removed,
> this document **must** be updated. See CLAUDE.md for the enforcement rule.

**Last Updated:** 2026-08-27
**Environment mapped:** SIT (`wolfpack-product-bundles-sit`)
**Test store:** `wolfpack-store-test-1.myshopify.com`

All merchant-facing Admin pages expose both the Shopify Admin breadcrumb and an
app-owned back arrow. Dashboard, the `/app` welcome/auth entry point, billing
callbacks, and resource/API routes are excluded. Both controls share the same
page callback so configure and Settings dirty-state guards cannot be bypassed.

---

## 1. Top-Level Shell

The app runs inside the Shopify Admin embedded iframe. The outer Shopify Admin shell
provides a persistent left-nav with the app's registered nav items.

The authenticated `/app` entry renders a stable route-shaped loading shell while
client-side auth parameters resolve. Authenticated shops continue to the dashboard
without exposing a blank iframe. First-create guidance begins only after a successful
bundle creation.

Destination flow:

```
/app with Shopify auth parameters
└── /app/dashboard

/app without auth parameters       → intentional app landing
└── [Get Started]                   → /app/bundles/create
```

### Shopify Admin Left Nav (app section)

```
Wolfpack Bundles SIT
├── [root]              → /app/dashboard          (Dashboard)
├── Settings            → /app/settings
├── Integrations        → /app/integrations
├── Analytics           → /app/attribution
├── Pricing             → /app/pricing
└── Updates & FAQs      → /app/events
```

Pathname-changing navigation uses Shopify's native Admin header loading
indicator and keeps the current route visible until the destination commits.
Same-screen submissions and revalidation do not start it.

**Screenshot:** `screenshots/02-dashboard.png`

---

## 2. Page-by-Page Map

### 2.1 Dashboard — `/app/dashboard`

**Route file:** `app/routes/app/app.dashboard/route.tsx`
**Screenshot:** `screenshots/02-dashboard.png`

```
Dashboard
├── Header: "Dashboard: Wolfpack Bundles"
├── Subheader: "Access your bundles, customer support & more."
│
├── [Button] "Create Bundle"  → opens Create Bundle Modal
├── Language selector → persists one shop-wide embedded Admin UI language for all staff accounts on change
├── Metrics: active bundle count
├── Storefront setup card → action-first core readiness and active-bundle summary
│   └── [Finish setup / View details] → Storefront setup modal
│       └── current theme blocks/embeds with Theme Editor action when needed
├── Section: "Your Bundles"
│   └── DataTable of bundles (empty state if none exist)
│       ├── Bundles per page dropdown → radio choices 10 / 20 / 50
│       └── Per bundle row:
│           ├── [Button] "Bundle Settings" → /app/bundles/{type}/configure/{bundleId}
│           ├── [Button] "Clone" → immediately clones and opens the new draft
│           ├── [Button] "Preview"
│           └── [Button] "Delete" → opens Delete Confirmation Modal
├── Existing founder support card → direct support chat
├── Existing support issues card → feature/storefront/uninstall help and direct support chat
│
├── Section: "Bundle Setup Steps" (visible when no bundles)
│   └── 6-step numbered guide
│
├── Card: "Need Help? Speak to Parth!" (account manager)
│   └── [Button] "Chat with Parth" → opens Intercom chat
│
└── Banner: Proxy health check / upgrade prompts (conditional)
```

Dashboard preview behavior:

- Product-page bundle preview opens `/products/{shopifyProductHandle}`.
- Every full-page bundle preview requests a new 15-minute signed `wpb_preview` URL on each click; active and unlisted bundles remain publicly accessible at the canonical URL without the token.
- First successful preview records the Admin `bundle_previewed` event with bundle id, type, status, and link.
- The bundle table uses Polaris automatic table/list presentation: desktop keeps Name, Status, Type, and Actions columns, while phone containers expose the same record fields and row actions as a stacked list.
- Core bundle work stays above support and education content: create actions, unresolved storefront setup, filters, and bundle actions render before the support cards.
- The App Embed Status banner can be dismissed with its close control for the current dashboard mount.
- The warning-state Enable action opens the App Embed Enable modal; it does not navigate or mark the embed active by itself.

App Embed Enable modal:

```
App Embed Enable
├── Idle: instructional video + Open Theme Editor + Cancel
├── Detecting: spinner while Shopify App Bridge checks the published theme
├── Success: confirmed enabled status + Done
└── Failure: retry Theme Editor + existing support chat action
```

The Theme Editor action uses the existing `activateAppId` deep link. Focus and
visibility returns are deduplicated into one `shopify.app.extensions()` check;
only a confirmed active `bundle-app-embed` changes the banner to success.

#### "Create Bundle" Button

Navigates to: `/app/bundles/create` (bundle type selection entry)

---

### 2.1a Create Bundle Entry — `/app/bundles/create`

**Route file:** `app/routes/app/app.bundles.create/route.tsx`

```
Create Bundle Entry
├── Header: "Select bundle builder type" + "How do bundle builder types work?" link
├── Bundle Type cards: Product Page Builder / Full Page Builder
├── [Button] "Next" / Continue
└── Modal: Bundle name only
    ├── TextField: Bundle name (required, min 3 chars)
    └── [Button] Save → POST action → redirect to existing configure page
```

Create redirect targets:

```
Product Page: `/app/bundles/product-page-bundle/configure/:bundleId?mode=create`
Full Page: `/app/bundles/full-page-bundle/configure/:bundleId?mode=create`
First-install first-bundle tour adds: `&first_load=true`
```

The first-install eligibility claim is consumed only after the bundle and its
required Shopify parent product are created. The subsequent widget-status check
is noncritical; a timeout or error leaves creation successful and the configure
redirect intact.

Configure page storefront sync status:

- Full-page and product-page configure pages do not show a separate Storefront sync status or retry banner.
- Save persists DB changes and publishes Shopify storefront data synchronously before returning a compact success response.
- Existing Sync Bundle actions run the same direct storefront sync path.
- Preview Bundle reserves a tab synchronously and posts one compact `/prepare-preview` request; FPB receives a fresh signed app-proxy URL in that response, while PPB receives its preview token. The reserved tab navigates after the response so popup protection does not discard it. Failed checks close the blank tab and surface through the preview error toast while the button spinner is active.
- Bundle creation and cloning route directly to the bundle type's configure page; there is no intermediate configuration wizard route.

#### Modal: Delete Bundle Confirmation

Triggered by: "Delete" row action

```
Delete Confirmation Modal (centered, small)
├── "Are you sure you want to delete [bundle name]?"
└── [Button] "Delete" / [Button] "Cancel"
```

---

### 2.2 Settings — `/app/settings`

**Route file:** `app/routes/app/app.settings.tsx`

Admin Settings hub:

```
Settings
├── App Bridge breadcrumb: Dashboard back action + Settings title
├── App-owned header: arrow-only back action + Settings title
├── Card: Design
│   └── Opens the preview-first Design workspace
│       ├── Template, component surface, and desktop/mobile selectors above the isolated storefront preview canvas
│       ├── One contextual inspector for the component visible in the preview
│       ├── Phone panes: Preview / Customize
│       ├── Contextual colors inherit Shopify Shop Brand pairs until individually overridden
│       ├── Nested route `/settings-design-preview-frame` renders deterministic FPB/PPB fixtures with production controllers and CSS
│       └── Preview Bundle modal lists saved, storefront-ready active/unlisted FPB and PPB bundles
├── Card: Language
│   └── Shows multilanguage mode, 39 add/remove locale choices, shared Cart & Checkout strings, Landing Page Layout strings, and Product Page Layout strings
└── Card: Controls
    └── Navigates to /app/additional-configurations
```

Primary action:

- The complete Design, Language, and Controls cards are the actions; they do not render separate `Configure` affordances.
- Selecting Design opens the Settings -> Design subpage.
- Selecting Controls keeps the landing cards visible while Shopify's native Admin loading indicator reports navigation to `/app/additional-configurations`.
- While the lazy Design or Language workspace loads after selection, the destination title and a small Polaris spinner render without card skeletons or an artificial delay.
- The Design Control Panel lazy-loads after entry and uses a responsive preview-first workspace: the gutterless preview stage and its selectors sit beside one contextual inspector. On desktop, a vertically centered notch with a Polaris chevron straddles the preview/inspector boundary, remains centered in the visible sidebar edge while scrolling, and collapses the inspector so the width-driven storefront canvas grows without clearing unsaved settings or preview context. The canvas shows a centered Polaris spinner card and remains visually withheld until the isolated preview frame sends its trusted `READY` event. Mobile selection preserves the 390 x 844 storefront viewport inside a decorative iPhone-style body. At phone Admin widths the notch is hidden and a Preview / Customize segmented control remains the authoritative one-pane-at-a-time navigation.
- Preview-only Bundle Type and Template selectors cover Landing Page Standard, Classic, Compact, and Horizontal plus Product Page Product List, Product Grid, Horizontal Slots, and Vertical Slots.
- The template-aware Preview surface control exposes individual components only: Bundle header, Navigation, Categories, Product cards, Product slots, Product picker, Cart / summary, Loading, Validation, and Upsell. Each template shows only the components it owns, and there is no whole-Builder option. Desktop/mobile switching preserves the selected surface when it remains valid.
- Images & GIFs owns the store-level FPB loading screen: merchants can retain the default spinner or select an uploaded GIF through one clickable drop zone, change its background color, and see both choices in the local Loading preview. Image Fit is disabled on the Loading surface because it does not affect that screen. The former per-bundle FPB loading animation control is not exposed.
- Images & GIFs also owns one store-level FPB/PPB Slot Icon and a Slot Icon Presentation selector for every template. Centered badge replaces the native plus icon (recommended 96 x 96 px transparent square); Cover fills the responsive product slot; Fit contains an 800 x 800 px square image inside the responsive product slot.
- Component scenes use fixed logical 1280×1136 desktop and 390×844 mobile canvases that scale and center within the Admin panel. The isolated same-origin frame composes a neutral store header and FPB page or PPB product-detail context around the production widget. Product picker, Loading, Validation, and Upsell invoke the production renderer's corresponding surface.
- Editing a preview-relevant field selects the scene where its effect is visible once per edit. Manual surface selection remains authoritative until the next field edit. Slot product-card fields reveal Product picker, cart/footer fields reveal Cart / summary, and loading, toast, and upsell fields reveal their matching surfaces.
- Unsaved design values are converted through the normalized storefront Design runtime and posted to the frame through a versioned same-origin protocol. The frame uses deterministic local media and fixture data, blocks navigation and cart submission, and disables persistence, analytics, and bundle fetching.
- Local Design controls and template previews remain available without a storefront-ready bundle. The separate Preview Bundle action is disabled while Design values are dirty or saving. Its Polaris modal lists only active/unlisted bundles with a valid FPB public number or PPB product handle, reserves a tab, posts the existing configure `/prepare-preview` action, and navigates to the signed FPB or tokenized PPB storefront URL.
- Relevant Expert Colour Control groups expose `Show Colour Guide` links to the five app-owned AVIF guide paths generated from tracked public PNG sources by CI/CD.
- Settings back actions await App Bridge Save Bar leave confirmation while unsaved changes exist.
- Language uses Polaris web components for locale chips, layout/section navigation, fields, variable guidance, and the contextual save flow. English is mandatory; removing another locale removes it from Landing Page, Product Page, and shared language roots.
- Language and Controls retain unsaved form state while switching configuration sections.
- Settings has one landing owner; selecting a subpage lazy-loads the workspace and returning home is guarded by the contextual save bar.
- Cart Messaging navigation from Controls to Language is also guarded by the contextual save bar.

---

### 2.2a Additional Configurations — `/app/additional-configurations`

**Route file:** `app/routes/app/app.additional-configurations.tsx`

Dedicated Controls workspace:

```
Additional Configurations
├── Landing Page Layout
│   ├── Configuration
│   ├── CSS & Scripts
│   └── Integrations
└── Product Page Layout
    ├── Configuration
    └── CSS & Scripts
```

- Reuses the Settings controls loader, action, persistence, save bar, and discard behavior.
- Configuration includes shared cart messaging for bundle items, original price, and discount display. Landing Page additionally owns checkout providers; Product Page owns its post-add redirect.
- CSS, scripts, selectors, and integrations save through stable field keys into the versioned storefront Controls contract. The deferred video-message player is not exposed as an Advanced tab.
- Deep-links layout, tab, and nested group through `layout`, `tab`, and `group` query parameters.
- Invalid query combinations resolve to the first valid visible tab and group.
- Back navigation returns to `/app/settings` after App Bridge save-bar leave confirmation.

---

### 2.2b Integrations — `/app/integrations`

**Route file:** `app/routes/app/app.integrations.tsx`

Compact Admin Integrations catalog:

```
Integrations Hub
├── App Bridge breadcrumb → previous page, with Dashboard fallback
├── App-owned back action → previous page, with Dashboard fallback
├── Request Integration → opens Crisp with an unsent prefilled request
├── Reviews
│   └── Judge.me → View Setup
├── Page Builders
│   ├── PageFly → View Setup
│   ├── GemPages → View Setup
│   └── Shogun → View Setup
└── Checkout
    ├── GoKwik → View Setup
    └── Shopflo → View Setup
```

Shopify Checkout and Theme Cart Drawer are configured in Settings and are not duplicated in this catalog. All setup actions currently open `https://wolfpackapps.com` until WPB-owned quick setup guides are published.

Setup behavior:

- The static catalog paints immediately and does not own a route-level loading gate.
- Cards display Supported or Guided setup without claiming connection state.
- `View Setup` opens the WPB-owned setup/support destination in a new browsing context.
- `Request Integration` opens Crisp and pre-fills the composer; the merchant must send the message.
- External competitor help URLs are intentionally not embedded in source code; sanitized evidence remains in `docs/competitor-analysis/18-eb-settings-integrations-replication-evidence.md`.
- Page-builder cards describe guided compatibility through the provider-neutral
  Theme App Extension block and HTML marker. Until dedicated WPB guides are
  published, their setup actions use the same `https://wolfpackapps.com`
  destination as the other catalog cards.

---

### 2.3 Analytics — `/app/attribution`

**Route file:** `app/routes/app/app.attribution.tsx`
**Screenshot:** `screenshots/03-analytics.png`

```
Analytics Page (revamped — issue wpb-analytics-revamp-1)
├── Header: "Analytics" + App Bridge breadcrumb and app-owned back action
├── Top UTM Pixel Tracking banner (s-banner) — active vs not-enabled status
│   ├── Dismissal persists in sessionStorage for the current browser tab
│   └── Learn more modal → enable UTM tracking pixel
├── Toolbar: Compare-period chip · [Export CSV] · [Compare on/off] · Date range selector
├── Custom UTM card → App Bridge contextual Save Bar with Save and Discard
├── Attribution backfill → Shopify success/error toast
│
├── ── Section 1 ── FUNNEL HERO ── (app/components/analytics/FunnelHero.tsx)
│   └── Engaged → Added-to-Cart → Checked Out → Revenue bars
│       with drop-off pills between steps (coral)
│
├── ── Section 2 ── 2-up grid ──
│   ├── Engagement Pulse (EngagementPulse.tsx)
│   │   ├── KPI: engaged sessions + delta vs prev period
│   │   ├── KPI: engaged → checkout %
│   │   └── 30-day area chart (teal)
│   └── Revenue Attribution (RevenueAttribution.tsx)
│       ├── KPI: bundle revenue + delta
│       ├── KPI: bundle AOV
│       └── 30-day area chart (gold)
│
├── ── Section 3 ── Bundle Performance Matrix (BundlePerformanceMatrix.tsx)
│   └── Sortable table: name | preset chip | engaged | orders | conv. | AOV | revenue
│       Click row → navigate to /app/bundles/full-page-bundle/configure/$bundleId
│
└── ── Section 4 ── 2-up grid ──
    ├── Live Activity Feed (LiveActivityFeed.tsx)
    │   └── Stream of last-25 BundleEngagement rows w/ relative-time
    └── Top Campaigns (TopCampaigns.tsx)
        └── Top-5 UTM campaigns w/ bar bg + revenue/orders
```

Responsive analytics behavior:

- The route owns a named `analytics-page` query container so toolbar, KPI, chart, and activity layouts respond to the embedded app width.
- Date, comparison, and export actions stack without page-level clipping; matrices preserve every value inside their labelled internal scroller.
- The lightweight route shell, title, and critical funnel heading render before deferred Analytics data.
- Pixel status resolves into the top native banner independently of the deferred dashboard.
- Dashboard JavaScript and CSS are owned by the eager route shell, so deferred Analytics data cannot reveal components before their styles.

**Visual tokens:** `app/components/analytics/shared/tokens.css`

- engagement teal `#0E7C7B`, revenue gold `#B08800`, warning amber `#A36F00`
- 44 px hero numerics · 11 px uppercase labels · 12 px radius · warm `#F5F2EE` bg

**Server helpers:** `app/lib/analytics/engagement-helpers.ts`

- `computeBundleFunnel`, `buildEngagementTrendSeries`, `buildBundlePerformanceMatrix`
- Pure-fn, unit-tested at `tests/unit/lib/engagement-helpers.test.ts`

---

### 2.4 Pricing — `/app/pricing`

**Route file:** `app/routes/app/app.pricing.tsx`
**Screenshot:** `screenshots/04-pricing.png`

```
Pricing Page
├── App Bridge breadcrumb + app-owned back action → previous page, Dashboard fallback
├── Subscription quota card (current usage)
│
├── Plan cards: Free vs Grow
│   └── [Button] "Upgrade to Grow" → POST → Shopify billing redirect
│
├── Feature comparison table
│
├── Value props section
│
├── FAQ accordion
│
└── Modal: Upgrade Confirmation (before billing redirect)
```

The App Bridge title renders immediately. A small Polaris spinner occupies the
body while subscription data resolves; the route does not render card-shaped
skeletons.

At phone widths, the FPB Bundle Setup sidebar becomes a native disclosure whose
summary shows the active section; selecting a parent or child section closes the
disclosure and preserves the existing configure state.

---

### 2.5 Updates & FAQs — `/app/events`

**Route file:** `app/routes/app/app.events.tsx`
**Screenshot:** `screenshots/05-events.png`

```
Updates & FAQs Page
├── App Bridge breadcrumb + app-owned back action → previous page, Dashboard fallback
├── Section: "Latest Updates"
│   └── Accordion items (release notes, e.g. "Landing Page Bundles Now Load Instantly")
│
└── Section: "FAQs & Tutorials"
    └── Accordion items (how-to guides)
```

---

### 2.6 Bundle Configure — Full-Page Bundle

**Route file:** `app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/route.tsx`
**URL:** `/app/bundles/full-page-bundle/configure/:bundleId`

```
FPB Configure Page
├── Header: guarded App Bridge breadcrumb + guarded app-owned back action
├── Bundle name + status badge
│
├── Tabs
│   ├── Bundle Settings
│   │   ├── Bundle name / description
│   │   ├── Status selector → opens Status Modal
│   │   ├── Product selector → opens Product Picker Modal
│   │   └── Bundle Visibility → app-embed status + read-only proxy URL + Copy Link
│   │
│   ├── Steps
│   │   ├── List of configured steps
│   │   └── [Button] "Add Step" → inline step builder
│   │       └── Product/Collection picker per step → opens Product Picker
│   │
│   ├── Discount & Pricing
│   │   ├── Discount type selector: Fixed Amount Off / Percentage Off / Fixed Bundle Price / Buy X, get Y
│   │   ├── Rule cards; Buy X, get Y uses Customer buys/gets, Discount value/type, and Apply Discount to
│   │   ├── Bundle Quantity Options: Box Label/Subtext per eligible rule + Multi Language modal
│   │   ├── Progress Bar: Simple Bar / Step-Based Bar + Multi Language modal
│   │   └── Discount Messaging: per-rule Discount Text, one Success Message, Variables modal
│   │
│   ├── Sync Bundle
│   │   └── [Button] "Sync Now" → ensure parent + metafields; returns canonical proxy URL
│   ├── Bundle Widget
│   │   ├── Master switch + reactive product-page preview
│   │   ├── Mode: Button or Block; Block adds image, title, and description
│   │   ├── CTA + localized title/description/CTA fields
│   │   ├── Target: all bundle products, selected products, or selected collections
│   │   ├── Add browsed product switch
│   │   └── [Button] "Embed Upsell" → opens the product-template Theme Editor with the unified `bundle-upsell` block
│   │
│   ├── Subscriptions                → subscriptions section
│   │   ├── Enable switch + provider-neutral common selling-plan discovery
│   │   ├── Plan subset, default purchase option, one-time and per-plan copy
│   │   ├── Product-card discount display and localized copy
│   │   └── Uses the global configure SaveBar; no section-specific save action
│   │
│   └── Select Template        → select_template section
│       ├── Heading: "Customize your bundle"
│       ├── [Button] "Customize Colors & Language" → /app/settings
│       └── 2×2 template grid (FPB: Standard Design, Classic Design, Compact Design, Horizontal Design)
│           └── Each card: preview placeholder + label + [Select]/[Selected] button
│               Persists: wpbLayoutTemplate (always FBP_SIDE_FOOTER) + wpbPresetId (STANDARD | CLASSIC | COMPACT | HORIZONTAL)
│       └── [Button] "Preview bundle" → opens signed storefront preview in a new tab, closes Customization, then opens Preview Feedback Modal
│
├── Save Bar (App Bridge): [Discard] [Save]
│   └── Save validates required fields for enabled persisted features; invalid drafts stay dirty, open/focus the first affected section, and show inline critical feedback without submitting
│
└── Modals:
    ├── Bundle Status Modal (Draft / Active / Unlisted)
    ├── Product Picker Modal (Shopify resource picker)
    ├── Variables Modal (Discount Messaging variable reference)
    ├── Bundle Quantity Options Multi Language Modal (Box Label / Box Subtext)
    ├── Progress Bar Multi Language Modal (Tier Text / Tier Subtext)
    ├── Subscription Multi Language Modal (shared staged Polaris workflow)
    └── Preview Feedback Modal
        ├── "Bundle is visible on store" → close
        └── "Having issues with the bundle? Contact us" → open Crisp with the bundle preview URL
```

FPB configure has no Shopify Page selector, Page slug editor, Page creation,
Page publishing, or Page-backed preview. The app embed is the only FPB theme
activation prerequisite and `/apps/product-bundles/wpb/{publicNumber}` is the
only FPB document URL. The number is assigned serially per shop; internal bundle
IDs remain confined to Admin routes, runtime data, and signed authorization.

Responsive configure behavior:

- FPB and PPB keep the full Bundle Product and Bundle Setup sidebar on wide screens.
- Tablet and phone containers show Bundle Product first and replace the long setup sidebar with a compact native disclosure labelled with the active parent or nested section.
- Selecting a section closes the mobile disclosure without changing save, dirty-state, or route adapter behavior.
- The compact readiness trigger remains floating without covering editor actions. Opening it uses a labelled native modal dialog: a bounded floating checklist on desktop and a full-width, safe-area-aware bottom sheet on phones.
- The readiness dialog supports Escape, safe backdrop dismissal, focus trapping, internal scrolling, and focus restoration without changing the existing readiness calculation or route adapter props.
- Configure multi-language workflows share one staged Polaris `s-modal`; Apply updates route-owned draft state and Cancel/Escape/backdrop-close discard edits.

---

### 2.7 Bundle Configure — Product-Page Bundle

**Route file:** `app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/route.tsx`
**URL:** `/app/bundles/product-page-bundle/configure/:bundleId`

PPB uses the same SaveBar validation flow as FPB. Required fields and resource
selection are conditional on enabled persisted features; invalid Draft,
Unlisted, and Active saves are blocked before the route action and displayed as
inline critical field errors. Disabled branches are excluded. Subscription
drafts are validated only when enabled and use the same shared configuration
contract as FPB.

```
PPB Configure Page
├── Header: guarded App Bridge breadcrumb + guarded app-owned back action
├── Sidebar Nav (6 sections — clone hierarchy)
│   ├── [📝] Step Setup              → step_setup section
│   ├── Discount & Pricing           → discount_pricing section
│   ├── [👁] Bundle Visibility       → bundle_visibility section  [Pending badge when widget disabled]
│   ├── [✏] Bundle Settings         → bundle_settings section
│   ├── Subscriptions                → subscriptions section
│   └── [📦] Select Template        → select_template section
│
├── Step Setup
│   ├── Bundle product picker (Shopify resource picker)
│   ├── Accordion step cards (DnD reorder)
│   │   ├── Step name, min/max qty
│   │   ├── Multi Language actions for step and category copy
│   │   ├── Products / Collections pickers
│   │   ├── Step conditions
│   │   └── isFreeGift toggle + add-on fields and Multi Language actions for step, section, and footer copy
│   └── [+ Add Step] button
│
├── Discount & Pricing
│   ├── Enable toggle + discount type selector: Fixed Amount Off / Percentage Off / Fixed Bundle Price / Buy X, get Y
│   ├── Buy X, get Y rule builder (shown when selected)
│   │   └── Per-rule: Customer buys, Customer gets, Discount value/type, Apply Discount to
│   ├── Standard and Fixed Bundle Price rule builders (shown for other types)
│   ├── Bundle Quantity Options sub-section
│   │   ├── Per-rule: Box Label + Box Subtext inputs + Make this rule default action
│   │   └── Multi Language modal: Select Language, Box Label, Box Subtext
│   ├── Progress Bar sub-section
│   │   ├── Style: Simple Bar / Step-Based Bar radio
│   │   └── Multi Language modal: Select Language, Tier Text, Tier Subtext
│   └── Discount Messaging sub-section
│       ├── Per-rule Discount Text + one global Success Message
│       └── Variables modal: five supported discount template variables
│
├── Bundle Visibility
│   ├── Shared FPB/PPB Polaris surface
│   ├── App Embed Status (inline enable action and status badge)
│   ├── Publishing Best Practices (responsive placement cards with expandable setup guides)
│   ├── Your Bundle Link (read-only field + copy action)
│   └── Bundle Widget sub-section
│       ├── Toggle: upsellWidgetEnabled
│       ├── Disabled state keeps all saved settings visible, subdued, and inert
│       ├── Display Mode: choice list (block / button)
│       ├── Block-only image, title, and description; CTA in both modes
│       ├── Multi Language: title, description, and CTA
│       ├── Display On: choice list (all / specific_products / specific_collections)
│       ├── Product or collection resource picker for the active specific target
│       ├── Auto-Select Browsed Product: switch (autoSelectBrowsedProduct)
│       └── Embed Upsell → unified `bundle-upsell` placement block
│   └── Bundle Embed sub-section
│       ├── Master switch: Embed Bundle Builder on Product Pages
│       ├── Disabled state keeps all saved settings visible, subdued, and inert
│       ├── Canonical localized Title + Sub Title
│       ├── Display On: all bundle products / specific products / specific collections
│       ├── Product or collection resource picker for the active target
│       ├── Add browsed product to bundle
│       └── Place Block → product-template selector → `bundle-product-page-embed` Theme Editor deep link
│
├── Bundle Settings
│   ├── PPB compare-at prices are product-driven; no per-bundle visibility control
│   ├── Pre Selected Product
│   │   ├── Enable toggle
│   │   ├── Disabled state keeps configured title and products visible, subdued, and inert
│   │   ├── Tip banner
│   │   ├── Default products title
│   │   ├── Multi Language
│   │   └── Browse Products (Shopify resource picker)
│   ├── Enable Quantity Validation
│   │   ├── Enable toggle
│   │   ├── Maximum allowed quantity per product
│   │   ├── Pro Tip banner
│   │   ├── FPB only: Product Slots toggle
│   │   ├── FPB only: Product Slots helper text
│   │   ├── FPB only: Slot Icon [Change Icon] opens bundle-level image picker; [Reset] clears icon
│   │   ├── Settings -> Design: store-level FPB/PPB Slot Icon and Centered badge / Cover / Fit presentation control
│   │   └── FPB only note: only applies when rules are quantity-based
│   ├── Cart line item discount display
│   │   └── [Button] "Edit Defaults" → /app/settings
│   ├── Bundle Banners (bundleBannerDesktopUrl + bundleBannerMobileUrl)
│   ├── Custom CSS textarea (bundleLevelCss — sanitized via processCss)
│   └── Bundle Status
│
├── Subscriptions
│   ├── Bundle Subscriptions
│   ├── How to setup?
│   ├── Text: "Allow customers to purchase the bundle as a subscription"
│   ├── Enable switch
│   ├── [Button] "Get Subscription Plans" → POST validateSellingPlanGroups
│   ├── One common selling-plan group and merchant-selected plan subset
│   ├── Default purchase option, one-time copy, plan copy, and translations
│   ├── Shared staged Polaris translation modal for common and per-plan copy
│   ├── Uses the global configure SaveBar; no section-specific save action
│   └── No-common-plan warning when every selectable variant does not share a plan
│
├── Select Template
│   ├── Heading: "Customize your bundle"
│   ├── [Button] "Customize Colors & Language" → /app/settings
│   └── 2×2 template grid (PPB: Product List, Product Grid, Horizontal Slots, Vertical Slots)
│       └── Each card: preview placeholder + label + [Select]/[Selected] button
│           Persists: wpbLayoutTemplate (PDP_INPAGE | PDP_MODAL) + wpbPresetId (CASCADE | COGNIVE | MODAL | SIMPLIFIED)
│   └── [Button] "Preview bundle" → opens signed product preview in a new tab, closes Customization, then opens Preview Feedback Modal
│       ├── "Bundle is visible on store" → close
│       └── "Having issues with the bundle? Contact us" → open Crisp with the bundle preview URL
│
└── Floating Readiness Gauge (position: fixed, bottom-left)
    ├── Circular SVG progress ring (score 0–100)
    ├── Expandable checklist: Steps configured, Bundle product linked,
    │   Discount set up, Widget enabled, App embed active
    └── Click to expand/collapse
```

At phone widths, the PPB Bundle Setup sidebar uses the same active-section
disclosure behavior as FPB, including nested Step Setup and Bundle Visibility
items.

**Widget storefront features (as of v2.9.0):**

- Step slot cards (empty/filled/locked states) with `addonLabel` for free gift tabs
- Quantity option pills (from `displayOptions.bundleQuantityOptions`)
- Gift message UI: textarea + optional From/To fields + char counter
- Progress bar (from `displayOptions.progressBar`)
- Gift message cart line item with `_bundle_id` + `_gift_message` properties
- Horizontal/Vertical Slots open a shared 85dvh picker with a fixed header and
  footer, internally scrolling two/four/five-column catalog, native grouped
  variant selectors, validation-owned quantity states, and an editable stacked
  product-details sheet. Product List/Grid retain their in-page card flow.

---

### 2.8 Billing — `/app/billing`

**Route file:** `app/routes/app/app.billing.tsx`

```
Billing Page
├── App Bridge breadcrumb + app-owned back action → previous page, Dashboard fallback
├── Success / Error banners (conditional on ?upgraded=true or error param)
├── Subscription quota card
├── Current plan display
└── [Button] "Upgrade" / "Cancel subscription"
```

**Billing callback:** `/app/billing/callback` — confirms charge, redirects back.

---

## 3. User Flows

### Flow A: Auth

```
/ (landing)
  └── not authenticated → /auth/login → OAuth → /auth/callback → /app/dashboard
```

### Flow B: Create & Configure Bundle

```
/app/dashboard
  └── [Create Bundle] → /app/bundles/create → select type + enter name → POST
      └── redirect → /app/bundles/{type}/configure/{bundleId}?mode=create
          └── first eligible create adds &first_load=true and opens the guided tour
          ├── Fill Bundle Settings tab
          ├── Add Steps tab
          ├── Set Pricing tab
          └── [Save] → [Sync Bundle tab → Sync Now]

/app/dashboard
  └── [Clone] → immediate POST (no confirmation)
      └── follow response redirectTo → /app/bundles/{type}/configure/{bundleId}?mode=create
```

On tablet and phone containers, configure section changes use the compact current-section disclosure.

### Flow C: Design Customisation

```
/app/settings
  └── Click Design card → Settings -> Design panel opens
      ├── Existing Design sections and fields render in one inspector pane
      ├── Desktop → collapse or restore the inspector from its boundary chevron
      ├── Phone width → switch between Preview and Customize panes
      ├── Select preview-only bundle type, template, surface, and desktop/mobile viewport
      ├── Change setting → normalized Design CSS updates the isolated production renderer immediately (no persistence)
      ├── Slot product-card field → Product picker modal/bottom sheet is revealed
      ├── Cart/footer field → Cart / summary surface is revealed
      ├── Loading, toast, or upsell field → matching production-renderer surface is revealed
      ├── Preview blocks add-to-cart and form submission
      └── [Save] → Save Bar submits → toast confirmation
```

### Flow C2: Unsaved Navigation Protection

```
Dirty Admin form
  └── App nav, Settings back, configure Design Control Panel, or PPB section change
      └── App Bridge Save Bar leaveConfirmation()
          ├── Discard/leave → requested navigation continues
          └── Stay → current form and unsaved values remain
```

### Flow D: Billing Upgrade

```
/app/pricing
  └── [Upgrade to Grow]
      └── Upgrade Confirmation Modal → confirm
          └── POST /api/billing/create → Shopify billing URL
              └── Merchant approves → /app/billing/callback?charge_id=...
                  └── confirm charge → /app/billing?upgraded=true
```

### Flow E: Bundle Checkout Pricing Safety

```
Storefront bundle add
  ├── parent-product PPB → Shopify-hosted schema-v3 snapshot + direct Storefront API hydration
  │   └── synchronized signed bundle/line tokens + component lines → Shopify cart pipeline
  └── FPB and service-dependent embed surfaces → online signed runtime token + component lines
      └── Cart Transform MERGE applies verified bundle pricing
          ├── success → transformed parent line proceeds to cart / checkout
          └── timeout, resource limit, or execution failure
              └── CartTransform blockOnFailure=true → cart / checkout error; unmodified pricing is not accepted
```

### Flow F: Reactive Checkout Bundle Offers

```
Checkout order summary → Bundle & Save
  └── group controls by signed parent offer-group ID
      ├── gift check/uncheck → add/remove cart line
      ├── add-on selection → add/replace cart line
      └── quantity change → request exact signed token
          └── POST /api/checkout-bundle-offer-token with checkout session token
              ├── current merchant config authorizes tier, variant, quantity, and discount
              └── one updateCartLine changes quantity/variant and signed attributes
                  ├── native discount allocation refreshes → keep change
                  └── API, inventory, or allocation failure → restore prior line state
```

---

## 4. API Routes Reference

> These are backend-only — not navigable pages. Listed for DevTools network debugging.

| URL Pattern                                                    | Purpose                                                                                                                                                                                                         |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/apps/product-bundles/api/bundle/:id.json`                    | HMAC-verified canonical storefront bundle response: exact `{ success, bundle }`; field-projection queries do not change the response shape                                                                      |
| `/apps/product-bundles/api/bundles.json`                       | All active bundles for shop                                                                                                                                                                                     |
| `/apps/product-bundles/api/fpb-upsells.json`                   | Signed, shop-scoped FPB product-page offer lookup by product, collections, and locale; returns eligible minimal DTOs with private ETag caching                                                                  |
| `/apps/product-bundles/api/ppb-embed.json`                     | Signed, shop-scoped Product Page Bundle embed lookup by product, collections, and locale; returns the first eligible formatted PPB with localized copy and private ETag caching                                 |
| `/apps/product-bundles/api/page-builder-embed.json`            | Signed direct page-builder lookup: resolves an Active or Unlisted PPB by generated parent-product handle or an FPB by shop-scoped public number; returns a formatted preloaded bundle with private ETag caching |
| `/apps/product-bundles/api/cart-bundle-details`                | Signed storefront route that merges EB-style cart `bundle_details` metafield entries                                                                                                                            |
| `/apps/product-bundles/api/storefront-products`                | Signed Storefront-context product hydration with ID validation and inventory normalization                                                                                                                       |
| `/apps/product-bundles/api/storefront-collections`             | Signed Storefront-context collection hydration with product deduplication and membership mapping                                                                                                                 |
| `/apps/product-bundles/api/cart-transform-runtime-token`       | Signed storefront route that validates selected bundle lines and returns `_wolfpack_bundle_runtime` for Cart Transform / Discount Function verification                                                         |
| `/apps/product-bundles/api/checkout-integration-discount-code` | Signed storefront route that creates short-lived app discount codes for third-party FPB checkout integrations                                                                                                   |
| `/api/checkout-bundle-offer-token`                             | Checkout-session-authenticated route that validates a signed parent and current merchant offer config, then authorizes one exact add-on variant and quantity                                                    |
| `/apps/product-bundles/api/design-settings/:shop`              | CSS vars for storefront widgets                                                                                                                                                                                 |
| `/apps/product-bundles/api/language-settings/:shop`            | Settings -> Language JSON for storefront widget text and cart labels                                                                                                                                            |
| `/api/billing/create`                                          | Initiate subscription                                                                                                                                                                                           |
| `/api/billing/confirm`                                         | Confirm subscription                                                                                                                                                                                            |
| `/api/billing/cancel`                                          | Cancel subscription                                                                                                                                                                                             |
| `/api/activate-cart-transform`                                 | Deploy cart transform function                                                                                                                                                                                  |
| `/api/activate-pixel`                                          | Activate UTM web pixel                                                                                                                                                                                          |
| `/apps/product-bundles/api/proxy-health`                       | Proxy health check                                                                                                                                                                                              |
| `/health`                                                      | Public Render HTTP health check; returns 2xx only when the app and DB are ready                                                                                                                                 |
| `/api/attribution`                                             | UTM attribution analytics data                                                                                                                                                                                  |
| `/api/widget-error`                                            | Widget runtime error logging                                                                                                                                                                                    |
| `/api/webhooks/pubsub`                                         | Pub/Sub webhook handler                                                                                                                                                                                         |
| `/api/inngest`                                                 | Inngest background job handler                                                                                                                                                                                  |

---

## 5. Screenshots Index

| File                                     | What it shows                        |
| ---------------------------------------- | ------------------------------------ |
| `screenshots/02-dashboard.png`           | Dashboard (empty state — no bundles) |
| `screenshots/03-analytics.png`           | Analytics / Attribution page         |
| `screenshots/04-pricing.png`             | Pricing page (Free vs Grow)          |
| `screenshots/05-events.png`              | Updates & FAQs page                  |
| `screenshots/06-create-bundle-modal.png` | Create Bundle modal                  |
