---
schema_version: 1
id: fpb-all-template-product-card-anatomy
title: Component Anatomy Template
type: design-job-template
status: complete
summary: Maps the approved all-template FPB summary anatomy to one canonical owner per visible, interactive, responsive, and merchant-configurable region.
last_audited: 2026-08-06
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

Artifact job ID: fpb-all-template-product-card-parity-20260806
Artifact revision: 1
Artifact status: draft

## Component tree

~~~text
FPB summary system
├── Desktop summary sidebar
│   ├── Summary header
│   │   ├── Merchant-configured title
│   │   ├── Merchant-configured subtitle
│   │   └── Clear selections control
│   ├── Configuration and qualification region
│   │   ├── Bundle Quantity Options / box selector
│   │   ├── Tier CTA or requirement copy
│   │   ├── Discount message
│   │   ├── Discount progress
│   │   └── Add-on / gift qualification messaging
│   ├── Selection review region
│   │   ├── Item count
│   │   └── Exactly one presentation branch
│   │       ├── Selected product rows
│   │       ├── Product slot tiles
│   │       └── Requirement skeleton rows
│   └── Checkout action region
│       ├── Savings badge and original/final total
│       ├── Back control when applicable
│       └── Next or Add to Cart control
└── Mobile summary tray (responsive replacement)
    ├── Persistent disclosure control
    │   ├── Chevron
    │   ├── Selected quantity or transient offer status
    │   └── Accessible expanded state
    ├── Persistent qualification region when configured
    │   ├── Discount badge/message
    │   └── Discount progress
    ├── Collapsible review region
    │   ├── Merchant-configured title/subtitle
    │   ├── Clear selections control
    │   ├── Item count
    │   └── The same rows, slots, or skeleton requirement represented on desktop
    └── Persistent primary action
        ├── Next or Add to Cart label
        └── Final price
~~~

## Region ownership

| Region ID | Responsibility | Semantic element | State owner | Event owner | Style owner | Token owner | Responsive replacement |
|---|---|---|---|---|---|---|---|
| SUM-ROOT | Selects the active FPB preset and mounts one sidebar layout | `.layout-sidebar[data-fpb-design-preset]` | `templates/registry.js` and the four FPB config modules | `responsive-layout-methods.js` | `base/layout-tiers-timeline.css` plus the active preset stylesheet | Existing FPB layout and merchant design variables | Replaced by SUM-MOBILE-TRAY at the established narrow presentation boundary |
| SUM-DESKTOP | Owns the desktop review surface and ordered regions | `.full-page-side-panel` | `side-panel-methods.js::renderSidePanel` | `responsive-layout-methods.js::renderFullPageLayoutWithSidebar` | `base/sidebar-totals-discounts.css`; preset identity only in `side-footer-{preset}.css` | Existing sidebar background, text, border, radius, spacing, and button variables | Hidden while SUM-MOBILE-TRAY is active |
| SUM-HEADER | Shows configured title, subtitle, and clear action | Heading/copy group plus `button` | `mobile-summary-methods.js::getBundleSummaryText`; selected state from the controller | `side-panel-methods.js`; clear event delegates to the existing confirmation flow | Shared sidebar CSS; preset files may vary density, not order or semantics | Merchant summary copy and existing text/color tokens | Re-created inside the expanded tray by `_renderCompactMobileSummaryBundleItems` |
| SUM-CLEAR | Clears all shopper selections through the guarded confirmation flow | `button` with usable name | Shared selected-products controller state | `clear-cart-confirmation-methods.js` through the event bound in the summary renderer | Shared control styling | Existing action/icon/color tokens | Same guarded action inside expanded mobile review; not a second competing control |
| SUM-BOX | Selects the active Bundle Quantity Option and exposes the current target | Radio/selection group with labels | `box-selection-sidebar-methods.js` | `box-selection-sidebar-methods.js` | Shared sidebar configuration styling; preset density only in template CSS | Merchant box labels and existing control tokens | Remains inside the expanded tray when applicable; primary action uses the same validation owner |
| SUM-TIER | Communicates the next tier or active qualification requirement | Status/copy block | Pricing selectors and `box-selection-sidebar-methods.js::getSidebarTierCtaContent` | None unless the existing box-selection control is present | Shared sidebar qualification styling | Merchant discount copy and existing progress/message tokens | Condenses into the persistent mobile qualification region without changing rule semantics |
| SUM-DISCOUNT-MESSAGE | Renders enabled progress/success copy and variables | Status copy; live announcement behavior is defined later | `PricingCalculator`, `TemplateManager`, and saved pricing configuration | No independent event | `base/sidebar-totals-discounts.css` and shared mobile CSS | Merchant-configured localized message and pricing tokens | Same computed message in the tray; no separate calculation path |
| SUM-DISCOUNT-PROGRESS | Renders enabled progress geometry | Progress component | Shared discount selectors and renderer | No independent event | `base/floating-badge-sidebar-progress.css` plus shared mobile placement rules | Existing merchant progress colors and progress tokens | Same component instance contract at mobile placement |
| SUM-ADDON | Shows add-on/gift locked, eligible, selected, and active-step placement | Status section | `validation-addons-methods.js` | Existing navigation and selection handlers | Shared sidebar feedback CSS; preset files only tune spacing | Merchant add-on title/messages and existing success/locked tokens | Included only where the mobile contract permits; does not displace review or primary action |
| SUM-COUNT | Reports selected rows or slot quantity | Text/status label | `side-panel-methods.js` and `mobile-summary-methods.js` using shared selection data | None | Shared sidebar/mobile CSS | Typography and text-color tokens | Persistent mobile badge uses the same normalized quantity |
| SUM-REVIEW | Owns exactly one rows, slots, or skeleton branch | List/grid region | `side-panel-methods.js`; empty-state semantics from `validation-addons-methods.js` | Child remove actions delegate to the shared removal owner | `base/sidebar-totals-discounts.css` | Summary row/slot size, gap, media, border, radius tokens | Bounded expanded tray region rendered by `mobile-summary-methods.js` |
| SUM-ROW | Represents one selected product, variant, quantity, price, and removal state | Repeated row with named remove `button` | Shared selected-product data and summary display helpers | `side-panel-methods.js::removeSummarySelectedProduct` | Shared selected-row/sidebar CSS | Existing text, media, price, control, and focus tokens | Mobile row retains identity and guarded removal semantics unless the approved state contract excludes per-row removal |
| SUM-SLOT | Represents each required quantity as a filled or empty slot | Repeated list/grid item; filled image has alt text, decorative merchant placeholder is ignored | `side-panel-methods.js`, `box-selection-sidebar-methods.js`, and `validation-addons-methods.js` | Filled-slot removal uses SUM-ROW's removal owner where present | Shared slot CSS; preset files may tune column fit only | Merchant slot icon and existing slot-size/gap/radius tokens | `mobile-summary-methods.js::_renderCompactMobileSummarySlotTiles` uses the same target-count semantics |
| SUM-SKELETON | Communicates unfilled required quantity when Product Slots is disabled | Noninteractive placeholder rows | `getRemainingSummarySkeletonCount` plus `validation-addons-methods.js` quantity owner | None | Shared sidebar skeleton CSS | Existing summary density tokens | Same remaining-count branch in the expanded tray; never used as loading chrome |
| SUM-TOTAL | Shows savings badge, optional original total, and final total | Price summary group | Shared `PricingCalculator` plus selected add-on discount owner | None | `base/sidebar-totals-discounts.css` | Currency/locale and merchant price visibility/color tokens | Final price remains in the persistent mobile CTA; detailed original/savings remain reachable when expanded |
| SUM-NAV | Owns Back, Next, and Add to Cart composition | Button group | Current step, validation, box-selection, and cart state owners | `side-panel-methods.js` delegates to existing navigation/cart methods | Shared sidebar action CSS; preset files tune surface identity only | Merchant button copy/color/radius tokens | Persistent mobile action from `_createMobileSummaryActionButton` uses the same guards and actions |
| SUM-MOBILE-TRAY | Replaces the desktop sidebar with one inset, sticky, expandable review tray for all four presets | Section/container with one disclosure button and inert hidden review content | `mobile-summary-methods.js` | `responsive-layout-methods.js::_renderMobileBottomBar` mounts it; `mobile-summary-methods.js::_toggleCompactMobileSummaryTray` changes state | Canonical common owner: `shared/mobile-summary-footer.css`; preset CSS may expose only preset identity tokens | Existing merchant sidebar/button/summary tokens transported by `_syncMobilePortalThemeVars` | Desktop replacement, not an additional simultaneous summary |
| SUM-DISCLOSURE | Expands/collapses the connected mobile tray | One `button` with `aria-expanded`; hidden review is `inert` and `aria-hidden` | `compactMobileSummaryTrayExpanded` | `_toggleCompactMobileSummaryTray` and `_syncCompactMobileSummaryDisclosureState` | Shared mobile summary CSS | Existing button text/color/focus tokens | Not applicable on desktop |
| SUM-OFFER-PULSE | Temporarily reports additional unlocked offers without replacing the disclosure control | State text inside SUM-DISCLOSURE | `getMobileAdditionalOffersPulseState` and add-on eligibility owner | Timer lifecycle in `_syncMobileAdditionalOffersPulse` | Shared mobile badge states | Existing eligible/status colors | Returns to the normalized selected quantity after the bounded announcement |

## Repeated, conditional, feedback, and overlay elements

- Repeated: selected rows, slot tiles, skeleton requirement rows, box choices, add-on tiers, and progress milestones. Each repetition is driven by existing normalized state; presentation must not duplicate business calculations.
- Conditional: Product Slots chooses slots versus rows/skeletons; pricing independently controls message and progress; Bundle Quantity Options controls box selection and target; add-ons/gifts depend on configuration, eligibility, and active step; Back depends on step position; CTA label and enabled behavior depend on final-step, rules, and box validation.
- Feedback: rule validation uses the existing toast and inline message owners; unavailable/default recovery stays in the existing selection pipeline; loading overlays remain page-owned and are not redesigned as summary skeletons.
- Overlays: the clear-cart confirmation is the only summary-owned modal/overlay. The mobile tray is a sticky responsive surface, not a modal; it must not create a second backdrop or competing generic bottom sheet for these four presets.
- State invariant: desktop and mobile read the same selection, pricing, qualification, locale, and currency state. A viewport transition changes presentation only.

## Scroll, sticky, and fixed regions

- Desktop: the sidebar participates in the two-column grid and aligns to the top of its content column. The selected review region owns bounded vertical overflow when content exceeds the available summary budget; totals and actions remain reachable after the list.
- Mobile: one inset tray is sticky at the viewport bottom for Standard, Classic, Compact, and Horizontal. The collapsed tray keeps disclosure, qualification when configured, and primary action readable.
- Expanded mobile: the review region is bounded by dynamic viewport and safe-area space, becomes the internal scroll owner when content exceeds that budget, and leaves the connected disclosure and primary action reachable.
- Background scrolling remains available for the approved shared tray behavior unless a later interaction contract explicitly records a preset exception. Current Classic evidence proves no scroll lock; the implementation must remove the current Compact/Horizontal-only lock divergence unless new product semantics require it.
- No summary width, height, or row count may be overfit to a single screenshot. Width and capacity are content-driven through existing tokens, intrinsic sizing, `minmax`, and viewport/container constraints.

## Repository evidence and canonical conflict resolution

### Repository-observed ownership

- Runtime assembly: `app/assets/bundle-widget-full-page.js` composes the full-page method modules.
- Desktop render owner: `app/assets/widgets/full-page/methods/side-panel-methods.js`.
- Mobile render and disclosure owner: `app/assets/widgets/full-page/methods/mobile-summary-methods.js`.
- Responsive mount and desktop/mobile replacement owner: `app/assets/widgets/full-page/methods/responsive-layout-methods.js`.
- Box state: `app/assets/widgets/full-page/methods/box-selection-sidebar-methods.js`.
- Rule, add-on, gift, and empty-target state: `app/assets/widgets/full-page/methods/validation-addons-methods.js`.
- Shared desktop CSS: `app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css` and `base/floating-badge-sidebar-progress.css`.
- Shared mobile CSS: `app/assets/widgets/full-page-css/shared/mobile-summary-footer.css`, built to `extensions/bundle-builder/assets/bundle-widget-full-page-mobile-summary.css` and loaded for the FPB block/app embed.
- Preset CSS: `templates/side-footer-{standard,classic,compact,horizontal}.css`, built as separate active-preset assets.
- Build owner: `scripts/build-widget-bundles.js` for JS and `scripts/minify-assets/targets.js` for CSS.

### Conflicts to resolve in implementation

1. `base/sidebar-totals-discounts.css` still contains an older mobile sheet layout while the dedicated shared mobile asset and large Standard/Compact/Horizontal preset blocks also style the same tray. Common tray geometry belongs in `shared/mobile-summary-footer.css`; base keeps cross-viewport summary primitives, and preset files retain only genuine preset identity.
2. The current mobile renderer marks Compact/Horizontal as a fluid-footer branch while this direction requires one shared tray anatomy for all four presets. The renderer must expose one semantic contract; preset markers may remain for desktop or limited visual identity, not different mobile behavior.
3. Compact/Horizontal currently lock background scroll when expanded while Standard/Classic do not. Direction A selects the non-modal sticky tray behavior across presets.
4. The generic backdrop-driven bottom-bar path remains in `responsive-layout-methods.js`, but `usesCompactMobileSummaryTray()` already routes every in-scope FPB preset to the connected tray. It must not be revived or duplicated for this redesign.
5. `_syncMobilePortalThemeVars` writes merchant-derived custom properties onto the portaled tray. This is legitimate dynamic token transport, not static styling; keep it limited to merchant/runtime values and put presentation in CSS.
6. Existing hard-coded fallback copy is outside this design change. New work must resolve through existing configured/localized copy owners and must not introduce new merchant-facing fallback copy.

### Blast radius

- God node: `app/assets/bundle-widget-full-page.js` is a high-connectivity composition root but should require composition changes only if a new module is introduced; Direction A does not require one.
- Shared FPB risk: all four side-footer presets share renderer and state owners, so every behavior change requires all-template verification.
- CSS risk: base and shared mobile assets affect all four presets; each preset asset must be checked for contradictory selectors and specificity escalation.
- PPB risk: none expected because no product-page widget owner is in the allowed change set; shared primitives must be treated as read-only unless a behavioral defect is independently proven.
