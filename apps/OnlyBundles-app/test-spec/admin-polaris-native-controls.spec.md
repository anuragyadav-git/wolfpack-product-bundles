---
schema_version: 1
id: admin-polaris-native-controls
title: Admin Polaris Native Controls Test Spec
type: test-spec
status: active
summary: Defines native Polaris ownership for reusable Admin controls, ordinary actions, file selection, and modal behavior.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin-ui
systems:
  - polaris-app-home
source_paths:
  - app/components/shared/AssetUpload.tsx
  - app/components/bundle-configure/LocalAppModal.tsx
  - app/components/EnablePreviewModal.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRuleModeContent.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepFlowCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepCategoriesCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepRulesList.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryRulesList.tsx
  - app/routes/app/app.settings/SettingsFeedback.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
  - app/routes/app/app.attribution/AttributionDateRangeControls.tsx
  - app/routes/app/app.dashboard/DashboardResourcesCard.tsx
  - app/routes/app/app._index.tsx
  - app/components/bundle-configure/TemplateReadyScreen.tsx
  - app/components/bundle-configure/BundleGuidedTour.tsx
  - app/components/bundle-configure/BundleReadinessOverlay.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsCss.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.bundleCss.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRulesCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbRulesConfigurationCard.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureCanvasHeader.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsQuantity.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader.tsx
  - app/routes/app/app.settings/SettingsControlsWorkspace.tsx
  - app/routes/app/app.integrations/IntegrationsRouteShell.tsx
  - app/routes/app/app.dashboard/DashboardBundlesPanel.tsx
  - app/routes/app/app.dashboard/DashboardTopCards.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.ui.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbImagesGifsSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectTemplateDialog.tsx
  - app/routes/app/_shared/bundle-configure/CommonConfigureSidebar.tsx
  - app/routes/app/_shared/bundle-configure/CommonStepCategoryAccordion.tsx
  - app/routes/app/_shared/bundle-configure/CommonStepCategorySelectedItems.tsx
  - app/lib/bundle-config/common-configure-page-model.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - polaris
keywords:
  - s-modal
  - s-drop-zone
  - s-clickable
---

# Test Spec: Admin Polaris Native Controls

**Spec ID:** admin-polaris-native-controls  **Created:** 2026-09-06

## Purpose

Delegate ordinary Admin interaction, keyboard, focus, and modal behavior to Polaris web components.

## Test Cases

### Reusable Admin Controls

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Choose or drop an asset | Empty asset field | Polaris drop zone receives accepted files | Native selection and drag-and-drop semantics |
| 2 | Upload an accepted file | Valid image within the field limit | Files API upload and status polling produce the READY CDN URL | No custom file-library modal |
| 3 | Remove a saved asset | Existing CDN URL | Polaris Remove button clears the field exactly once | No nested interactive wrapper |
| 4 | Confirm discard | Ordinary app modal | Polaris modal owns focus, Escape, and scrolling | No manual dialog trap |
| 5 | Open settings help | Inventory help content | Polaris modal renders and closes | No custom backdrop dialog |
| 6 | Explain disabled preview | Preview visibility is not configured | Polaris modal renders existing guidance and actions | No custom backdrop dialog |
| 7 | Edit step or category rule | Type, operator, and numeric value change | Polaris fields invoke the existing rule update callbacks | Step-condition vocabulary is unchanged |
| 8 | Edit bundle CSS | Merchant enters custom CSS | Polaris text area updates the existing CSS draft | Runtime CSS validation remains unchanged |
| 9 | Select an attribution range | Merchant chooses From and To dates | Polaris date fields update the existing range state and constraints | Navigation query behavior remains unchanged |
| 10 | Choose a Dashboard resource | Merchant selects inspiration or support | Existing selection and support callbacks run exactly once | Ordinary resource actions use Polaris interaction ownership |
| 11 | Use an app-home CTA | Merchant chooses create, dashboard, or support | Existing navigation or support action runs exactly once | Title-bar and save-bar slot buttons remain their platform-specific exception |
| 12 | Preview a ready bundle in the App Bridge max modal | Merchant activates the projected preview action | A semantic native button invokes the existing preview callback once and blocks repeat activation while loading | Nested Polaris buttons do not hydrate in the host modal document; this is the documented platform-boundary exception |
| 13 | Dismiss bundle readiness | Merchant dismisses the open checklist through the modal | Existing open-state callback receives `false` exactly once | Polaris modal owns focus, Escape, backdrop, and scroll behavior |
| 14 | Open an incomplete readiness item | Merchant selects an actionable checklist item | Existing item callback receives the item key and the checklist closes exactly once | Polaris clickable owns keyboard activation |
| 15 | Expand bundle-level CSS | Merchant activates the FPB or PPB CSS disclosure | Existing bundle-type state owner receives the same toggle update | Polaris clickable owns disclosure activation |
| 16 | Open rule configuration help | Merchant selects Learn more from FPB or PPB rules | Canonical tutorial opens in a new tab without an app-owned window handler | Polaris link owns external navigation |
| 17 | Navigate back from an Admin workspace | Merchant activates the FPB, PPB, or Settings back action | Existing route-owned back callback runs exactly once | Icon-only Polaris button exposes an accessibility label |
| 18 | Remove a saved custom UTM attribute | Merchant removes a tracked parameter chip | Existing saved-parameter state excludes that value and the chip exposes its removal label | Polaris removable chip owns the remove affordance |
| 19 | Reset the FPB product-slot icon | Merchant activates Reset while slots are available | Existing icon URL is cleared and the route draft is marked dirty | Ordinary text action uses a tertiary Polaris button |
| 20 | Render Admin product and integration media | A card, selected product, or bundle product has an image | The same source and accessible description are presented through Shopify-owned media components | Decorative media remains hidden from assistive technology |
| 21 | Render a template or loading-animation preview | A template image or loading GIF is available | The same preview is shown without changing its selection or loading behavior | Responsive layout remains owned by the existing container |
| 22 | Open per-bundle media controls | Merchant selects Images & GIFs in FPB or PPB Configure | The route changes to the existing media editor so promo, step, and loading assets remain editable | The navigation model must not strand persisted storefront fields behind an unreachable section |
| 23 | Add configure entities | Merchant adds a step, category, or rule | The existing route-owned callback runs exactly once through a Polaris button | Step/category navigation chips and complex drag handles remain custom exceptions |
| 24 | Remove a PPB step image | Merchant activates the step-image remove action | The image is cleared, the picker closes, and the route draft becomes dirty exactly once | Icon action uses Shopify-owned button semantics |
| 25 | Use bundle-product actions | Merchant replaces, syncs, or opens the bundle product | The existing route-owned callback runs exactly once from the Shopify menu or button | Polaris owns menu open, dismissal, focus, and keyboard behavior |
| 26 | Clone or delete a category | Merchant activates a category-row action | The existing route-owned category update and dirty callbacks run exactly once | Ordinary icon actions use Shopify-owned button semantics inside the retained accordion grid |
| 27 | Remove a selected category resource | Merchant removes a product or collection from the selection modal | The matching route-owned removal callback receives the resource ID exactly once | Drag handles remain custom because they own native drag events; removal is an ordinary Polaris action |
| 28 | Open selected category resources | Merchant activates the selected-count chip | The matching products or collections modal opens exactly once | Polaris clickable chip owns the interactive count affordance |
| 29 | Open and choose an Analytics date range | Merchant opens the range trigger, chooses a preset, or applies a valid custom range | Polaris popover owns dismissal/focus, Polaris clickable chips select presets, and the existing URL query transition is preserved | No document-level outside-click listener |
| 30 | Filter the Dashboard bundle list | Merchant chooses a status or bundle type | Native Polaris selects expose every supported option and preserve the route-local filter state | Avoid transient empty choice-list hydration warnings |
| 31 | Open Dashboard support chat | Merchant activates the support CTA | Existing chat callback runs once and the icon action exposes its localized accessible name | Satisfies the Polaris icon-button contract |
| 32 | Advance or dismiss the guided tour | Merchant activates Next, Got it, or Dismiss guided tour | Existing step, completion, dismissal, persistence, and focus-restoration behavior runs exactly once | The retained spotlight overlay uses native Polaris buttons for ordinary actions |

## Acceptance Criteria

- [x] Ordinary modals use `s-modal` and its action slots.
- [x] Asset upload uses `s-drop-zone`; saved previews use `s-image`, and no custom file-library selection surface remains.
- [x] Manual focus traps, Escape handlers, and body-scroll handling are absent from ordinary modal components.
- [x] Existing file upload validation, polling, selection, and removal behavior remains covered.
- [x] Visible Admin date inputs use `s-date-field`; hidden transport inputs remain native.
- [x] Focused tests, typecheck, Polaris validation, ESLint, and diff checks pass.
- [x] Embedded Admin media uses `s-image` or `s-thumbnail`; the retired custom picture wrapper and ordinary `<img>` elements are absent from app-home routes.
- [x] Existing selection, preview, loading, and navigation behavior remains covered after the media migration.
- [x] FPB and PPB expose the existing per-bundle media editor through the shared configure navigation.
- [x] Ordinary Add Step, Add Category, and Add Rule actions use Polaris buttons while preserving route-owned callbacks.
- [x] Bundle-product actions use the native Polaris menu/button lifecycle without route-owned menu state.
- [x] Category clone, delete, selected-count, and selected-resource removal use native Polaris controls while retaining route-owned data updates.
- [x] Analytics date selection delegates overlay and preset interaction to native Polaris components.
- [x] Dashboard filters use native Polaris selects without empty choice-list warnings.
- [x] Dashboard support chat exposes its localized accessibility label.
- [x] Guided-tour actions use native Polaris buttons without changing the retained spotlight workflow.
