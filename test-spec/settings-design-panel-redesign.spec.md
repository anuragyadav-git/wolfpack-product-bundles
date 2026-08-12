---
schema_version: 1
id: settings-design-panel-redesign-spec
title: Settings Design Panel Redesign Test Spec
type: test-spec
status: active
summary: Behavior coverage for the responsive Settings Design workspace, storefront-matched key preview surfaces, and local colour guides.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - settings-design
source_paths:
  - app/routes/app/app.settings/DesignSettingsView.tsx
  - app/routes/app/app.settings/DesignLivePreview.tsx
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - design-preview
keywords:
  - viewport
  - templates
---

# Test Spec: Settings Design Panel Redesign

**Spec ID:** settings-design-panel-redesign  **Created:** 2026-07-22

## Purpose

Verify that the Design subpage keeps its existing settings behavior while the
local preview matches the Builder and Cart / Summary structure of every
landing-page and product-page template, preserves representative secondary
states, responds to every previewable setting, and remains usable across Admin
container sizes.

## Test Cases

### DesignPreviewState

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Default preview state | No prior preview state | Landing Page, Standard, desktop | Preview-only state |
| 2 | Change bundle type | Product Page | Product List becomes the template | Invalid cross-type template is not retained |
| 3 | Change template | Every registered key | The matching type/template pair is accepted | Covers all eight templates |
| 4 | Reject invalid combination | Landing Page with Product Grid | Combination is rejected | Uses existing template identifiers |
| 5 | Change viewport | Mobile, then desktop | Only viewport changes | Type, template, and unsaved settings remain intact |
| 6 | Change preview surface | Any surface supported by the selected template | Only preview surface changes | Template and viewport remain intact |
| 7 | Reject unsupported surface | Product Picker on Product List | State remains on Builder | Template-aware surface contract |
| 8 | Change template with incompatible surface | Product Picker, then Product List | Surface falls back to Builder | Valid state is always preserved |
| 9 | Resolve logical viewport | Desktop or mobile selector | Desktop uses 1280×960 and mobile uses 390×844 | The taller desktop canvas consumes the available preview workspace |
| 10 | Fit logical viewport | Host width and selected logical viewport | Scale is capped at 1 and never drops below the minimum usable scale | Preview retains storefront breakpoints while fitting the Admin surface |

### DesignPreviewModel

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Resolve canonical template structures | Eight registered template keys | Each key resolves from the canonical selection and widget config to its real product, navigation, category, summary, and responsive structure | Pure descriptor behavior |
| 2 | Resolve preview targets | Every editable Design field and template | Every previewable field resolves to a semantic target and visible surface | Slot product-card controls resolve to Product Picker |
| 3 | Build preview themes | Valid FPB and PPB Design state | Semantic tokens come from the correct normalized runtime family | Includes weights, radii, image fit, quantity, toast, footer, empty slot, and upsell tokens |
| 4 | Resolve applicability | Field and selected template | Unsupported template-specific controls return a clear inapplicable result | No fabricated visual effect |
| 5 | Build deterministic fixture | Local fixture registry | Multiple products, selections, slots, steps, categories, tiers, validation, and upsell data are present | Local media only |
| 6 | Resolve scene regions | Template, surface, and viewport | Required storefront-owned regions are returned for all valid combinations | No merchant-theme chrome |
| 7 | Resolve fidelity boundary | Every template and surface | Builder and Cart / Summary are storefront-matched; secondary states remain representative | Prevents false parity claims |

### DesignLivePreview

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Render selectors | Default state | Both bundle types and all valid templates are selectable | Preview-only controls |
| 2 | Render viewport controls | Desktop state | Desktop and mobile buttons have labels and tooltips; desktop is active | One-click buttons |
| 3 | Render each template | Eight valid initial states | The matching storefront-faithful fixture structure renders | No iframe or remote media |
| 4 | Render template-aware surfaces | Product Picker, Cart / Summary, Loading, Validation, and Upsell | Only surfaces supported by the selected template are selectable and rendered | Deterministic local fixtures |
| 5 | Images and GIFs preview | Images & GIFs active | Image Fit updates fixture media; FPB GIF and background controls update a pure local loading-screen preview | No asynchronous preview work exists |
| 6 | Missing real bundle | Empty preview-bundle list | Design controls and local fixture preview remain available | Only Preview Bundle needs a real URL |
| 7 | Local preview media | Any Builder or Product Picker surface | Images use `OptimisedImage` with local PNG sources and generated-format siblings | CI owns AVIF/WebP generation |
| 8 | Responsive workspace controls | Narrow Admin container | Preview and Customize actions are exposed as one accessible segmented control | Preview is selected by default |
| 9 | Phone workspace state | Switch between Preview and Customize | Active template, surface, viewport, active field, and unsaved values remain unchanged | Pane selection is preview-only UI state |
| 10 | Logical preview canvas | Desktop or mobile preview | Scene renders at the selected storefront viewport and scales only to fit its host | Storefront breakpoints do not depend on the center-column width |
| 11 | Loading surface field relevance | Loading surface with Images & GIFs active | Image Fit is disabled while GIF and background controls remain interactive | Image Fit does not affect a loading screen |
| 12 | Empty loading GIF picker | No saved GIF | The whole drop zone is clickable, says `Click to upload a loading GIF`, and has no nested upload button | One clear upload action |

### ColourGuideLinks

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Render relevant Expert groups | General, Categories, Product Card, Bundle Cart, Upsell | Each group shows a `Show Colour Guide` link | Exact link copy |
| 2 | Open guide | Activate a guide link | The matching local `.avif` URL opens in a new tab | AVIF generation remains CI-owned |

## Acceptance Criteria

- [x] All listed local test cases pass.
- [x] All eight template identifiers resolve from canonical storefront contracts and render dedicated desktop/mobile structures.
- [x] Viewport and preview-surface switching preserve bundle type, template, and unsaved field values.
- [x] Slot product-card controls reveal Product Picker and Product List cart controls reveal Cart / Summary.
- [x] Every editable preview-relevant field is mapped through the correct FPB or PPB storefront runtime family.
- [x] Deterministic fixture media is local and uses the optimized image pipeline without committed AVIF/WebP output.
- [x] Design controls and local previews work without a storefront-ready bundle.
- [x] All five relevant Expert groups expose local AVIF colour-guide links.
- [ ] Entering Design crosses one lazy workspace boundary and reaches a usable preview within 750ms p75 in SIT.
- [x] Existing save, discard, and reset behavior remains unchanged; Preview Bundle remains separate and requires a real storefront URL.
- [ ] Builder and Cart / Summary match the current storefront structure for all eight templates at 1280×960 and 390×844.
- [x] Phone-sized Admin containers expose Preview and Customize panes without losing local preview or unsaved Design state.
- [x] Loading disables Image Fit, keeps loading controls active, and presents one clickable GIF drop zone without a nested button.
- [x] Unit tests verify behavior and model outputs only; visual placement and styling are verified with Chrome, not source or CSS assertions.
