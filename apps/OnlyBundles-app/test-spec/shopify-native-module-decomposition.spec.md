---
schema_version: 1
id: shopify-native-module-decomposition
title: Shopify Native Module Decomposition Test Spec
type: test-spec
status: active
summary: Defines behavior-preserving responsibility splits for cohesive Admin and bundle save modules.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin-ui
  - bundle-persistence
systems:
  - remix
  - polaris-app-home
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureCanvasHeader.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureHiddenInputs.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureSidebar.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsCss.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsBundleCart.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsDefaultProducts.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsQuantity.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsSummaryText.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsTemplate.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleVisibilityPanel.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesGifsPanel.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ImagesVisibilitySection.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleWidgetSection.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureGlobalOverlays.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureSyncAndLanguageModals.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureTemplateDialog.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/ConfigureSelectedItemsModals.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupCategoryAccordion.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupConfigCard.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRulesCard.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingSection.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountPricingRules.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountDisplayOptions.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountBundleQuantityOptions.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountProgressBarOptions.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountMessagingOptions.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonsSection.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonReferenceStepCard.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonProductsCard.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonTierEditor.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FpbAddonTierRules.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureAddonActionHandlers.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureVisibilityActionHandlers.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureBundleFlow.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureAddonState.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/addon-draft.types.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureContentState.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/useConfigureSubscriptionState.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/FreeGiftAddonFooterMessaging.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - app/routes/app/app.attribution/AttributionDashboard.tsx
  - app/routes/app/_shared/bundle-configure/BundleSubscriptionsSection.tsx
  - app/routes/app/app.settings/DesignLivePreview.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCanvasHeader.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureSidebar.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleVisibilitySection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleWidgetSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleEmbedSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbImagesGifsSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbFreeGiftAddonsSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbConfigureOverlays.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbUtilityModals.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbOverlayModals.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbPageSelectionModal.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectTemplateDialog.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountLanguageModals.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSelectedItemsModals.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbMainSections.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountRulesPanel.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountMessageRuleFields.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountMessagingOptions.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountDisplayOptions.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbDiscountPricingSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepFlowCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupDetailsCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepConfigCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepCategoriesCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryAccordion.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbRulesConfigurationCard.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepRulesList.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbCategoryRulesList.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbStepSetupSection.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbBundleSettingsControls.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSaveForm.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbSubscriptionsSection.tsx
  - app/lib/bundle-config/step-product-variant-validation.server.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - refactor
keywords:
  - module-boundaries
  - direct-imports
---

# Test Spec: Shopify-Native Module Decomposition

**Spec ID:** shopify-native-module-decomposition  **Created:** 2026-09-06

## Purpose

Split modules only at existing responsibility and variation boundaries without changing merchant flows, payloads, or public exports.

## Test Cases

### Existing Behavior Preservation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Change Design preview context | Existing preview state transitions | Existing exported transitions return identical states | State helpers move to a direct owner module |
| 2 | Use attribution controls | Presets, custom range, UTM tracking, and backfill | Existing callbacks and submissions remain unchanged | View controls move out of the route dashboard |
| 3 | Configure subscriptions | Existing provider, plan, discount, and validation state | Existing callbacks and visible branches remain unchanged | Extract coherent form sections only |
| 4 | Use dashboard actions | Existing preview, edit, clone, rename, delete, filters, and embed actions | Existing fetcher and modal behavior remains unchanged | Extract presentation and action ownership |
| 5 | Save FPB or PPB | Existing valid and invalid form payloads | Validation, Prisma mutation, storefront sync, and response remain unchanged | Keep bundle-type save contracts separate |
| 6 | Validate persisted step-product variants | Valid, malformed, missing, duplicate, or unavailable Shopify variant references from FPB or PPB | Batch-check unique normalized IDs and return the existing route-specific field error or success result | Shared Shopify validation boundary only; persistence stays separate |
| 7 | Render FPB header actions | Header-owned values and callbacks | Back and preview actions delegate to their route owners without receiving the entire configure controller | Narrow open boundary |
| 8 | Serialize FPB hidden save fields | Form, step, pricing, locale, collection, and product values | Existing hidden field names and serialized values remain unchanged | Narrow serialization boundary |
| 9 | Edit FPB bundle CSS | CSS value, expansion state, status, and callbacks | Disclosure, CSS input, dirty marking, and status delegation remain unchanged without receiving the entire configure controller | Narrow feature boundary |
| 10 | Open FPB bundle-cart translations | Cart copy and published locales | Multi-language editing receives the current title and subtitle fallbacks without receiving the entire configure controller | Narrow feature boundary |
| 11 | Navigate from FPB cart discount display | Edit defaults action | Existing action selects the Discount and Pricing section without receiving the entire configure controller | Narrow feature boundary |
| 12 | Update FPB banner media | Desktop or mobile picker result | The owned URL setter receives the selected URL and the route draft is marked dirty without receiving the entire configure controller | Narrow feature boundary |
| 13 | Select FPB default products | Existing selections and Shopify Resource Picker result | The feature invokes Shopify's native picker directly, normalizes the result, updates its draft, and clears its validation error | Direct platform owner import |
| 14 | Update FPB quantity and slot settings | Quantity state, step conditions, and owned callbacks | Existing availability, reset, picker, dirty-state, and validation behavior remains unchanged without receiving the entire configure controller | Narrow feature boundary |
| 15 | Update FPB product-card copy and countdown | Product-card state, countdown state, offer end instant, and owned callbacks | Existing switches, localized text, validation, and countdown behavior remains unchanged without receiving the entire configure controller | Narrow feature boundary |
| 16 | Compose FPB Bundle Settings | Active or inactive section plus named feature props | The inactive section renders nothing; the active section renders every owned feature without receiving the entire configure controller | Route composition boundary |
| 17 | Render FPB visibility overview | Bundle link, app-embed state, Theme Editor action, and section navigation | Shared visibility actions receive only their owned values; copy feedback uses App Bridge directly | Direct platform owner import |
| 18 | Update FPB media assets | Active media section, promo image, step assets, and floating badge | Existing picker and dirty-state callbacks run without receiving the entire configure controller | Narrow feature boundary |
| 19 | Compose FPB media and visibility | Active section plus named visibility, offer, targeting, and media feature props | Unsupported sections render nothing; supported sections compose only the owned features without receiving the entire configure controller | Route composition boundary |
| 20 | Compose FPB configure sidebar | FPB navigation constants plus sidebar-owned route values and callbacks | Shared sidebar behavior remains unchanged without receiving the entire configure controller | Bundle-type adapter boundary |
| 21 | Compose FPB Bundle Widget | Active section plus the shared widget feature adapter | Inactive sections render nothing; the active section receives its fixed FPB picker helpers and route-owned callbacks without the entire configure controller | Feature adapter boundary |
| 22 | Compose FPB global overlays | Readiness, guided-tour, translation, and discard feature props | Each overlay receives only its owned values and callbacks without the entire configure controller | Overlay composition boundary |
| 23 | Compose FPB sync and language modals | Sync action state, pricing translation props, and preview gate props | The native sync modal and delegated translation/preview overlays receive only their owned contracts | Overlay composition boundary |
| 24 | Use the FPB template dialog | Template selection state, save/preview actions, and Theme Editor URL | The justified max-size App Bridge modal preserves its flow without receiving the entire configure controller | Overlay feature boundary |
| 25 | Use FPB selected-item modals | Current step products/collections, add-on tier products, variable references, and owned callbacks | Product navigation and add-on add/remove/close behavior remains intact through narrow modal props and native controls | Modal feature boundary |
| 26 | Compose FPB step category, config, and rules leaves | Step-owned adapters, media callbacks, and rule-mode props | Existing category/resource, icon/title, and tutorial behavior remains intact without the route controller | Step Setup leaf boundaries |
| 27 | Compose FPB Discount and Pricing | Active section plus rule and display-option feature props | Inactive sections render nothing; active rules, quantity options, progress options, and messaging preserve their behavior without the route controller | Pricing feature boundary |
| 28 | Compose FPB Free Gift and Add-ons | Active section plus reference-step, add-on products, tiers, and footer-message feature props | Inactive sections render nothing; active add-on features receive only their owned state and callbacks without the route controller | Add-on feature boundary |
| 29 | Pick FPB add-on and visibility resources | Narrow route-owned drafts plus Shopify Resource Picker results | Each handler imports App Bridge directly, normalizes the native selection, and updates only its owned draft | Direct platform owner boundary |
| 30 | Compose FPB route-owned controllers | Base controller state plus cohesive add-on, content, subscription, localization, visibility, pricing, modal, action, and save results | Each hook receives only its declared dependencies; the route composition owner merges outputs once | Route-local composition boundary |
| 31 | Compose PPB route-owned controllers | Base, visibility, display, settings, template, category, save, placement, preview, and modal owners | Each downstream hook receives an explicit dependency projection instead of an entire feature result; the route owner merges outputs once | Route-local composition boundary |
| 32 | Update FPB add-on drafts or PPB localized pricing messages | A partial add-on draft update or locale-specific rule-message updater | Only fields from the owned draft/message contracts are accepted while the existing state transition and persisted payload remain unchanged | No `Record<string, any>` update bags |
| 33 | Compose PPB subscriptions | Subscription state, fetcher, bundle compatibility inputs, locales, and callbacks | The PPB adapter forwards the explicit subscription feature contract without reading the aggregate configure context | Narrow feature boundary |
| 34 | Compose the PPB shell | Header, save, sidebar, supplemental-card, save-lock, and deferred-overlay inputs | Each shell owner receives only its explicit typed values and callbacks while existing actions and save serialization remain unchanged | Route shell boundary |
| 35 | Compose PPB Bundle Visibility | Shopify product handle, App Embed status, link action, offer delivery state, and targeting callbacks | Visibility actions receive only their feature inputs, use App Bridge directly for feedback, and do not read the aggregate configure context | Visibility feature boundary |
| 36 | Update PPB bundle-setting leaves | Bundle status, bundle CSS, category-step mode, and sticky add-to-cart values plus owned callbacks | Each control preserves its saved value and callback behavior without reading the aggregate configure context | Bundle Settings leaf boundaries |
| 37 | Compose PPB Bundle Settings | Active section plus explicit media, countdown, default-product, cart-display, quantity, status, CSS, category-step, and sticky-cart contracts | The complete Bundle Settings feature renders from named feature props without reading the aggregate configure context | Bundle Settings composition boundary |
| 38 | Compose PPB Bundle Widget and Bundle Embed | Widget copy, media, targeting, placement, localization, validation, and embed inputs plus owned callbacks | Both storefront-placement features preserve their disabled-state and targeting behavior from explicit contracts without reading the aggregate configure context | Placement feature boundaries |
| 39 | Edit PPB Images and GIFs | Active asset tab, step banner values, loading animation, and owned setters | Media pickers update only their owned draft and mark the route dirty without reading the aggregate configure context | Media feature boundary |
| 40 | Configure PPB Free Gifts and Add-ons | Active step, add-on copy, products, tiers, localization, validation messages, picker state, and owned callbacks | The cohesive add-on feature preserves its enabled and disabled behavior from an explicit contract without reading the aggregate configure context | Add-on feature boundary |
| 41 | Use PPB utility modals | Sync fetcher state, native modal refs, confirm/cancel actions, and template-variable catalogs | Native utility modals preserve sync and close behavior from explicit props without reading the aggregate configure context | Overlay feature boundary |
| 42 | Compose PPB global overlays | Readiness, guided tour, localized text, and preview-gate inputs plus owned callbacks | Each overlay receives only its explicit feature contract and the composition does not read the aggregate configure context | Overlay composition boundary |
| 43 | Select a PPB product-page template | Available Shopify page templates, open state, close action, and selection callback | The native modal retains show, hide, cancel, and selection behavior from explicit props without reading the aggregate configure context | Page-selection overlay boundary |
| 44 | Use the PPB template dialog | Template selection state, save and preview actions, Theme Editor URL, and modal state | The justified max-size App Bridge modal preserves its workflow from explicit props without reading the aggregate configure context | Template overlay boundary |
| 45 | Edit PPB discount translations | Rule fallbacks, locales, modal state, localized quantity and progress values, and owned setters | Translation modals apply localized values, mark dirty, and close through explicit props without reading the aggregate configure context | Pricing overlay boundary |
| 46 | Inspect PPB selected resources | Current step products, selected collections, native modal refs, discard state, and owned callbacks | Product navigation and modal close/discard behavior remain intact from explicit props without reading the aggregate configure context | Selected-resource overlay boundary |
| 47 | Compose PPB main sections | Route flow at the single composition boundary | Alerts, validation, and active feature sections receive explicit projections while the main-section owner does not read the aggregate configure context | Route composition boundary |
| 48 | Edit PPB discount rules | Pricing owner, validation errors, and message-reset callbacks | Discount type, rules, tier badges, and add-rule behavior remain intact without any rule component reading the aggregate configure context | Pricing rule feature boundary |
| 49 | Edit PPB discount rule messages | Active locale, pricing rules, localized and default message state, and owned setters | Rule and success copy update the correct state owner without reading the aggregate configure context | Pricing message leaf boundary |
| 50 | Configure PPB discount messaging | Messaging enablement, locale selection, variables action, rule-message values, and owned callbacks | The messaging feature preserves enable, localization, and rule-copy behavior without reading the aggregate configure context | Pricing messaging feature boundary |
| 51 | Configure PPB discount display options | Inactive state plus named quantity, progress, and messaging contracts | Each display option preserves its enablement, localization, and text behavior without any nested component reading the aggregate configure context | Pricing display composition boundary |
| 52 | Compose PPB Discount and Pricing | Active section plus named rule-editor and display-option contracts | The pricing section delegates to its two cohesive owners without reading the aggregate configure context | Pricing route feature boundary |
| 53 | Compose PPB Step Flow, details, and Step Config leaves | Active step navigation, step lifecycle actions, localized details, media picker state, and owned callbacks | Navigation, enablement, naming, cloning, deletion, and media edits remain intact without any leaf reading the aggregate configure context | Step Setup leaf boundaries |
| 54 | Compose PPB categories | Active step categories, shared accordion adapter, PPB variant controls, and add-category callbacks | Category creation and variant updates use their explicit owners without the category card or accordion reading the aggregate configure context | Category feature boundary |
| 55 | Compose PPB rules configuration | Step conditions, category conditions, accordion state, rule-mode transitions, and owned callbacks | Step and category rules preserve add, edit, remove, auto-next, and mode-switch behavior without reading the aggregate configure context | Rules feature boundary |
| 56 | Compose PPB Step Setup | Active section, animation state, and named flow, details, categories, rules, and config contracts | The active step delegates each feature contract to its owner without reading an aggregate configure context; inactive sections render nothing | Step Setup composition boundary |

## Acceptance Criteria

- [x] Public exports used by existing tests and routes remain stable.
- [x] Extracted modules use direct owner imports rather than compatibility service locators.
- [x] Leaf components receive only the values and callbacks owned by their responsibility.
- [x] FPB and PPB save paths remain separate and behaviorally covered.
- [x] Focused route, save, behavioral integration, typecheck, and lint checks pass.
- [x] Add-on and localized pricing state boundaries use narrow typed updates without changing payload behavior.
