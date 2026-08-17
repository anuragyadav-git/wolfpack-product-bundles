---
schema_version: 1
id: ppb-template-design-implementation-goal
title: PPB Template Design and Product Card Implementation Plan
type: design-plan
status: in-progress
summary: Keep PPB template architecture aligned to FPB structure while implementing EB-inspired layout and product-card parity for all PPB templates.
last_audited: 2026-08-15
owners:
  - engineering
domains:
  - product-page-bundles
systems:
  - widget
  - storefront
source_paths:
  - app/assets/widgets/product-page/templates/registry.ts
  - app/assets/widgets/product-page/methods/config-lifecycle-methods.ts
  - app/assets/widgets/product-page/methods/layout-shell-methods.ts
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
  - app/assets/widgets/product-page/methods/footer-modal-state-methods.ts
  - app/assets/widgets/product-page/methods/modal-methods.ts
  - app/assets/widgets/product-page/methods/selection-methods.ts
  - app/assets/widgets/product-page/templates/cascade-template.ts
  - app/assets/widgets/product-page/templates/grid-template.ts
  - app/assets/widgets/product-page/templates/modal-slot-template.ts
  - app/assets/widgets/shared/template-design-system.ts
  - app/assets/widgets/shared/components/product-card.ts
  - app/assets/widgets/shared/components/selected-product-row.ts
  - app/assets/widgets/shared/components/selected-product-slots.ts
  - app/assets/widgets/shared/components/discount-progress.ts
  - extensions/bundle-builder/blocks/bundle-product-page.liquid
  - internal docs/EB Settings Design Reference.md
  - broader-PPB-template-parity.md
  - wolfpack-bundle-template-design-system-plan.md
  - docs/competitor-analysis/16-eb-full-data-flow-investigation.md
  - docs/competitor-analysis/17-eb-complete-configure-e2e-audit.md
related_docs:
  - broader-PPB-template-parity.md
  - wolfpack-bundle-template-design-system-plan.md
tags:
  - ppb
  - storefront-template
  - product-card
  - parity
keywords:
  - EB
  - Product List
  - Product Grid
  - Horizontal Slots
  - Vertical Slots
  - template contracts
  - architecture

# Product Page Bundle Template Design-Implementation Goal (EB-Inspired)

## Objective

Deliver an implementation pass where EB behavior and look-and-feel is replicated for all PPB templates while preserving the current WPB architecture and file structure inherited from FPB.

Target contract mapping:

- Product List → `bundleDesignTemplate="PDP_INPAGE"` + `templateId="CASCADE"`
- Product Grid → `bundleDesignTemplate="PDP_INPAGE"` + `templateId="COGNIVE"`
- Horizontal Slots → `bundleDesignTemplate="PDP_MODAL"` + `templateId="MODAL"`
- Vertical Slots → `bundleDesignTemplate="PDP_MODAL"` + `templateId="SIMPLIFIED"`

Contract resolution rules for the implementation slice:
- `TemplateDesignSystem.resolvePpbTemplate` is the source of truth.
- `_getProductPageTemplateContract` should return exactly one canonical PPB contract from `PDP_INPAGE`/`PDP_MODAL` + `templateId`.
- LIST path remains `bundleDesignTemplate="PDP_INPAGE"` + `CASCADE`.
- GRID path remains `bundleDesignTemplate="PDP_INPAGE"` + `COGNIVE`.
- HORIZONTAL_SLOTS path remains `bundleDesignTemplate="PDP_MODAL"` + `MODAL`.
- VERTICAL_SLOTS path remains `bundleDesignTemplate="PDP_MODAL"` + `SIMPLIFIED`.

## Shared component inventory (used by all PPB templates)

Keep these as the invariant PPB contract surface:

### 1) Runtime/template control plane

- `TemplateDesignSystem.ppb`
  - `ppb` contracts (`GRID`, `LIST`, `HORIZONTAL_SLOTS`, `VERTICAL_SLOTS`)
  - `resolvePpbTemplate` (`PDP_INPAGE` / `PDP_MODAL`) and contract lookup
  - Canonical IDs and slot orientation metadata
- `ProductPageConfigLifecycleMethods`
  - `parseConfiguration`
  - `loadBundleData` (bootstrap + API fallback)
  - `_getProductPageTemplateType`
  - `_getProductPageDesignPreset`
  - `_getProductPageTemplateContract`
  - `_isProductPageInpageTemplate`
  - `_isProductPageModalSlotTemplate`
  - `_markProductPageTemplate`
  - `ensureProductPageTemplateStylesheet`

Runtime invariants:
- `_markProductPageTemplate` must always emit:
  - `this.container.dataset.ppbTemplateType = templateType`
  - `this.container.dataset.ppbDesignPreset = canonicalPreset`
  - `this.container.dataset.ppbTemplateId = canonicalPreset`
  - `this.elements.stepsContainer.dataset.ppbTemplateType = templateType`
  - `document.body?.setAttribute('wpbmix-template-type', templateType)`
  - `document.body?.setAttribute('wpbmix-template-id', canonicalPreset)`
- Selection data model (`selectedProducts`, `stepProductData`, session restoration keys) must remain shared across all four templates.
- `ProductPageSelectionMethods`
  - `updateProductSelection`
  - `setSelectedQuantity`
  - `getSelectedQuantity`
  - `shouldAutoAdvanceProductPageStep`
- `ProductPageProductDataMethods`
  - step catalog fetch and normalization used by all templates
- `ProductPageLayoutShellMethods`
  - `renderUI`, `renderSteps`, `renderFooter`, `renderQuantityOptionPills`, `updateAddToCartButton`

### 2) Shared render/state components

- `renderSharedProductCard` (`shared/components/product-card.ts`)
  Used by in-page templates with mode-specific class variants.
- `resolveProductCardSelectionAriaLabel` (`product-card.ts`)
  Shared accessibility behavior for selected/unselected card state.
- `renderSelectedProductRow` (`shared/components/selected-product-row.ts`)
  Used for selected-entry rows in in-page summary/list pathways.
- `renderSelectedProductSlots` (`shared/components/selected-product-slots.ts`)
  Used for all slot-oriented views through the slot shell wrapper.
- `renderDiscountProgress` (`shared/components/discount-progress.ts`)
  Used by in-page footer messaging and discount disclosure across templates where enabled.
- `ProductPageFooterModalStateMethods`
  - `renderFooter`
  - `updateFooterMessaging`
  - `shouldDisableIntermediateProductPageCta`
  - `renderQuantityOptionPills`
- `ProductPageInpageRenderMethods`
  - `_renderInpageStepProducts`
  - `_renderInpageStepSection`
  - `_createCascadeStepFlowHeader`
  - `_filterProductsForInpageCategory`
- `ProductPageSelectionDataMethods`
  - `getSelectedProductsPayload`
  - `serializeSelectedProducts`

### Cross-template hard-required shared components

The following objects are hard requirements for every PPB render path and must not be moved into template-specific branches:

- `TemplateDesignSystem` contract registry (`ppb` map and `resolvePpbTemplate`)
- `ProductPageConfigLifecycleMethods` bootstrap and template-marking pipeline
- `ProductPageLayoutShellMethods.renderUI` shell entrypoint
- `ProductPageSelectionMethods` shared selection state operations
- `ProductPageProductDataMethods` product fetch/normalization
- `ProductPageFooterModalStateMethods` for shared CTA/message orchestration
- `renderSharedProductCard` and `resolveProductCardSelectionAriaLabel`
- `renderSelectedProductRow`
- `renderSelectedProductSlots`
- `renderDiscountProgress`
- `modal-slot-template.ts` slot shell wrapper
- shared payload and session helpers (`getSelectedProductsPayload`, `serializeSelectedProducts`)

Template-specific branching is allowed only for:
- shell class variants
- grid/row/slot orientation wrappers
- CSS class presets and layout classes
- empty/loaded state messaging copy

No selection algorithm, payload shape, or persistence contract may be introduced in template-specific code.

### 3) Modal/card-specific shared behavior

- `ProductPageModalMethods`
  - modal open/close flow
  - modal tab/category rendering
  - product card rendering inside modal
  - step navigation and validation gating
- `modal-slot-template.ts`
  - shared slot renderer used by both MODAL and SIMPLIFIED
  - orientation is driven by `slots.orientation` from contract (`horizontal`/`vertical`)
- `ProductPageSelectionMethods` (`_appendModalSlotEmptyCards`, `createEmptyStateCard`, `createSelectedProductCard`)
  - shared replacement/open/remove behavior for slot paths
- `cascade-template.ts`
  - multi-step row flow support and shared header state
- `grid-template.ts`
  - grid template branch and compact-card integration

## Template layout and product-card contract matrix

### A) Product List (`PDP_INPAGE` + `CASCADE`)

- Product container: `bw-ppb-inpage-step-section` with in-page row grid.
- Step flow: uses in-page cascade flow when multi-step (`bw-ppb-cascade-step-flow`).
- Card shape: `renderSharedProductCard` in `mode: 'row'`.
  - Card class includes `bw-ppb-cascade-product-row`, `wpbMixCascadeProductWrapper`, state/availability modifiers.
  - Variant selector can be injected inline depending on control/policy.
  - Compare-at rendering is controlled by `showProductComparedAtPrice`.
- Summary/disclosure:
  - `renderCascadeFooter` + shared selected drawer (`bw-ppb-cascade-selected-drawer` / `wpbMixCascadeCartDrawerContainer`) in required states.
- Responsive rule source-of-truth:
  - no horizontal overflow at narrow widths
  - row structure remains readable at small columns

### B) Product Grid (`PDP_INPAGE` + `COGNIVE`)

- Product container: in-page step section + grid flow with multi-step header rail (`bw-ppb-grid-step`, `bw-ppb-grid-step-flow`).
- Card shape: `renderSharedProductCard` in `mode: 'grid'`.
  - Card class must include `bw-ppb-grid-product-card` and out-of-stock modifier when applicable.
  - `selectedAction: 'button'` and shared quantity clamp states must remain.
- Summary/disclosure:
  - same in-page summary/discount model as List but with grid-specific header/flow state.
- Responsive behavior:
  - multi-column desktop behavior should collapse cleanly to two columns on narrow placements
  - card geometry must stay equal-height where selection state changes

### C) Horizontal Slots (`PDP_MODAL` + `MODAL`)

- Contract note:
  - Horizontal Slots uses shared modal slot renderer with `slots.orientation === 'horizontal'`.

- Template mode: modal slot shell with horizontal slot grid (`bw-ppb-modal-slot-section`, `bw-ppb-modal-slot-grid`).
- Slot state:
  - empty slot cards in modal flow open picker
  - filled cards remain replaceable/removable (when not default/locked)
  - each slot row card uses slot-shell components, not shared in-page product card row/grid variants.
- Replacement/removal:
  - empty card click -> open modal
  - filled card click -> reopen for replacement
  - remove action -> returns slot to empty state
- Runtime marker:
  - `data-ppb-slot-orientation="horizontal"` and `slots.orientation === 'horizontal'`.

### D) Vertical Slots (`PDP_MODAL` + `SIMPLIFIED`)

- Template mode: same modal slot shell but vertical card stack and simplified classes.
- Runtime note:
  - Vertical Slots uses same modal renderer as horizontal orientation with `slots.orientation === 'vertical'`.
- Slot state:
  - empty/fill/replacement/removal identical to Horizontal Slots.
- Card shape:
  - must use simplified grid modifier (`bw-ppb-modal-slot-section--simplified`, `bw-ppb-modal-slot-grid--simplified`).
- Runtime marker:
  - `data-ppb-slot-orientation="vertical"` set on container and steps container.

### Cross-template invariant rules

- No duplicate selection model: all templates mutate/read the same `selectedProducts` state tree.
- Template switches must never alter cart payload shape or persistence keying.
- Product selection restoration must continue to bind by selection identity (`selectionId`/`variantId`) after restore.

## Shared component matrix (reused vs template-only)

| Component / Module | Used by all PPB templates | List only | Grid only | Horizontal Slots only | Vertical Slots only |
| --- | --- | --- | --- | --- | --- |
| TemplateDesignSystem + template contract | ✅ | | | | |
| config lifecycle (`_markProductPageTemplate`, stylesheet loader) | ✅ | | | | |
| Selection methods (`updateProductSelection`, `setSelectedQuantity`) | ✅ | | | | |
| Product data fetch/normalize | ✅ | | | | |
| Discount progress (`renderDiscountProgress`) | ✅ | | | | |
| Footer state (`renderFooter`, `updateAddToCartButton`) | ✅ | | | | |
| Shared in-page card (`renderSharedProductCard`) | ✅ | ✅ | ✅ | | |
| Slot wrapper (`renderSelectedProductSlots`) | ✅ | | | ✅ | ✅ |
| Slot card primitives (`createEmptyStateCard`, modal slot methods) | | | | ✅ | ✅ |

## Execution plan

### Phase A: Contract freeze + shared ownership hardening

1. Freeze template contracts in this document before any CSS or markup changes.
2. Keep file structure identical to existing FPB/PPB architecture:
   - shared contract + methods remain reusable
   - template-specific behavior stays in adapter methods
3. Confirm runtime markers:
   - `template-type`, `template-id`
   - `wpb-mix-consolidated-design="true"`
   - template-specific orientation on modal mode
4. Confirm stylesheet selection:
   - `LIST` -> list stylesheet
   - `GRID` -> grid stylesheet
   - `HORIZONTAL_SLOTS` and `VERTICAL_SLOTS` -> shared modal stylesheet
5. Confirm no new helper functions duplicate state transitions or payload calculation.

### Phase B: List + Grid adapter parity pass (in-page cards)

1. Align card/row behavior for List and Grid to:
   - shared selection lifecycle
   - compare-at rendering behavior
   - empty / loading / no-products fallbacks
2. Confirm both templates respect:
   - variant expansion/individual-variant behavior
   - available/unavailable control states
   - single/multi-step transition behavior
3. Keep logic in `inpage-render-methods.ts` and `grid-template.ts`/`cascade-template.ts` only.

### Phase C: Modal-slot adapter parity pass (horizontal + vertical)

1. Keep modal-slot shell and modal product pickers common.
2. Apply only orientation-specific adapter classing and spacing for horizontal/vertical variants.
3. Verify replace/remove/open/close and slot-capacity behavior remains policy-driven, not template-branch special-cased.
4. Keep slot summary surface behavior aligned with existing shared row model.

### Phase D: Verification + hardening pass

1. Validate all four templates still mount with:
   - identical data shape
   - identical cart add payload shape
   - identical discount progression semantics
2. Re-run shared regression for previously accepted templates whenever shared files change.
3. Confirm no API changes are required unless explicit EB contract mismatch is proven.

## Guardrails (hard constraints)

- No backend/contract model changes in this lane.
- Do not introduce new template contracts beyond existing PPB IDs.
- Do not change selection-state algorithm; only render/path adjustments for parity.
- Avoid new architecture surfaces: keep the same shared core + inpage/modal adapters.
- No duplicate source-of-truth for selection state across templates.
- No non-visual behavior toggles hidden behind template-specific branching unless already scoped by template contracts.
- No API behavior edits unless evidence shows contract mismatch.
- No styling injected from JS for any geometry/spacing/alignment task.
- No competitor-facing strings in production runtime code.

## Testing and acceptance criteria

### Pre-merge testing criteria

- Admin scope stays fixture-focused; store edits are treated as fixture setup only.
- For each template lane, capture:
  - desktop 1280x800 and mobile 390x844
  - one-step and multi-step bundles
  - one normal step and one grid/list variant-heavy bundle
  - sold-out/low-stock and multi-variant cases
  - default products and empty-slot states.
- For each lane, verify:
  - selection add/remove and replacement
  - quantity controls + max-quantity clamp
  - compare-at and discount messaging rendering
  - cart button state transitions (disabled/enabled/completion states)
  - persistence restore across reloads.
- Confirm no console regressions tied to PPB template switch and style loading.
- Evidence capture (per template lane):
  - Desktop 1280×800 and mobile 390×844 snapshots.
  - Multi-step and single-step rendering.
  - Slot-capacity and category-driven filtering scenarios.
  - Selection restore after hard-reload.
  - Sold-out / low-stock / variant-replacement interactions.
  - Replace/remove state from partial and full templates.
- Accessibility pass checks:
  - accessible name for add/qty/remove/action targets
  - `aria-expanded` / `aria-pressed` consistency across selection
  - focus handling in modal slot replacement flow

### Functional verification artifacts

- Browser evidence required via direct Chrome DevTools MCP flows (desktop and mobile).
- Confirm generated stylesheet URL selection and DOM markers align with selected template.
- Ensure all template lanes remain functional under the same template contract JSON structure.

### Template completion criteria (lane-level)

- Product List: pass all in-page row/card behaviors with stable shared state.
- Product Grid: pass all in-page card/grid behaviors including selected state restoration.
- Horizontal Slots: pass slot open/replace/remove flow and horizontal slot geometry.
- Vertical Slots: pass slot open/replace/remove and orientation-specific geometry with no shared behavior divergence.

### Current verification status

- [x] Shared template contract pipeline and alias normalization are covered by unit gates.
- [x] List/Grid in-page card rendering uses shared product-card controls and state handling.
- [x] Modal slot shared shell/path behavior is covered by unit gates for empty/filled/vertical states.
- [x] Legacy EB aliases (`CASCADE`, `COGNIVE`, `MODAL`, `SIMPLIFIED`) resolve through shared `TemplateDesignSystem.resolvePpbTemplate`.
- [ ] Direct viewport/fixture parity evidence captured for all four template lanes (1280×800 and 390×844), including interaction behavior.

## Delivery scope for this implementation

- Scope for this goal:
  - shared PPB component usage consistency
  - Product List / Product Grid / Horizontal Slots / Vertical Slots layout and card parity
  - no architecture expansion or new server-side payload shape changes
- Out of scope:
  - FPB changes
  - feature flag additions
  - unrelated data-model migrations

## EB component sharing summary (implemented contract)

EB-derived PPB storefront components that remain shared by all four runtime templates:

- Template contract and shell selection (`TemplateDesignSystem`, stylesheet selection, dataset markers).
- Step/product loading and normalization (`ProductPageConfigLifecycleMethods`, `ProductPageProductDataMethods`).
- Shared product cards (`renderSharedProductCard`) with `row`/`grid` mode selection by contract.
- Shared selection state APIs (`updateProductSelection`, `setSelectedQuantity`, payload serialization).
- Shared selected summary/disclosure path (`renderSelectedProductRow`, `renderSelectedProductSlots`, `renderDiscountProgress`).
- Shared footer/CTA state controls (`renderFooter`, `updateFooterMessaging`, `updateAddToCartButton`, cart validation gates).
- Shared modal slot shell logic for slot paths (open/replace/remove flow and slot payload behavior).

Template-specific render specializations remain in template adapters only:

- Product List: in-page row flow and cascade controls in `cascade-template.ts`.
- Product Grid: in-page card grid controls in `grid-template.ts`.
- Horizontal Slots / Vertical Slots: slot renderer branch in `modal-slot-template.ts` with `slots.orientation`.

## Per-template card contract (final)

- Product List (`PDP_INPAGE` + `CASCADE`)
  - Card mode: shared product card `row`.
  - Layout: in-page step section + row flow.
  - Summary: shared selected row + footer messaging + in-page CTA.
- Product Grid (`PDP_INPAGE` + `COGNIVE`)
  - Card mode: shared product card `grid`.
  - Layout: in-page step section + grid flow + multi-column collapse rules.
  - Summary: shared selected row + discount footer.
- Horizontal Slots (`PDP_MODAL` + `MODAL`)
  - Card mode: modal slot cards.
  - Layout: shared modal slot shell with horizontal orientation.
  - Summary: shared selected slot row + modal CTA progression.
- Vertical Slots (`PDP_MODAL` + `SIMPLIFIED`)
  - Card mode: modal slot cards.
  - Layout: shared modal slot shell with vertical orientation.
  - Summary: shared selected slot row + modal CTA progression.

## Implementation guardrails for this goal

- Do not edit source files outside the listed PPB template stack.
- Do not change server payload shape or cart-add contract from this lane.
- Do not add new PPB template IDs.
- Do not branch business logic by template except:
  - orientation-specific classing
  - shell selection
  - CSS marker attributes
- Do not gate fallback/load/empty paths by template.

## Goal finish criteria

- Contract correctness:
  - `PDP_INPAGE + CASCADE` resolves to LIST
  - `PDP_INPAGE + COGNIVE` resolves to GRID
  - `PDP_MODAL + MODAL` resolves to HORIZONTAL_SLOTS
  - `PDP_MODAL + SIMPLIFIED` resolves to VERTICAL_SLOTS
- Shared component usage:
  - all shared modules listed above are still invoked by every template path
  - only layout/adapter differences remain in `cascade-template.ts`, `grid-template.ts`, `modal-slot-template.ts`
- Runtime marker consistency:
  - template markers and body attrs exist on every render and on reload
- Verification:
  - desktop/mobile evidence captured for all four templates after implementation changes
  - one-step and multi-step fixtures covered per lane
  - sold-out, compare-at, empty, reload-restored, and replace/remove cases captured

## Hard guardrails for implementation changes

- No additional template contracts, no additional architecture layers, and no new source-of-truth state.
- Never branch selection logic by template beyond layout and class variants.
- Never bypass `TemplateDesignSystem.resolvePpbTemplate`.
- Never change cart payload shape while touching layout/card templates.
- Never regress state sharing between templates for restore/selection/payload.
- Never ship fixed pixel-dependent layout values in logic that should be stylesheet-driven.
- Manual parity evidence (desktop + mobile) is mandatory before merge.
