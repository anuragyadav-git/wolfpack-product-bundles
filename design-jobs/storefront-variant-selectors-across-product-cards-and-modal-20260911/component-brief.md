---
schema_version: 1
id: storefront-variant-selector-component-brief
title: Storefront Variant Selector Component Brief
type: design-contract
status: draft
summary: Defines the cross-template variant-selector redesign boundary for FPB and PPB product-card and modal surfaces.
last_audited: 2026-09-11
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - apps/OnlyBundles-app/app/assets/widgets/shared/variant-selector.ts
  - apps/OnlyBundles-app/app/assets/widgets/product-page/variant-selector-modes.ts
  - apps/OnlyBundles-app/app/assets/widgets/full-page/methods/product-card-footer-methods.ts
  - apps/OnlyBundles-app/app/assets/widgets/full-page/methods/modal-product-methods.ts
  - apps/OnlyBundles-app/app/assets/widgets/full-page-css
  - apps/OnlyBundles-app/app/assets/widgets/product-page-css
related_docs:
  - internal docs/Architecture/Product Card Layout Contract.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - storefront
  - variant-selector
keywords:
  - swatch
  - product-card
  - product-modal
---

# Component Brief

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 4
Artifact status: complete

## Identity

- Job ID: `storefront-variant-selectors-across-product-cards-and-modal-20260911`
- Revision: 1
- Product family: FPB and PPB
- Template or preset: FPB Standard, Classic, Compact, Horizontal; PPB Grid, List, Horizontal Slots, Vertical Slots
- Component: Variant selectors in product cards, the FPB product-details modal, and PPB modal picker cards
- Implementation mode: design-director

## Problem and goal

- User-provided problem: Dropdowns, pills, color swatches, and image swatches need to fit differently shaped product cards and modal cards without clipping, overflow, congestion, or disruption to other card controls.
- Primary user action: Review and select an available product variant while retaining clear access to product identity, price, availability, quantity, and Add actions.
- Design goal: Give each template a selector composition appropriate to its card geometry while preserving a recognizable shared interaction model.
- Success signal: Every required selector state stays contained and readable on all eight templates at desktop and 390×844; changing a variant does not resize a row or obscure, displace, or break another component.

## Scope

- In scope: Selector anatomy and visual treatment for current FPB and PPB cards; FPB product-details modal; PPB bottom-sheet picker cards; desktop and mobile transformations; long/many/unavailable/missing-swatch stress states; focus and selected-state presentation.
- Out of scope: Shopify variant semantics, pricing calculations, inventory rules, cart mutations, merchant theme CSS, bundle summary redesign, unrelated product-card redesign, and fabricated swatch colors/images.
- Merchant-configurable values: shared FPB/PPB category `variantSelectorMode` and color-tooltip setting; FPB selector enablement and primary option; existing storefront design tokens.
- Business logic constraints: Shopify Storefront API option/swatch data remains authoritative. Existing handlers continue to update variant, image, price, availability, and inventory. Add/quantity behavior does not change. Same-row card heights remain equal in every state.
- Accessibility constraints: Native select semantics remain for dropdowns; non-dropdown choices remain one named radio group; unavailable values stay disabled and announced; selected state is not color-only; every control retains a 44px target and visible focus; mobile uses persistent selected labels rather than hover-only tooltips.
- Repository-observed ownership: Shared FPB selector behavior is owned by `shared/variant-selector.ts`; FPB card/modal composition by their existing method owners; PPB mode behavior by `product-page/variant-selector-modes.ts`; shared and template CSS owners are already split by family and template. PPB List/Grid are in-page surfaces, while Horizontal/Vertical Slots share the PPB picker. FPB alone owns a nested product-details modal.

## Evidence and approval

- User facts: All selector types, all card shapes, both modal/card surfaces, and both desktop/mobile need iterative Chrome QA with no clipping, overflow, congestion, or sibling breakage.
- Screenshot facts: No request-specific screenshots were supplied. A fresh cache-bypassed FPB preview rendered Standard successfully. The freshly prepared draft PPB product retained an empty app-block surface. The existing Active/Unlisted PPB reference product initialized the Grid runtime and rendered its one configured single-variant product after Preview Bundle refreshed its synchronized configuration. Attempts to add a nine-variant subscription product and an ordinary multi-option jeans product reached local counts of two and three, showed the native save bar, completed Save, and opened fresh signed previews; however, a subsequent hard reload restored the category to one selected product and the sanitized Liquid `data-bundle-config` still contained one step product. This is a fixture persistence/setup blocker upstream of selector rendering, not evidence that selectors are visually broken.
- Repository facts: `StepCategory` already persists the four canonical modes (`dropdown`, `pill`, `color_swatch`, `image_swatch`) for either bundle family, but the FPB runtime drops them and chooses a presentation by template. Shopify's current Storefront API schema validates `ProductOption.optionValues { id name swatch { color image } }` together with variant `selectedOptions`; the selector must use those canonical fields and never infer swatches. Product cards require named media, identity, price, selector, and action regions so sibling content does not shift.
- Assumptions: Visual character may vary by template while control semantics and state hierarchy remain shared; this remains reversible until direction approval.
- Open decisions: Degree of template-owned visual differentiation within the shared selector semantics.
- Scope status: Complete for revision 3. FPB and PPB share the existing category selector modes. For two-dimensional FPB products, one primary visual dimension remains directly selectable while every additional dimension uses a labeled native select; dropdown mode remains one complete-variant dropdown. Card regions remain stable between no-variant and two-dimensional siblings. Reference intake will use fresh signed previews whose category setting survives an Admin hard reload before visual evidence is accepted.
- Approved by and at:
