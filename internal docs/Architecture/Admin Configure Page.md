---
schema_version: 1
id: admin-configure-page
title: Admin Configure Page
type: architecture
status: authoritative
summary: Defines the shared FPB and PPB configure-page boundary and direct create, clone, edit, and save flows.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/AdminWarningGroup.tsx
  - app/components/bundle-configure/TemplatePreviewFeedbackModal.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
  - app/routes/app/_shared/bundle-configure/
  - app/lib/bundle-configure-loader.server.ts
  - app/hooks/useBundleConfigurationState.ts
  - app/store/slices/configureRouteStateSlice.ts
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

Shared configure primitives should accept adapter props for route-owned state and actions. FPB continues to use `useConfigureBundleFlow()`, and PPB continues to use `usePpbConfigureFlow()`. Shared components must not read route loaders or submit forms directly.

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
own `disabled` state, including shared `FilePicker` triggers. Turning a feature
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
fields, with an explicit gap between those columns. Its Upload file and Replace
actions mount `FilePicker` in auto-open mode. Auto-open pickers begin in the open
state and use the shared Polaris modal utilities (`showOverlay()` plus native
hide listeners); React custom-element `onHide` props and `show()` alone are not
the supported lifecycle contract inside the embedded Admin iframe.

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
column, keep fields shrinkable with `min-width: 0`, expose 44px action targets,
and reserve bottom space for Shopify's contextual save bar.

The existing compact `BundleReadinessOverlay` trigger and external props remain
unchanged. Its checklist is a native modal dialog: desktop uses a bounded
floating panel and phone containers use a full-width bottom sheet above the safe
area. Escape, safe backdrop dismissal, focus trapping, internal scrolling, and
focus restoration are shared behavior. `LocalAppModal` applies the same native
dialog contract to app-owned discard workflows. Configure multi-language
workflows use the shared Polaris `s-modal` lifecycle and route-owned open state.

## Admin Warning Presentation Contract

An Admin surface must not stack warning banners when multiple warnings are
simultaneously actionable. `AdminWarningGroup` renders one warning directly,
but two or more warnings collapse into one warning banner with the copy
`Few actions are needed to publish the bundle.` and a `View` action. The action
opens a Polaris modal containing every warning, its explanatory copy, and its
existing remediation action. Selecting a remediation closes the modal before
running the action. FPB and PPB configure headers use this contract for the app
embed and unlisted-product warnings; the shared subscriptions section uses the
same contract when compatibility and validation warnings coexist.

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

Both type-specific configure routes mount `ReduxProvider` locally; the shared
`/app` layout does not. Hidden save inputs and route-owned configure controllers
remain mounted for the full route lifetime, so section changes and deferred
overlays must not discard unsaved values.

The create route signals the guided edit experience only with
`mode=create&first_load=true`. The tour changes the active configure section
before looking up its target, retries while a lazy target arrives, and falls
back to a centered dialog when the target is unavailable. Completion,
dismissal, and Escape persist the existing shop-keyed local-storage value,
restore the previously focused control, and release the body scroll lock.
The dialog measures its rendered height before choosing an above-target,
below-target, or viewport-contained position. It recomputes that position after
viewport changes and uses a bounded internal scroll region for long copy on
short desktop and mobile viewports. Guided transitions keep the readiness modal
closed so it cannot cover the tour while the readiness trigger is highlighted.
