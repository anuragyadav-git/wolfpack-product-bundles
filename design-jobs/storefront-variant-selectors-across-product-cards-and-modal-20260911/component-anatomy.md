---
schema_version: 1
id: storefront-design-director-component-anatomy-template
title: Component Anatomy Template
type: design-job-template
status: active
summary: Defines named regions and semantic, state, style, event, and responsive ownership.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/component-anatomy.md
related_docs:
  - .agents/skills/storefront-design-director/references/code-ownership-and-handoff.md
tags:
  - template
keywords:
  - anatomy
  - ownership
---

# Component Anatomy

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 2
Artifact status: complete

## Component tree

~~~text
Storefront bundle widget
├── FPB template surface
│   ├── Product-card collection
│   │   └── Product card (Standard, Classic, Compact, Horizontal)
│   │       ├── Product media
│   │       ├── Product identity and price
│   │       ├── Variant selector region
│   │       │   └── Option group, repeated in Shopify option order
│   │       │       ├── Option-group label
│   │       │       ├── Intrinsic option matrix or existing dropdown trigger
│   │       │       │   └── Option control, repeated for every value
│   │       │       └── Selected-value and availability feedback
│   │       └── Quantity and Add controls
│   ├── Product-details overlay
│   │   ├── Product media
│   │   └── Product information
│   │       ├── Identity, price, and description
│   │       ├── Variant selector region
│   │       └── Quantity and Add controls
│   └── Existing mobile variant drawer when the FPB presentation contract selects it
└── PPB template surface
    ├── In-page product collection (Grid or List)
    │   └── Product card
    │       ├── Product media
    │       ├── Product identity and price
    │       ├── Variant selector region
    │       │   └── Dropdown or intrinsic pill/swatch matrix
    │       └── Quantity and Add controls
    └── Slot picker overlay (Horizontal Slots or Vertical Slots)
        └── Picker product card
            ├── Product media and identity
            ├── Variant selector region
            └── Quantity and Add controls
~~~

## Region ownership

| Region ID | Responsibility | Semantic element | State owner | Event owner | Style owner | Token owner | Responsive replacement |
|---|---|---|---|---|---|---|---|
| AN-01 | FPB option data, selected value, available combinations, and presentation creation | One labeled group per Shopify option; buttons or existing dropdown semantics | `VariantSelectorComponent` in `shared/variant-selector.ts` mutating the current product's variant fields through its existing callback contract | `VariantSelectorComponent.attachListeners` and delegated FPB handlers | Shared FPB selector base; template files own density only | Existing bundle variant-selector and merchant design variables | Existing FPB mobile drawer only where current policy selects drawer mode; otherwise intrinsic reflow |
| AN-02 | FPB card placement relative to identity, price, stock, quantity, and Add controls | Normal-flow card content block | Full-page widget product/card state | `fullPageProductCardFooterMethods` delegates selection to AN-01 | `full-page-css` template owner for Standard, Classic, Compact, or Horizontal | Template density aliases backed by existing merchant variables | Same region reflows; it never becomes an overlay or borrows the sticky footer |
| AN-03 | FPB product-details placement and selected product synchronization | Normal-flow details group inside the existing dialog/sheet | Existing FPB modal product state | `fullPageModalProductMethods` plus AN-01 callback | Existing modal CSS and shared selector base | Existing modal/card design variables | Desktop details column becomes the existing narrow single-column sheet |
| AN-04 | PPB selector-mode normalization and canonical Shopify swatch resolution | Native labeled `select` or one named `radiogroup` | `variant-selector-modes.ts` | `createPpbVariantSelectorElement` change handler calls the supplied variant callback | `product-page-css/base/variant-selector-modes.css` | Existing PPB variant-selector and merchant color/radius variables | The same semantic group reduces intrinsic columns; no mode substitution |
| AN-05 | PPB Grid placement | Dedicated normal-flow selector block inside the shared Grid card | PPB in-page product state | `inpage-render-methods.ts` delegates to AN-04 | `product-page-css/templates/inpage-grid.css` for spacing/density only | Grid-specific density aliases backed by AN-04 tokens | Intrinsic track count falls with available card width |
| AN-06 | PPB List placement | Dedicated details-region selector block independent from price and action rows | PPB in-page/cascade product state | `inpage-render-methods.ts` delegates to AN-04 | `product-page-css/templates/inpage-cascade.css` for spacing/density only | List-specific density aliases backed by AN-04 tokens | Details region stacks without horizontal page overflow |
| AN-07 | PPB slot-picker placement | Selector block inside each existing picker card | Existing PPB modal selection state | `product-page/methods/modal-methods.ts` delegates to AN-04 | `product-page-css/templates/modal-slots.css` and existing modal-card layout for spacing only | Modal density aliases backed by AN-04 tokens | Existing modal becomes its current narrow sheet; no second product-details modal |
| AN-08 | Selected value announcement | Persistent text for pill/color/image modes; current visible value for dropdown/button modes | AN-01 or AN-04 | Same control's selection handler | Shared family selector base | Typography and status tokens already used by the widget | Remains visible at every width and never depends on tooltip hover |
| AN-09 | Unavailable value feedback | Disabled control with visible unavailable treatment and accessible name | Shopify-hydrated variant availability | Existing family selector handler refuses unavailable selections | Shared family selector base | Existing disabled/status tokens | Remains in layout so availability changes do not reflow siblings |
| AN-10 | PPB color tooltip | Supplemental hover/focus label only when merchant-enabled | PPB category configuration plus AN-04 swatch label | Existing pointer/focus positioning helper | `variant-selector-modes.css` | Existing tooltip surface tokens | Suppressed as the only label on narrow/touch surfaces; AN-08 stays persistent |
| AN-11 | Same-row card equalization | Stretch every card in a rendered row to the tallest initial selector content | Template collection layout | No interaction owner | Existing template grid/flex owner | Existing card geometry contract | One-column narrow layouts become naturally content-height cards |
| AN-12 | Sticky bundle actions | Preserve cart summary and CTA independently of selector content | Existing FPB/PPB bundle selection state | Existing sticky footer handlers | Existing template sticky-footer files | Existing footer tokens | No selector markup, positioning, or scroll ownership moves into this region |

## Repeated, conditional, feedback, and overlay elements

- Option groups repeat once per Shopify option dimension in canonical option order. Option controls repeat once per value and remain in DOM even when unavailable.
- Single-variant products render no selector region, preserving the current behavior.
- PPB mode choice remains category-owned. Only color mode may render the optional tooltip; every non-dropdown mode renders persistent selected-value text.
- Missing Shopify color/image swatches render the existing neutral labeled control. No color-name parsing, variant-image inference, or compatibility map is introduced.
- FPB's product-details overlay and PPB's slot picker remain separate owners. The selector redesign does not add another modal, popover, or nested product-details surface.
- Selection errors and stock feedback remain owned by existing widget feedback mechanisms. The selector does not create a second toast or status system.

## Scroll, sticky, and fixed regions

- Product-card selectors own no scroll container. Their intrinsic matrix wraps in normal flow and cannot use a one-line overflow rail.
- Modal content keeps its existing vertical scroll owner. The selector cannot add a nested horizontal or vertical scroller.
- The existing FPB mobile drawer remains the only selector-specific fixed overlay when the current presentation policy selects it; its backdrop, Escape, focus, and selection-dismiss contract stays delegated to the existing drawer layer manager.
- Sticky FPB and PPB bundle footers remain independent fixed/sticky regions. Content spacing must account for their existing safe area, but selector code cannot reposition or resize them.
- Tooltips are transient visual overlays and cannot reserve layout height or be the only source of the selected value.

## Repository evidence and canonical conflict resolution

- `shared/variant-selector.ts` is the canonical FPB selector behavior owner. Its current four-value cap and `+N` overflow control conflict with approved Direction A for primary values; the owner must expose the same values through intrinsic normal-flow wrapping without adding a parallel renderer.
- `product-page/variant-selector-modes.ts` is the canonical PPB mode, swatch, semantic, and change-event owner. It must not move selection logic into template renderers.
- `product-page-css/base/variant-selector-modes.css` is the canonical PPB shared presentation owner. Grid, List, and modal-slot files may set density and placement only.
- Generic PPB `.variant-selector` rules currently appear in `discount-footer-shared.css` and `modal-product-grid.css`; the implementation must inspect and remove contradictory selector presentation from those noncanonical owners instead of adding specificity overrides.
- FPB Standard currently reserves a fixed selector row height in `templates/standard/overrides.css`. That conflicts with content-driven wrapping and must be replaced at the canonical Standard card geometry owner while preserving equal-height rows.
- Classic-specific selector presentation remains in `templates/classic/variant-selector.css`; Horizontal placement remains in `templates/horizontal/overrides.css`; Compact ownership must be resolved through the existing template contract rather than a new stylesheet.
- `fullPageProductCardFooterMethods`, `fullPageModalProductMethods`, PPB `inpage-render-methods.ts`, and PPB `modal-methods.ts` own composition only. They may place the selector region and pass narrow typed inputs, but cannot duplicate selector business logic or Shopify data normalization.
- The only permissible dynamic visual input is Shopify's canonical swatch color/image value already applied by the PPB selector owner. All static selector layout and styling belongs in raw source CSS and must be rebuilt/minified through the documented widget pipeline.
