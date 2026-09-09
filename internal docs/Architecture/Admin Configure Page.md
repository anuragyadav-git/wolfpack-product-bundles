---
schema_version: 1
id: admin-configure-page
title: Admin Configure Page
type: architecture
status: authoritative
summary: Defines the shared FPB and PPB configure-page boundary and direct create, clone, edit, and save flows.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/shared/AssetUpload.tsx
  - app/components/AdminWarningGroup.tsx
  - app/components/bundle-configure/TemplatePreviewFeedbackModal.tsx
  - app/components/bundle-configure/BundleReadinessOverlay.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/addon-draft.types.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
  - app/routes/app/_shared/bundle-configure/
  - app/constants/help-tooltips.ts
  - public/tooltip-*.png
  - app/lib/bundle-configure-loader.server.ts
  - app/hooks/useBundleConfigurationState.ts
  - app/hooks/configure-route-state.ts
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - architecture
  - configure
keywords:
  - fpb
  - ppb
---

# Admin Configure Page

The FPB configure page is the canonical Admin configure design. FPB and PPB keep separate route URLs, loaders, actions, save handlers, and storefront sync contracts, but shared visual primitives live under `app/routes/app/_shared/bundle-configure/`.

The only bundle configuration routes are the type-specific FPB and PPB configure pages. Bundle creation, cloning, and editing navigate directly to the appropriate configure route. The retired `/app/bundles/create/configure/:bundleId` configuration wizard and its route-specific state, actions, preview helper, and modal controllers are not part of the supported architecture.

Shared configure primitives accept adapter props for route-owned state and
actions. FPB continues to use `useConfigureBundleFlow()`, and PPB continues to
use `usePpbConfigureFlow()` as route-level composition owners, but their
aggregate controller results must stop at the route composition boundary.
Feature and leaf components receive explicit values and callbacks for their own
responsibility; they do not receive the whole configure flow. Shared components
must not read route loaders or submit forms directly.

Configure modules are split by cohesion rather than line count. A module may
remain long when it owns one lifecycle or business transaction. Extraction is
warranted when a responsibility has an independent owner or variation point and
the resulting boundary reduces dependencies. File-length guards, oversized-file
allowlists, pass-through flow bags, and generic save engines are not part of the
architecture. FPB and PPB save handlers remain separate because their
persistence and storefront synchronization semantics differ.

The FPB composition hook calls action and save controllers with explicit,
type-checked dependency objects containing only the fields each controller
reads. Intermediate hook results are not spread into progressively larger flow
bags; all cohesive owner results are merged once, solely for the route render
contract returned by `useConfigureBundleFlow()`.

The PPB composition hook follows the same boundary without combining PPB and
FPB into a generic engine. Save, fetcher-effect, preview, placement, and modal
hooks receive explicit, type-checked projections from their cohesive state
owners. The complete PPB flow is merged only for the route render contract; it
is not placed in React context or forwarded as an internal service locator.
`ConfigureBundleFlow` renders the canvas directly, and `PpbMainSections` is the
single feature-projection owner. The route shell projects
header, contextual-save-form, sidebar, and storefront-placement supplement
contracts explicitly, including nested state objects narrowed to the fields the
shell owner actually reads. Bundle Visibility similarly owns only its link,
App Embed, offer-operation, and country-targeting contract and imports App
Bridge directly for merchant feedback. Bundle Settings leaves receive only
their status, media, countdown, default-product, cart-display, quantity, custom
CSS, category-step, or sticky-cart state and callbacks. PPB Bundle Widget and
Bundle Embed likewise receive explicit copy, targeting, localization,
validation, and placement contracts; neither placement surface reads the
aggregate configure context. PPB Images & GIFs owns only its asset-tab, step
banner, and loading-animation inputs. PPB Free Gifts and Add-ons stays one
cohesive active-step feature but receives only its add-on, localization,
message, picker, and modal inputs. The PPB subscriptions adapter is one such leaf
boundary: route composition passes the shared subscription component only its
bundle compatibility inputs, discovery fetcher, localized configuration,
validation state, and owned callbacks.

PPB Discount and Pricing is split into named rule-editor and display-option
contracts. Quantity, progress, and messaging owners receive only their own
pricing state and callbacks. Step Setup follows the same rule: its composer
receives named Step Flow, details, categories, rules, and Step Config contracts,
then adds only the active step and first-step flag required by each leaf. There
is no PPB configure provider or aggregate configure context.

Deferred PPB overlays are composed from the route flow at one explicit overlay
boundary. Page selection, selected resources, template selection, sync and
variable utilities, discount translations, guided tour,
multi-language text, and preview gating each receive only their owned inputs.
The lightweight readiness trigger and popover render eagerly outside that lazy
boundary so the control cannot disappear while the browser waits for idle time.
No overlay reads the aggregate configure context. Localized pricing values are
normalized to the persisted required-string shape before returning to their
state owners.

Rich visual help is owned by the shared `ConfigureHelpPopover` Polaris surface.
Its non-submitting `s-button` opens an `s-popover`, allowing an optimized image,
localized heading, and localized description while delegating focus, Escape,
outside dismissal, and viewport positioning to Shopify. Text-only `s-tooltip`
is not used for this content because it does not support the visual examples.
The catalog in `help-tooltips.ts` is the single key-to-asset source; canonical
source images are committed as `public/tooltip-*.png`, with AVIF and WebP
derivatives generated by the existing image optimizer. Opening help never
participates in route dirty state or the configure SaveBar.

Discount and Pricing rule cards share `PricingTierBadgeFields`. Each rule owns
an optional `tierBadge` object inside the canonical `BundlePricing.rules` JSON,
so the fields participate in the existing route-owned dirty state, SaveBar,
discard, and save flows without a separate persistence boundary. The Polaris
surface exposes an enable switch, merchant-authored badge text, supported
template variables, shape, visibility, and validated foreground/background hex
colors. Dependent fields remain visible but disabled while the badge is off.
Save validation rejects blank enabled badges, unsupported variables, unsafe
colors, and variables that cannot be truthfully resolved for the selected
pricing method.

Feature switches follow one shared disabled-configuration contract across FPB
and PPB. The master switch remains interactive, while every dependent setting
stays rendered with its saved value, is visually subdued, and sits inside an
`aria-disabled` and native `inert` region. Native controls also receive their
own `disabled` state, including shared `AssetUpload` drop zones. Turning a feature
off must not clear its draft configuration; turning it back on restores the
same values. Mutually exclusive mode branches and prerequisite acquisition
flows may remain conditional because they do not represent disabled saved
configuration.

Bundle Visibility is a shared Polaris web-component surface for FPB and PPB,
covering app-embed status, setup guidance, the canonical bundle link, and
responsive placement choices. PPB Bundle Widget and Bundle Embed are
route-owned Polaris web-component surfaces. Their master switches sit outside
the disabled region, and their preview, localized copy, targeting, selected
resources, browsed-product behavior, and Theme Editor placement actions remain
visible but inert while disabled.

Images & GIFs is an explicit shared configure navigation section because its
route-owned editors persist storefront fields that have no other bundle-level
owner. FPB owns its promo banner, per-step tab/banner images, and floating promo
badge there. PPB owns its per-step banners and per-bundle loading animation.
The FPB promo banner uses the canonical desktop and mobile bundle-banner URLs;
its two native drop zones share one row at every configure width. Bundle
Settings does not duplicate those media controls.
The store-level FPB loading screen and shared slot icon remain owned by Settings
Design; the configure section does not recreate those store-level controls.
Media previews use Polaris `s-image`, and product/list media use `s-thumbnail`;
the app does not maintain a custom responsive-picture wrapper for Admin media.
Empty upload surfaces provide a Shopify upload icon as `s-drop-zone` content;
they do not nest a second Polaris button inside the native drop zone.

Step Setup uses the same section rhythm for both bundle types:

1. Step Flow
2. Step Setup
3. Category
4. Rules Configuration
5. Step Config

Step Flow and the active Step Setup details share one card in FPB and PPB. The
existing horizontal rule beneath the step-chip navigation separates the two
sections; their headings, help actions, step controls, and field content remain
independently owned. Category, Rules Configuration, and Step Config continue as
separate cards below.

Compact configure commands such as Add Step, Add Category, Add Rule, clone,
delete, selected-resource removal, and reset use Polaris `s-button`;
selected-resource counts use `s-clickable-chip`. A row-sized action that must
own the full available width, such as Edit Product or adding an add-on tier or
tier rule, uses `s-clickable` with `inlineSize="100%"`. The clickable owns its
handler directly and must not wrap an `s-button`. Bundle-product Replace and Sync
live in an `s-menu`; Shopify owns its open state, focus, keyboard behavior, and
dismissal, so neither configure route keeps a parallel menu-state flag. Custom
HTML buttons remain limited to
interaction shapes without a Polaris equivalent: step, category, and tab
navigation chips; drag handles and complex accordion headers; the guided-tour
overlay; and controls projected into App Bridge title bars, save bars, or the
maximum-size template modal. Those exceptions keep only their local interaction
role and must not duplicate Shopify-owned dialog, focus, or form behavior.

Step 1 is the required storefront entry step, so its enable switch remains on
and cannot be changed. Later steps may be disabled without deleting their saved
configuration. A disabled step keeps its enable switch interactive while its
Step Name, Category, Rules Configuration, and Step Config content is visually
muted and inert until the merchant enables the step again. The save boundary
also enforces Step 1 as enabled rather than relying only on the Admin control.

PPB-only controls are explicit slots inside the shared rhythm. Category-level
variant controls update `StepCategory.displayVariantsAsIndividualProducts`,
`variantSelectorMode`, and `swatchTooltipEnabled`; they are
not step-wide FPB controls. Grouped variants support Dropdown, Pills, Color
swatches, and Image swatches. Color mode alone exposes the tooltip switch.
Color and image values are managed in Shopify's product option swatches and
consumed through the Storefront API; Configure does not persist or edit a
parallel color map.
Individual-variant mode disables these grouped-variant controls without
clearing their saved values. Bundle Settings follows the same ownership rule:
shared rows cover overlapping settings, while FPB-only Product Slots / Slot
Icon and PPB-only discount display, banner, CSS, Bundle Embed, and Place Widget
controls remain route-owned slots.

PPB Bundle Settings also owns the low-stock and sticky bundle-action controls.
The sticky section uses Polaris web components for its master switch, desktop
and mobile gates, and action selector. Its direct-add choice delegates to the
existing storefront bundle CTA; Configure does not expose a second cart or
checkout integration.

FPB and PPB Bundle Settings share one countdown presentation section built from
Polaris web components. It configures layout, placement, title, and expiry
presentation only. The control reads the existing Bundle Visibility offer end
instant and warns when no end is scheduled; it never exposes or persists a
second countdown deadline.

During SIT development, adding or removing React hooks in a configure-state
hook can leave an already-mounted iframe on an incompatible Vite HMR hook
shape. The resulting React `Should have a queue` error is not by itself API or
database evidence. Check that the route `_data` request returned successfully,
then perform a cache-bypassed reload of the embedded Admin URL to acquire a
fresh session token and remount the hook tree before diagnosing the server.

The former `Pre-order & Subscription Integration` Bundle Settings row is absent
from both FPB and PPB. Its `individualSellingPlanSelection` state and form field
must not be reintroduced. FPB and PPB expose the same separate `Subscriptions`
rail section for discovering, selecting, validating, and persisting one
provider-neutral selling-plan group. It does not restore the removed
per-product integration behavior.

FPB Product Slots is available only when every enabled, non-default step has at
least one step-level rule and every one of those rules uses the exact
`quantity` type. No-rule steps, Amount or Weight rules, and category-rule mode
make Product Slots unavailable because the storefront cannot derive a single
step slot capacity from those configurations. The Product Slots and Slot Icon
controls remain visible but disabled, and the Admin save payload forces
`productSlotsEnabled=false` while the configuration is incompatible.

Step Config uses the shared square step-image control beside the Step Title
fields, with an explicit gap between those columns. Upload and Replace reveal
the shared `AssetUpload` surface, which delegates selection and drag-and-drop to
one named Polaris `s-drop-zone`. The app does not maintain a file-library modal,
search, pagination, faux drop target, or a separate clickable upload action.
The selected file is posted through the App Bridge-authenticated
`/app/upload-store-file` resource route, staged as Shopify image media, created
through the Admin Files API, and polled until Shopify returns its READY CDN URL.
Type and size validation, active-attempt disabling, explicit removal, and the
owning configure draft update remain app responsibilities.

SaveBar semantics remain route-owned. Shared configure UI should mark drafts dirty through the adapter but must not introduce autosave, wrap the canvas in a broad form, or make Enter keypresses submit the configure page.

## Configure Translation Boundary

FPB and PPB translation actions use the shared
`MultiLanguageTextModal` Polaris web-component workflow. The modal renders only
the shop locales returned by Shopify, selects the primary published locale when
available, and treats blank translated values as an instruction to retain the
base configured copy. Inputs are staged locally: Apply normalizes the locale
map and updates the route-owned draft once, while Cancel, Escape, and
backdrop-close discard the staged edits. The modal never submits or persists
independently of the configure SaveBar.

The Configure loaders query Shopify `shopLocales(published: true)` and both app
configurations declare the required `read_locales` scope. Query or access
failures are logged and return no locale options; they must not be hidden behind
a fabricated default locale. A translation action is disabled only when the
loader has no published locales or when its owning storefront feature is not
enabled/configurable (for example, a disabled widget or an incompatible pricing
display mode).

Required shop currency, optional published locales, and optional bundle-product
metadata use isolated Admin GraphQL documents and execute concurrently. A
scope or field error in optional product or locale data must not discard the
required currency response or fail either Configure route. The bundle-product
query stays within the declared `read_products` scope; do not add product media
selections whose broader access requirements can invalidate the whole query.

Each surface keeps one canonical owner. Step and category translations stay on
their `multiLangData`; general storefront labels stay in
`textOverridesByLocale`; pricing messages and display-option labels stay in
their pricing locale maps; bundle widget and embed copy stay with the upsell
configuration; subscription translations stay on the provider-neutral
subscription configuration. Shared modal adapters may flatten nested maps for
editing, but must restore the canonical shape on Apply rather than create a
second persistence path.

## Configure Validation Boundary

FPB and PPB use one feature-aware validation contract at both sides of the
SaveBar request. The client validates the exact `FormData` that would be
submitted; both route handlers run the same pure validator again before any
normalisation, Prisma mutation, or storefront sync. Draft, Unlisted, and Active
records use the same rules.

Validation paths are stable semantic identifiers such as
`steps.<stepId>.name`, `discount.rules.<ruleId>.discountValue`, and
`widget.buttonText`. A failed route response uses HTTP 400 with `success:
false`, a concise summary, and `fieldErrors: [{path, message}]`. Live Shopify
variant validation maps its server-only failures into this shape as well.

Save remains available while the draft is dirty. An invalid attempt keeps the
SaveBar open, changes to the first affected section and step, opens its category
when applicable, and focuses the first invalid control or section message.
Polaris field `error` properties and critical text render feedback next to the
affected control; validation failures never use transient toasts. Errors are
not shown before the first Save attempt and clear as the merchant edits the
affected value. Successful Save and Discard clear all validation state.

Short-lived configure action constraints use concise App Bridge error toasts in
both FPB and PPB. This includes attempting to delete the only step, an
immediate picker, sync-invocation, discard, or preview-launch failure.
Persistent unsaved-preview, save, placement, template, and
preview-configuration failures remain contextual critical banners, while field
validation remains inline as described above.

Only persisted, enabled feature branches are validated. Step 1 is always
enabled. Disabled later steps, disabled pricing/widget/embed/add-on features,
inactive targeting branches, optional media and CSS, and optional localized
translations do not block Save. Enabled FPB and PPB subscriptions require a title, a
common group, at least one selected plan, a valid default option, a display
name for each selected plan, and a one-time label when one-time purchase is
enabled. The same rules apply to enabled FPB subscriptions. Subscription validation failures use the same SaveBar field-error
contract and block persistence and storefront sync atomically.

Successful fetcher saves trigger normal Remix loader revalidation. Rehydrating
loader-backed bundle data must preserve the current configure section and
active step because the merchant is still editing the same bundle. Navigation
reset is a separate route-session operation and runs only when the bundle ID
changes. Do not place active-step or active-section defaults inside general
configure-state hydration.

## Mobile Configure Contract

`CommonConfigureShell` owns the named `bundle-configure` query container. FPB
remains the canonical visual source while PPB supplies route-owned state and
controls through adapters and slots. Narrow containers stack the editor into one
column, keep fields shrinkable with `min-width: 0`, and expose 44px action
targets. On wide containers, the sticky left rail participates in the page's
vertical scroll; it must not cap itself to the viewport or create a nested
scrollbar when a navigation section expands. Shopify owns the contextual save
bar at the top of the Admin surface on both desktop and mobile.

`BundleReadinessOverlay` is secondary, contextual information, so its checklist
uses an anchored Polaris `s-popover` instead of a blocking modal. Wide
viewports expose only the floating 64px score control; mobile viewports hide
that control and expose a native `s-button` beside Preview Bundle. Both use
`commandFor` to open the same eagerly rendered popover, which is never opened
programmatically on page load. Shopify owns placement, Escape and outside
dismissal, keyboard activation, and trigger-focus restoration. The checklist
owns its bounded internal scroll region and does not repeat the score gauge
inside the open surface. Each incomplete checklist `s-clickable` owns its
action through its click handler while `commandFor` only asks Shopify to hide
the popover. Never dispatch checklist actions from the popover's `command`
event: light dismissal can participate in the same command lifecycle and must
not open an unrelated Shopify intent. The app listens to the popover's `show`
and `hide` events once to synchronize route-owned open state; `afterhide` is a
later phase of the same close and must not repeat cleanup. `LocalAppModal` and
configure multi-language workflows remain modal because they are blocking
tasks. Polaris light dismissal does not make the rest of the page modal: an
outside pointer can otherwise dismiss the popover and activate the underlying
Admin control in the same sequence. The readiness popover therefore consumes
only that one resulting outside click. It clears the guard immediately so the
merchant's next deliberate click uses the underlying control normally.

## Admin Warning Presentation Contract

An Admin surface must not stack warning banners when multiple warnings are
simultaneously actionable. `AdminWarningGroup` renders one warning directly,
but two or more warnings collapse into one `Some items need your attention`
warning banner with the copy `Few actions are needed to publish the bundle.`
and a `Manage` action. The action
opens a Polaris modal containing every warning, its explanatory copy, and its
existing remediation action. Selecting a remediation closes the modal before
running the action. FPB and PPB configure headers use this contract for the app
embed and unlisted-product warnings. PPB widget-placement feedback is also a
warning in this group and is never rendered through the standalone critical
operation-alert banner. The shared subscriptions section uses the same contract
when compatibility and validation warnings coexist.

The FPB and PPB Select Template workflows use the App Bridge React `Modal`
with `variant="max"`. The current App Home `s-modal` API stops at
`large-100`; it does not accept `max`. Route-owned state drives the wrapper's
`open` prop, and `onHide` resets the workflow and restores trigger focus. The
React wrapper portals the workflow into the host modal document, preserving
React event handlers for the post-Next Preview bundle action. That projected
action remains a semantic HTML button because nested `s-button` elements do
not hydrate in the host modal document and render as non-interactive text.
The projected workflow fills the host modal viewport, keeps the template grid
as its only vertical scroll region, and pins both the customization header and
action footer so the title, customization action, and `Next` stay available
while merchants review every template.

The PPB Place Widget product-template chooser uses a Polaris `s-modal`. Its
projected Cancel action targets the modal with the native `--hide` command so
it does not depend on a projected React click handler. Template choices must
not use that native command because it suppresses their React selection
callback; they imperatively hide the overlay and clear route state before
opening Theme Editor.

After a successful Select Template preview, the preview handler returns the
exact URL opened in the reserved new tab. Closing the projected customization
modal then opens one shared, small Polaris feedback modal. A merchant can
confirm that the bundle is visible or open Crisp and automatically send
`Having issues seeing the bundle on storefront: <Bundle link>` with that exact
preview URL. Failed preview preparation does not open the feedback modal.

## First-Create Tour and State Boundary

Both type-specific configure routes own their React reducer and local state;
there is no configure Redux provider. Hidden save inputs and route-owned configure controllers
remain mounted for the full route lifetime, so section changes and deferred
overlays must not discard unsaved values.

The create route signals the guided edit experience only with
`mode=create&first_load=true`. The tour changes the active configure section
before looking up its target, retries while a lazy target arrives, and falls
back to a centered dialog when the target is unavailable. Completion,
dismissal, and Escape persist the existing shop-keyed local-storage value,
restore the previously focused control, and release the body scroll lock.
The custom spotlight and positioned dialog remain the deliberate overlay
exception, while their ordinary Dismiss, Next, and Got it actions use Polaris
`s-button` controls. A step transition is notified once per actual step even
when a parent callback receives a new identity during rerender. Step 2 targets
the box-owning desktop readiness container, not either mobile header action.
Step 4 navigates to Bundle Settings and targets only the bundle-status card in
both FPB and PPB, never the broader settings panel.
The dialog measures its rendered height before choosing an above-target,
below-target, or viewport-contained position. It recomputes that position after
viewport changes and uses a bounded internal scroll region for long copy on
short desktop viewports. The guided tour does not start or remain visible below
768px, where its spotlight and dialog would compete with the mobile configure
surface. Guided transitions keep the readiness popover closed so it cannot
cover the tour while the readiness trigger is highlighted.
