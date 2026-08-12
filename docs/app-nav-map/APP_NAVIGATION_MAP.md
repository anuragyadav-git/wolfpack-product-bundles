---
schema_version: 1
id: app-navigation-map
title: Wolfpack Product Bundles App Navigation and UI Map
type: navigation-map
status: authoritative
summary: Routes, screens, actions, modals, and storefront-preview flows for the embedded app.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - remix-routes
source_paths:
  - app/routes/app/
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

**Last Updated:** 2026-08-13
**Environment mapped:** SIT (`wolfpack-product-bundles-sit`)
**Test store:** `wolfpack-store-test-1.myshopify.com`

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
├── Card: Design
│   └── Shows Settings -> Design controls: brand colors, typography, corners, images and GIFs
├── Card: Language
│   └── Shows multilanguage mode, supported languages, shared Cart & Checkout strings, Landing Page Layout strings, and Product Page Layout strings
└── Card: Controls
    └── Navigates to /app/additional-configurations
```

Primary action:
- The complete Design, Language, and Controls cards are the actions; they do not render separate `Configure` affordances.
- Selecting Design opens the Settings -> Design subpage.
- While the lazy Design or Language workspace loads after selection, the route shows three skeleton cards instead of a spinner.
- The Design Control Panel lazy-loads after entry and uses a responsive three-column workspace: section navigation on the left, the largest app-owned preview in the middle, and active fields on the right. At medium widths the preview spans the first row; at phone widths a Preview / Customize segmented control shows one workspace pane at a time.
- Preview-only Bundle Type and Template selectors cover Landing Page Standard, Classic, Compact, and Horizontal plus Product Page Product List, Product Grid, Horizontal Slots, and Vertical Slots.
- The template-aware Preview surface control exposes only valid local scenes: Builder, Cart / summary, Loading, Validation, and Upsell for every template, plus Product picker for the two slot templates. Desktop/mobile switching preserves the selected surface when it remains valid.
- Images & GIFs owns the store-level FPB loading screen: merchants can retain the default spinner or select an uploaded GIF through one clickable drop zone, change its background color, and see both choices in the local Loading preview. Image Fit is disabled on the Loading surface because it does not affect that screen. The former per-bundle FPB loading animation control is not exposed.
- Builder and Cart / summary use storefront-matched scenes inside fixed logical 1280×960 desktop and 390×844 mobile canvases that scale to fit the Admin panel. Product picker, Loading, Validation, and Upsell remain representative.
- Editing a preview-relevant field selects the scene where its effect is visible. Slot product-card fields reveal Product picker, cart/footer fields reveal Cart / summary, and loading, toast, and upsell fields reveal their matching surfaces.
- Unsaved design values are applied through the normalized storefront Design runtime and a semantic field-target contract; arbitrary CSS, remote preview requests, and cart mutations are rejected.
- Local Design controls and template previews remain available without a storefront-ready bundle. Only the separate Preview Bundle action requires a storefront URL.
- Relevant Expert Colour Control groups expose `Show Colour Guide` links to the five app-owned AVIF guide paths generated from tracked public PNG sources by CI/CD.
- Settings back actions await App Bridge Save Bar leave confirmation while unsaved changes exist.
- At phone widths, Language and Controls section navigation becomes a native disclosure that closes after a section is selected while retaining the current unsaved form state.
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
│   ├── Integrations
│   └── Advanced
└── Product Page Layout
    ├── Configuration
    └── CSS & Scripts
```

- Reuses the Settings controls loader, action, persistence, save bar, and discard behavior.
- Deep-links layout, tab, and nested group through `layout`, `tab`, and `group` query parameters.
- Invalid query combinations resolve to the first valid visible tab and group.
- Back navigation returns to `/app/settings` after App Bridge save-bar leave confirmation.

---

### 2.2b Integrations — `/app/integrations`

**Route file:** `app/routes/app/app.integrations.tsx`

Recovered Admin Integrations hub:
```
Integrations Hub
├── Request Integration action → https://wolfpackapps.com
├── Pre-orders, Pickup & Delivery
│   ├── Stoq → View Setup
│   └── Zapiet → View Setup
├── Subscriptions
│   ├── Skio → View Setup
│   ├── Appstle → View Setup
│   └── Bold → View Setup
├── Reviews
│   └── Judge.me → View Setup
├── Page Builders
│   ├── PageFly → View Setup
│   └── GemPages → View Setup
└── Checkout
    ├── GoKwik → View Setup
    └── Shopflo → View Setup
```

All setup actions currently open `https://wolfpackapps.com` until WPB-owned quick setup guides are published.

Setup behavior:
- Cards display Planned, Guided setup, or Assisted setup without claiming connection state.
- `View Setup` opens the WPB-owned setup/support destination in a new browsing context.
- External competitor help URLs are intentionally not embedded in source code; sanitized evidence remains in `docs/competitor-analysis/18-eb-settings-integrations-replication-evidence.md`.

---

### 2.3 Analytics — `/app/attribution`

**Route file:** `app/routes/app/app.attribution.tsx`
**Screenshot:** `screenshots/03-analytics.png`

```
Analytics Page (revamped — issue wpb-analytics-revamp-1)
├── Header: "Analytics" (ui-title-bar) + breadcrumb to /app/dashboard
├── No-data banner (s-banner) — pixel-active vs not-enabled copy
├── Pixel toggle: Enable/disable UTM tracking pixel
├── Toolbar: Compare-period chip · [Export CSV] · [Compare on/off] · Date range selector
├── Custom UTM card → App Bridge contextual Save Bar with Save and Discard
├── Attribution backfill → persistent success/error banner
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
- The lightweight route shell and its stylesheet render before the lazy dashboard module; the dashboard JavaScript and CSS resolve together behind the route skeleton.

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

At phone widths, the FPB Bundle Setup sidebar becomes a native disclosure whose
summary shows the active section; selecting a parent or child section closes the
disclosure and preserves the existing configure state.

---

### 2.5 Updates & FAQs — `/app/events`

**Route file:** `app/routes/app/app.events.tsx`
**Screenshot:** `screenshots/05-events.png`

```
Updates & FAQs Page
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
├── Header: Bundle name + status badge
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
│   │   └── [Button] "Embed Upsell Block/Button" → opens the product-template Theme Editor directly
│   │
│   └── Select Template        → select_template section
│       ├── Heading: "Customize your bundle"
│       ├── [Button] "Customize Colors & Language" → /app/settings
│       └── 2×2 template grid (FPB: Standard Design, Classic Design, Compact Design, Horizontal Design)
│           └── Each card: preview placeholder + label + [Select]/[Selected] button
│               Persists: wpbLayoutTemplate (always FBP_SIDE_FOOTER) + wpbPresetId (STANDARD | CLASSIC | COMPACT | HORIZONTAL)
│
├── Save Bar (App Bridge): [Discard] [Save]
│
└── Modals:
    ├── Bundle Status Modal (Draft / Active / Unlisted)
    ├── Product Picker Modal (Shopify resource picker)
    ├── Variables Modal (Discount Messaging variable reference)
    ├── Bundle Quantity Options Multi Language Modal (Box Label / Box Subtext)
    └── Progress Bar Multi Language Modal (Tier Text / Tier Subtext)
```

FPB configure has no Shopify Page selector, Page slug editor, Page creation,
Page publishing, or Page-backed preview. The app embed is the only FPB theme
activation prerequisite and `/apps/product-bundles/wpb/{bundleId}` is the only
FPB document URL.

Responsive configure behavior:
- FPB and PPB keep the full Bundle Product and Bundle Setup sidebar on wide screens.
- Tablet and phone containers show Bundle Product first and replace the long setup sidebar with a compact native disclosure labelled with the active parent or nested section.
- Selecting a section closes the mobile disclosure without changing save, dirty-state, or route adapter behavior.
- The compact readiness trigger remains floating without covering editor actions. Opening it uses a labelled native modal dialog: a bounded floating checklist on desktop and a full-width, safe-area-aware bottom sheet on phones.
- The readiness dialog supports Escape, safe backdrop dismissal, focus trapping, internal scrolling, and focus restoration without changing the existing readiness calculation or route adapter props.
- App-owned discard and multi-language workflows share the same native dialog and phone bottom-sheet contract; Polaris-owned modal workflows retain their existing semantics.

---

### 2.7 Bundle Configure — Product-Page Bundle

**Route file:** `app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/route.tsx`
**URL:** `/app/bundles/product-page-bundle/configure/:bundleId`

```
PPB Configure Page
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
│   │   ├── Products / Collections pickers
│   │   ├── Step conditions
│   │   └── isFreeGift toggle + addon fields (label, title, icon, displayFree, unlockAfterCompletion)
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
│   ├── App Embed Status (inline AppEmbedBanner when disabled)
│   ├── Publishing Best Practices (2×2 card grid)
│   ├── Your Bundle Link (copy + preview button)
│   └── Bundle Widget sub-section
│       ├── Toggle: upsellWidgetEnabled
│       ├── Display Mode: radio (block / button)
│       ├── Display On: select (all / specific_products / specific_collections)
│       └── Auto-Select Browsed Product: toggle (autoSelectBrowsedProduct)
│
├── Bundle Settings
│   ├── Pre Selected Product
│   │   ├── Enable toggle
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
│   │   ├── FPB Slot Icon scope: per-bundle Bundle Settings control only; no Design Control Panel route
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
│   ├── [Button] "Get Subscription Plans" → POST validateSellingPlanGroups
│   └── No-common-plan warning when selected products do not share a selling plan group
│
├── Select Template
│   ├── Heading: "Customize your bundle"
│   ├── [Button] "Customize Colors & Language" → /app/settings
│   └── 2×2 template grid (PPB: Product List, Product Grid, Horizontal Slots, Vertical Slots)
│       └── Each card: preview placeholder + label + [Select]/[Selected] button
│           Persists: wpbLayoutTemplate (PDP_INPAGE | PDP_MODAL) + wpbPresetId (CASCADE | COGNIVE | MODAL | SIMPLIFIED)
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

---

### 2.8 Billing — `/app/billing`

**Route file:** `app/routes/app/app.billing.tsx`

```
Billing Page
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
      ├── Phone width → switch between Preview and Customize panes
      ├── Select preview-only bundle type, template, surface, and desktop/mobile viewport
      ├── Change setting → app-owned live preview updates immediately (no persistence)
      ├── Slot product-card field → Product picker modal/bottom sheet is revealed
      ├── Cart/footer field → Cart / summary surface is revealed
      ├── Loading, toast, or upsell field → matching deterministic surface is revealed
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
  └── signed runtime token + component lines → Shopify cart pipeline
      └── Cart Transform MERGE applies verified bundle pricing
          ├── success → transformed parent line proceeds to cart / checkout
          └── timeout, resource limit, or execution failure
              └── CartTransform blockOnFailure=true → cart / checkout error; unmodified pricing is not accepted
```

---

## 4. API Routes Reference

> These are backend-only — not navigable pages. Listed for DevTools network debugging.

| URL Pattern | Purpose |
|---|---|
| `/apps/product-bundles/api/bundle/:id.json` | HMAC-verified canonical storefront bundle response: exact `{ success, bundle }`; field-projection queries do not change the response shape |
| `/apps/product-bundles/api/bundles.json` | All active bundles for shop |
| `/apps/product-bundles/api/cart-bundle-details` | Signed storefront route that merges EB-style cart `bundle_details` metafield entries |
| `/apps/product-bundles/api/cart-transform-runtime-token` | Signed storefront route that validates selected bundle lines and returns `_wolfpack_bundle_runtime` for Cart Transform / Discount Function verification |
| `/apps/product-bundles/api/checkout-integration-discount-code` | Signed storefront route that creates short-lived app discount codes for third-party FPB checkout integrations |
| `/apps/product-bundles/api/design-settings/:shop` | CSS vars for storefront widgets |
| `/apps/product-bundles/api/language-settings/:shop` | Settings -> Language JSON for storefront widget text and cart labels |
| `/api/billing/create` | Initiate subscription |
| `/api/billing/confirm` | Confirm subscription |
| `/api/billing/cancel` | Cancel subscription |
| `/api/activate-cart-transform` | Deploy cart transform function |
| `/api/activate-pixel` | Activate UTM web pixel |
| `/app/app-embed-status` | Authenticated Admin resource route for Preview-button app embed revalidation |
| `/apps/product-bundles/api/proxy-health` | Proxy health check |
| `/health` | Public Render HTTP health check; returns 2xx only when the app and DB are ready |
| `/api/attribution` | UTM attribution analytics data |
| `/api/web-vitals` | No-op tombstone for retired custom Admin Web Vitals beacons; returns 204 for stale POSTs |
| `/api/widget-error` | Widget runtime error logging |
| `/api/webhooks/pubsub` | Pub/Sub webhook handler |
| `/api/inngest` | Inngest background job handler |

---

## 5. Screenshots Index

| File | What it shows |
|---|---|
| `screenshots/02-dashboard.png` | Dashboard (empty state — no bundles) |
| `screenshots/03-analytics.png` | Analytics / Attribution page |
| `screenshots/04-pricing.png` | Pricing page (Free vs Grow) |
| `screenshots/05-events.png` | Updates & FAQs page |
| `screenshots/06-create-bundle-modal.png` | Create Bundle modal |
