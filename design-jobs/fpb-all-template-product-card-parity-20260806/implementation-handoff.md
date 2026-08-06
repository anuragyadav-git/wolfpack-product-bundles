---
schema_version: 1
id: fpb-all-template-product-card-implementation-handoff
title: FPB All-Template Product Card Implementation Handoff
type: implementation-handoff
status: complete
summary: Defines the bounded production contract for Direction A across every FPB summary preset and responsive tray state.
last_audited: 2026-08-06
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - fpb-summary
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/full-page/methods/mobile-summary-methods.js
  - app/assets/widgets/full-page/methods/responsive-layout-methods.js
  - app/assets/widgets/full-page-css/shared/mobile-summary-footer.css
related_docs:
  - design-jobs/fpb-all-template-product-card-parity-20260806/state-matrix.md
  - design-jobs/fpb-all-template-product-card-parity-20260806/responsive-contract.md
tags:
  - fpb
  - summary
keywords:
  - direction-a
  - summary-sidebar
  - mobile-tray
---

# Implementation Handoff

Artifact job ID: fpb-all-template-product-card-parity-20260806
Artifact revision: 1
Artifact status: draft

## Identity and approved references

Implement approved Direction A across Standard, Classic, Compact, and Horizontal FPB summaries. Current captures are the implementation baseline; approved Yash-wolfpack captures provide structural reference only. This successor job now governs the unified all-template product-card summary system.

## Source-of-truth priority

1. Existing selection, pricing, inventory, validation, navigation, add-on, and cart semantics.
2. Repository `AGENTS.md`, architecture notes, and graph impact requirements.
3. Approved anatomy, state, responsive, interaction, and accessibility contracts in this job.
4. `design-tokens.json` and `content-stress-cases.yaml`.
5. Approved screenshots for visual nuance only.

## Goal

Create one coherent summary hierarchy for every FPB preset: review header, qualification/configuration, selected-product review, and stable totals/actions. Preserve deliberate desktop identities while using one shared, non-modal disclosure tray below 1024px of measured widget-container width. Prove all SUM-01 through SUM-20 states freshly after implementation.

## Non-goals

- No product-card, product-grid, product-modal, step-navigation, PPB, persistence, schema, or deployment script changes.
- No hardcoded merchant-facing fallback copy, legacy behavior branches, page scroll lock, separate preset-specific mobile semantic trees, or fixed screenshot layouts.
- No config-load priority change, proxy retry change, dev server restart, repair apply mode, or unrelated storefront behavior changes.

## Current architecture map

- Composition and high-connectivity widget owner: `app/assets/bundle-widget-full-page.js`; avoid changing it unless necessary for this implementation.
- Desktop summary render and events: `app/assets/widgets/full-page/methods/side-panel-methods.js`.
- Mobile summary render and disclosure: `app/assets/widgets/full-page/methods/mobile-summary-methods.js`.
- Responsive construction and ownership: `app/assets/widgets/full-page/methods/responsive-layout-methods.js`.
- Box selection: `app/assets/widgets/full-page/methods/box-selection-sidebar-methods.js`.
- Validation, add-ons, gifts, and empty targets: `app/assets/widgets/full-page/methods/validation-addons-methods.js`.
- Shared desktop presentation: `app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css` and `base/floating-badge-sidebar-progress.css`.
- Shared mobile presentation: `app/assets/widgets/full-page-css/shared/mobile-summary-footer.css`.
- Preset identity: `templates/side-footer-standard.css`, `side-footer-classic.css`, `side-footer-compact.css`, and `side-footer-horizontal.css`.
- Merchant token bridge: `app/lib/css-generators/css-variables-generator.ts`; edit only if an existing value is not reaching canonical owner.
- Generated assets are produced by `scripts/build-widget-bundles.js` and `scripts/minify-assets/targets.js`; never edit outputs directly.

## Exact component anatomy

Use `component-anatomy.md`: one owning shell with review header and conditional clear control; optional qualification/configuration region; selected list or slot region; total/savings block; and the existing primary action. The desktop surface keeps preset identity: Standard narrow bordered, Classic borderless, Compact wide, Horizontal intermediate. Below the boundary, every preset uses the same inset tray anatomy. Header and actions stay outside the bounded selected-list scroll region.

## Required states

All twenty state families SUM-01 through SUM-20 in `state-matrix.md` are required across their listed presets and viewports.

## Responsive transformations

- At 1024px or wider measured FPB widget-container width, show the desktop sidebar and hide the tray.
- Below 1024px, show one shared inset tray and hide the desktop sidebar.
- Prove 1023/1024/1025 and 767/768/769 boundaries, a 600px constrained host, 320px minimum width, safe-area inset, orientation, short height, 200% zoom, and no horizontal overflow.
- The tray is non-modal and page scroll remains available. When expanded content is tall, only its selected-list region owns bounded internal scroll.
- Reload and resize must never expose duplicate summary surfaces or the wrong preset identity.

## Interaction contract

Reuse existing handlers for remove, clear/confirm, disclosure, quantity-tier changes, back/next, and add-to-cart. One activation invokes one handler. Collapsed tray content is inert and hidden; its single disclosure button owns `aria-expanded`. Expansion does not mutate selection. Remove and clear recompute count, pricing, progress, and action availability once. Busy submission blocks duplicate sends and failure preserves selections. Compact and Horizontal must relinquish any divergent body-scroll lock behavior.

## Accessibility contract

Preserve native controls, usable accessible names, clear state, visible focus, exposed disabled/busy/selected/expanded state, and 44px control targets where specified. Completion, progress, savings, and errors cannot depend on color alone. Focus recovers logically after remove, clear, collapse, and failure; internal scrolling brings focused controls into view. Decorative slots/skeletons remain hidden from assistive technology. Reflow works at 200%, and reduced motion removes nonessential movement without delaying state access.

## Tokens and merchant-configurable values

Use semantic aliases in `design-tokens.json` and existing merchant variables for typography, color, copy, slot icon, quantity options, discount messages, gifts/add-ons, locale, and currency. Use `clamp()`, `minmax()`, intrinsic sizing, percentages, `fr`, and container/viewport-aware units. Exact values are limited to primitives and the approved 1024px container boundary.

## Content fixtures

Use Agent bundle `cmse8sp170000v0ytaqqzsvtw`. Transition fixtures incrementally within a matrix group: remove incompatible configuration and carry compatible state forward. Fully restore only at fixture-group boundaries or after contamination.

## Allowed production areas

- The three canonical summary/responsive method owners for required behavior, semantics, or ownership changes.
- Shared mobile and desktop summary CSS for truly common behavior.
- The four preset CSS files only for genuine desktop identity differences.
- Box/validation/add-on owners only if a matrix state proves an existing summary branch cannot surface correctly.
- Merchant token bridge only when repository/browser evidence proves a missing canonical value path.

## Prohibited changes

- Selection, pricing, inventory, validation, navigation, add-on, gift, or cart contracts.
- FPB config loading priority, proxy retry logic, PPB code paths, Admin UI, persistence, schema, or deployment scripts.
- JavaScript-injected layout CSS, duplicated preset-specific mobile logic/DOM, fabricated copy, `!important`, CSS/class/placement tests, or direct generated-file edits.
- `shopify app deploy`, `npm run dev`, server/tunnel restart, repair apply mode, or destructive storefront actions.

## Chrome DevTools QA plan

Use direct Chrome DevTools in the connected default profile on `https://admin.shopify.com/...` for full AppStorefront flows as defined by `browser-test-plan.yaml`. Before each pass clear cache where available and hard reload with cache bypass. Verify active CSS asset URL and widget version before visual judgment. Capture storefront-only PNGs, semantic snapshots, computed geometry, console/network evidence, and desktop/mobile visual checks across all required viewports and boundaries.

## Acceptance criteria

Every required state and viewport from `state-matrix.md` and `responsive-contract.md` must pass with evidence. Semantic, business, responsive, accessibility, console, network, and regression criteria cannot be waived by visual resemblance. Geometry tolerances in `design-tokens.json` apply.

## Stopping criteria

Stop before implementation if ownership conflicts with this map are found, merchant values lack an authoritative source, or a new semantic/design decision is required. Stop before QA if required evidence paths are blocked. Return for design review if a new breakpoint, structure, copy, behavior, or scope decision appears.

## Expected final report format

Report changed source/generated files, every intermediate verification step, test/build outputs, browser case evidence, remaining differences, blockers/waivers, and rollback steps. Never claim unexecuted evidence.

## Unresolved risks

- Shared summary methods and base CSS have broad FPB blast radius; preserve business owners and prove all presets.
- The 1024px component boundary may require responsive construction rather than viewport-only CSS.
- Compact/Horizontal scroll-lock divergence may affect focus and page scroll when unified.
- Storefront cache can present stale output; active-asset verification is mandatory.

## Rollback guidance

Revert only the failed verified slice and its generated outputs, then rebuild widgets/CSS and restore previous fixture state through normal app configuration. Do not reintroduce legacy branches or hand-edit generated assets. Preserve approved design contracts as durable history.
