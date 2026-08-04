---
schema_version: 1
id: fpb-classic-summary-component-anatomy
title: FPB Classic Summary Component Anatomy
type: design-contract
status: complete
summary: Maps Calm Review Panel regions to canonical FPB rendering, state, event, style, token, responsive, fixture, and test owners.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - app/assets/widgets/full-page-css/templates/classic/desktop-sidebar.css
  - app/assets/widgets/full-page-css/templates/classic/mobile.css
  - app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css
related_docs:
  - .agents/skills/storefront-design-director/references/code-ownership-and-handoff.md
tags:
  - fpb
  - classic
  - summary
  - ownership
keywords:
  - anatomy
  - ownership
---

# Component Anatomy

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: complete

## Component tree

~~~text
FPB Classic root (.fpb-preset-classic)
├── Desktop sidebar (.full-page-side-panel)
│   ├── Header
│   │   ├── Summary-purpose and merchant-copy group
│   │   └── Clear action
│   ├── Conditional progress and box-selection region
│   ├── Review content
│   │   ├── Item count
│   │   ├── Selected-product rows or slot grid
│   │   ├── Empty/loading placeholders
│   │   └── Conditional add-on feedback
│   └── Action footer
│       ├── Divider
│       ├── Total, compare-at, savings
│       └── Back/Next/Add-to-cart action
└── Mobile replacement (.fpb-mobile-summary-tray)
    ├── Disclosure/count control
    ├── Conditional discount/progress feedback
    ├── Expanded review region
    │   ├── Summary copy and Clear
    │   ├── Box-selection options when configured
    │   └── Selected-product list or slots
    └── Persistent action row with total
~~~

## Region ownership

| Region ID | Responsibility | Semantic element | State owner | Event owner | Style owner | Token owner | Responsive replacement |
|---|---|---|---|---|---|---|---|
| anatomy-root | Select Classic presentation while retaining the FPB controller. | Existing widget root and layout containers. | FPB controller composed in `app/assets/bundle-widget-full-page.js`; preset contract in `classic.config.js`. | Existing controller lifecycle. | `templates/side-footer-classic.css` import graph and `classic/base.css`. | Existing full-page variables. | Same controller; desktop sidebar is replaced by mobile tray below the current Classic boundary. |
| desktop-summary-shell | Sticky review surface and internal layout. | `aside`-equivalent existing side panel container; do not add a duplicate tree. | `renderSidePanel` inputs and controller selections. | Existing render lifecycle. | Canonical: `classic/desktop-sidebar.css`; shared shell defaults remain in base CSS. | `--bundle-side-panel-*`, Classic geometry tokens. | `mobile-summary-shell`. |
| summary-header | Establish review purpose, retain merchant-configured title/subtitle, and expose recovery. | Heading/copy group plus real Clear `button`. | `getBundleSummaryText()` and selected items. | `showClearCartConfirmation()`. | `classic/desktop-sidebar.css`; mobile header in `classic/mobile.css`. | Title/text/clear variables generated from design settings. | Expanded mobile header; collapsed tray exposes concise status instead of duplicating long copy. |
| progress-feedback | Render box selection, discount message, progress, tier, and add-on eligibility only when configured. | Existing buttons, progress components, and feedback containers. | PricingCalculator, bundle selectors, validation/add-on methods. | Existing box/tier selection and navigation events. | Shared progress CSS plus Classic desktop/mobile placement rules. | Discount and progress variables from `cartFooter` settings. | Moves above the expanded list; collapsed tray shows only compact status that already exists. |
| selected-list | Review selected identity, image, variant, quantity, price, and removal. | Existing selected-row/list structure; remove remains a named `button`. | `getAllSelectedProductsData()`, removal-state helpers, shared selected-row component. | `removeSummarySelectedProduct()`. | Classic desktop rows in `classic/desktop-sidebar.css`; mobile list/slots in `classic/mobile.css`; shared row primitives remain shared. | Product surface, border, title, variant, price, and remove tokens. | Expanded mobile review list; slot mode remains configuration-driven. |
| empty-loading | Preserve empty slots, skeleton counts, and loading semantics without fabricating selected content. | Existing status/placeholder structures. | Summary empty-state and required-quantity helpers. | Existing retry/render lifecycle; no new event. | Classic desktop/mobile state presentation; shared skeleton primitives. | Existing neutral/product surface tokens. | Same state meaning in expanded mobile tray; collapsed bar remains actionable when empty. |
| action-footer | Separate review content from totals and the primary action. | Existing total container and real navigation/cart `button`. | PricingCalculator, condition validator, current step, busy state. | Existing Next/Add-to-cart/back handlers in `renderSidePanel` and mobile action creation. | Desktop canonical owner: `classic/desktop-sidebar.css`; shared totals/action defaults: `base/sidebar-totals-discounts.css`; mobile: `classic/mobile.css`. | Sidebar button, total, divider, and cart-footer variables. | Persistent bottom action row inside the mobile tray. |
| mobile-summary-shell | Own collapsed/expanded disclosure, internal scroll, safe-area behavior, and action persistence. | One toggle `button` with `aria-expanded`; expanded content remains in the same tray. | `compactMobileSummaryTrayExpanded` and mobile pulse/timer state. | `_toggleCompactMobileSummaryTray`, mobile action handler, Clear. | Canonical: `classic/mobile.css`; shared mobile footer primitives are upstream defaults only. | Existing sidebar/cart-footer variables plus Classic mobile geometry tokens. | Replaced by desktop sidebar at the established Classic breakpoint. |

## Repeated, conditional, feedback, and overlay elements

- Repeated selected rows are created by `renderSidePanel` or the mobile summary list renderer; shared `renderSelectedProductRow` remains the semantic primitive where already used.
- Product Slots switches both desktop and mobile summaries into slot representations. The design must not force row anatomy onto slot mode.
- Discount messaging, progress, box tiers, add-on eligibility, free gifts, compare-at totals, and savings appear only from existing business state.
- Clear continues through the existing confirmation overlay. Direction A changes the visual hierarchy, not confirmation or destructive-event semantics.
- Busy/loading state uses the existing widget busy class and inline spinner. It must prevent duplicate actions without removing the control's accessible name.
- Default or cross-step products can suppress or disable removal according to existing removal-state helpers; presentation must communicate the disabled reason without changing the rule.

## Scroll, sticky, and fixed regions

- Desktop: the existing `.full-page-side-panel` remains sticky. The shell grows intrinsically; only the selected-list region becomes bounded and scrollable when content exceeds available viewport space. The total/action footer remains outside that scroll owner.
- Mobile: the existing tray remains sticky, not fixed, and page scroll remains available while expanded. The tray must use dynamic viewport and safe-area constraints. The selected-list region owns overflow; the disclosure and action row do not scroll away.
- Do not add body scroll locking, a second mobile overlay tree, or a fixed page-wide footer.
- The current breakpoint ownership is split: `side-footer-classic.css` establishes the desktop grid from 769px, `classic/desktop-sidebar.css` applies sidebar detail from 1024px, and `classic/mobile.css` applies through 767px. The 768–1023 boundary must be explicitly reconciled in the responsive contract rather than guessed in implementation.

## Repository evidence and canonical conflict resolution

- Rendering owner: `app/assets/widgets/full-page/methods/side-panel-methods.js` creates desktop header, conditional feedback, count, selected rows/slots, totals, and actions.
- Mobile rendering and disclosure owner: `app/assets/widgets/full-page/methods/mobile-summary-methods.js`; it owns the one-button `aria-expanded` interaction, mobile content, action creation, animations, and no-scroll-lock behavior.
- Business-state owner: the existing FPB controller plus PricingCalculator, ConditionValidator, bundle selectors, and removal-state helpers. Direction A does not create business logic.
- Template behavior descriptor: `app/assets/widgets/full-page/templates/classic.config.js`; `classic-template.js` is intentionally empty and is not a styling owner.
- Template style owner: `app/assets/widgets/full-page-css/templates/classic/desktop-sidebar.css` and `classic/mobile.css`, assembled through `templates/side-footer-classic.css`.
- Shared presentation owner: `app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css` provides common total/action/focus primitives. Change it only for a proven cross-preset requirement; the approved visual redesign is Classic-scoped.
- Merchant token owner: `app/lib/css-generators/css-variables-generator.ts` maps design settings to sidebar/cart-footer variables. `app/lib/settings-design-runtime.ts` and the Settings Design preview model own persisted setting interpretation and Admin preview. Do not add new merchant settings unless a required design value cannot reuse an existing semantic token.
- Runtime custom CSS owner: `app/lib/css-generators/index.ts` appends merchant custom CSS. It is an override boundary, not a place to implement Direction A.
- Build owner: `scripts/build-widget-bundles.js` composes raw widget modules; CSS minification emits the Classic extension asset. Any implementation must rebuild the full-page widget for JS and minify CSS for stylesheet changes, then bump `WIDGET_VERSION` before deployment.
- Fixture/runtime route owner: the signed app-proxy FPB document and API projection described in `internal docs/Architecture/Widget Architecture.md`; bundle loading priority is explicitly out of scope.
- Behavior-test owners: `tests/unit/assets/fpb-standard-mobile-summary-action.test.ts`, `fpb-summary-sidebar-slots.test.ts`, `fpb-summary-current-step-removal.test.ts`, `fpb-summary-discount-badge.test.ts`, and shared selected-summary tests. Tests must assert behavior, never CSS/class placement.
- Visual-regression owner: the design-job browser plan and future QA artifacts at the required viewports; no captured investigation screenshot belongs in a production commit.
- Conflict resolution: shared renderer semantics and business events stay canonical. Direction A presentation belongs in Classic CSS. Markup changes are permitted only when the approved hierarchy or accessibility cannot be achieved through the existing semantic regions; if needed, make the smallest shared semantic change and verify Standard, Compact, and Horizontal.
- Graph evidence: `graphify-out/GRAPH_REPORT.md` confirms the FPB widget/build system as a high-connectivity area. The expected blast radius is the FPB widget community, with sibling-template risk through shared rendering and base CSS. The configured `graphify-out/wiki/` directory is absent in this worktree, so no wiki evidence was available.
