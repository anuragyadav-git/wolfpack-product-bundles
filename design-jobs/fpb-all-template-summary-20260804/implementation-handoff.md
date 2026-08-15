---
schema_version: 1
id: fpb-all-template-summary-implementation-handoff
title: FPB All-Template Summary Implementation Handoff
type: implementation-handoff
status: approved
summary: Defines the bounded production contract for Direction A across every FPB summary preset and responsive tray state.
last_audited: 2026-08-05
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
  - design-jobs/fpb-all-template-summary-20260804/state-matrix.md
  - design-jobs/fpb-all-template-summary-20260804/responsive-contract.md
tags:
  - fpb
  - summary
keywords:
  - direction-a
  - summary-sidebar
  - mobile-tray
---

# Implementation Handoff

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 2
Artifact status: approved

## Identity and approved references

Implement approved Direction A, **Unified Calm Review System**, across Standard, Classic, Compact, and Horizontal FPB summaries. The Agent captures show current behavior; approved Yash-wolfpack captures provide structural inspiration only. The predecessor Classic implementation remains its starting baseline, but this revision governs the unified all-template system.

## Source-of-truth priority

1. Existing selection, pricing, inventory, validation, navigation, add-on, and cart semantics.
2. Repository `AGENTS.md`, internal architecture notes, and graph impact requirements.
3. Approved anatomy, state, responsive, interaction, and accessibility contracts in this job.
4. `design-tokens.json` and `content-stress-cases.yaml`.
5. Approved screenshots for visual nuance only.

## Goal

Create one coherent summary hierarchy for every FPB preset: review header, qualification/configuration, selected-product review, and stable totals/actions. Preserve deliberate desktop identities while using one shared, non-modal disclosure tray below 1024px of measured widget-container width. Prove all SUM-01 through SUM-20 states freshly after implementation.

## Non-goals

- No product-card, product-modal, step-navigation, Admin, PPB, persistence, database, pricing, inventory, validation, add-on, or cart redesign.
- No new merchant setting, fabricated copy, legacy fallback, page scroll lock, blocking overlay, or per-preset mobile semantic tree.
- No config-load priority change, proxy retry change, deploy, development-server restart, broad refactor, or unrelated cleanup.
- No fixed screenshot-layout copy; responsive rules must remain content-driven.

## Current architecture map

- Composition and high-connectivity widget owner: `app/assets/bundle-widget-full-page.js`; avoid changing it unless assembly evidence makes that unavoidable.
- Desktop summary render and events: `app/assets/widgets/full-page/methods/side-panel-methods.js`.
- Mobile summary render and disclosure: `app/assets/widgets/full-page/methods/mobile-summary-methods.js`.
- Responsive construction and ownership: `app/assets/widgets/full-page/methods/responsive-layout-methods.js`.
- Box selection: `app/assets/widgets/full-page/methods/box-selection-sidebar-methods.js`.
- Validation, add-ons, gifts, and empty targets: `app/assets/widgets/full-page/methods/validation-addons-methods.js`.
- Shared desktop presentation: `app/assets/widgets/full-page-css/base/sidebar-totals-discounts.css` and `base/floating-badge-sidebar-progress.css`.
- Shared mobile presentation: `app/assets/widgets/full-page-css/shared/mobile-summary-footer.css`.
- Preset identity: `templates/side-footer-standard.css`, `side-footer-classic.css`, `side-footer-compact.css`, and `side-footer-horizontal.css`.
- Merchant token bridge: `app/lib/css-generators/css-variables-generator.ts`; edit only if an existing value is not reaching a canonical owner.
- Generated assets are produced by `scripts/build-widget-bundles.js` and `scripts/minify-assets/targets.js`; never edit outputs directly.

## Exact component anatomy

Use `component-anatomy.md`: one owning shell with review header and conditional Clear; optional qualification/configuration region; selected list or slot region; total/savings block; and the existing primary action. The desktop surface retains preset identity: Standard narrow bordered, Classic airy borderless, Compact wide coherent surface, Horizontal intermediate bordered. Below the boundary, every preset uses the same inset tray anatomy. Header and actions stay outside the bounded selected-list scroll region.

## Required states

All twenty state families SUM-01 through SUM-20 in `state-matrix.md` are required across their listed presets and viewports. They cover empty rows/slots, partial/exact/overflow, clear/removal, disclosure, quantity tiers and validation, every pricing family, add-ons/gifts, saved copy/localization, multi-step rules, loading/recovery, responsive boundaries, reload idempotency, control states, submit recovery, content/media/zoom stress, and reduced motion. Existing predicates and handlers remain authoritative; presentation must not duplicate calculations, submissions, or state updates.

## Responsive transformations

- At 1024px or wider measured FPB widget-container width, show the desktop sidebar and hide the tray.
- Below 1024px, show one shared inset tray and hide the desktop sidebar.
- Prove 1023/1024/1025 and 767/768/769 boundaries, a 600px constrained host, 320px minimum width, safe-area inset, orientation, short height, 200% zoom, and no horizontal overflow.
- The tray is non-modal and page scroll remains available. When expanded content is tall, only its selected-list region owns bounded internal scroll.
- Reload and resize must never expose duplicate summary surfaces or the wrong preset identity.

## Interaction contract

Reuse existing handlers for remove, Clear/cancel/confirm, disclosure, quantity-tier changes, Back/Next, and Add to cart. One activation invokes one handler. Collapsed tray content is inert and hidden; its single disclosure button owns `aria-expanded`. Expansion never mutates selection. Remove and Clear recompute count, pricing, progress, and action availability once. Busy submission blocks duplicates and failure preserves selections. Compact and Horizontal must relinquish any divergent body-scroll lock.

## Accessibility contract

Preserve native controls, useful accessible names, unique quantity labels, visible focus, exposed disabled/busy/selected/expanded state, and at least 44px control targets where specified. Completion, progress, savings, and errors cannot depend on color alone. Focus recovers logically after remove, Clear, collapse, and failure; internally scrolling content brings focused controls into view. Decorative slots/skeletons remain hidden from assistive technology. Reflow works at 200%, and reduced motion removes nonessential movement without delaying state access.

## Tokens and merchant-configurable values

Use semantic aliases in `design-tokens.json` and existing merchant variables for typography, color, copy, slot icon, quantity options, discount messages, gifts/add-ons, locale, and currency. Use `clamp()`, `minmax()`, intrinsic sizing, percentages, `fr`, and container/viewport-aware units. Exact values are limited to primitives and the approved 1024px component boundary. Do not add `!important`, hardcoded marketing copy, or duplicated theme colors.

## Content fixtures

Use Agent bundle `cmse8sp170000v0ytaqqzsvtw`. Transition fixtures incrementally within a matrix group: remove only incompatible configuration and carry compatible state forward. Fully restore only at fixture-group boundaries or after contamination. Execute all required cases in `content-stress-cases.yaml`, including long localized copy, large EUR values, missing/slow media, empty and long lists, invalid defaults, unavailable items, delayed loading, validation error, 200% zoom, and reduced motion.

## Allowed production areas

- The three canonical summary/responsive method owners, only for required behavior, semantics, or ownership changes.
- Shared mobile and desktop summary CSS for truly common behavior.
- The four preset CSS files only for genuine desktop identity differences.
- Box/validation/add-on owners only if a matrix state proves an existing summary branch cannot surface correctly.
- The merchant token bridge only when repository/browser evidence proves a missing canonical value path.
- Focused behavior tests, `test-spec/fpb-all-template-summary.spec.md`, and build-generated widget/CSS outputs.

## Prohibited changes

- Selection, pricing, inventory, validation, navigation, add-on, gift, or cart contracts.
- FPB config loading priority, proxy retry, PPB, Admin UI, persistence, schema, or deployment scripts.
- JavaScript-injected layout CSS, duplicated preset-specific mobile logic/DOM, merchant custom CSS as owner, backwards-compatibility branches, fabricated copy, `!important`, CSS/class/placement tests, or direct generated-file edits.
- `shopify app deploy`, `npm run dev`, server/tunnel restart, repair apply mode, real orders, or destructive storefront actions.

## Test commands discovered from repository

Create `test-spec/fpb-all-template-summary.spec.md` before implementation and follow Red-Green-Refactor for behavior changes. Extend behavior coverage near `fpb-standard-mobile-summary-action.test.ts`, `fpb-summary-sidebar-slots.test.ts`, `fpb-summary-current-step-removal.test.ts`, and `fpb-summary-discount-badge.test.ts` only when affected. Never test CSS, class names, or placement. Run focused tests; `node --check` for every changed raw widget JS file; ESLint on modified lintable files; `npm run build:widgets:full-page` after JS changes; `npm run minify:assets css` after CSS changes; and `npm run graphify:rebuild` after code changes. Audit hook-generated diffs. Do not bump `WIDGET_VERSION` unless an explicitly approved deploy is imminent.

## Chrome DevTools QA plan

Use only direct Chrome DevTools MCP in the connected default profile on `https://agent-5sfidg3m.myshopify.com/apps/product-bundles/wpb/cmse8sp170000v0ytaqqzsvtw`. Before every pass clear Cache Storage where available and hard reload with cache bypass; never restart the server. Verify the active CSS asset URL, relevant rule, and widget version before visual judgment. Execute `browser-test-plan.yaml` across all nine required viewports and critical boundaries. Capture storefront-only PNGs without browser chrome plus semantic snapshots, computed geometry, console/network evidence, desktop/mobile Lighthouse, a performance trace, and sibling/regression evidence. Keep raw screenshots, diffs, HARs, and investigation captures uncommitted.

## Acceptance criteria

Every item in `acceptance-criteria.md` must pass. Semantic, business, responsive, accessibility, console, network, and sibling failures cannot be waived by visual resemblance. Visual geometry uses the tolerances in `design-tokens.json`.

## Stopping criteria

Stop before editing if actual ownership conflicts with this map, a merchant value lacks an authoritative source, or a new semantic/design decision is required. Stop before QA if focused tests, syntax, lint, build, or minification fail. Stop before deploy, production mutation, real cart completion, or work outside allowed areas. Return to design review for any new breakpoint, structure, copy, business behavior, or mask.

## Expected final report format

Report changed source/generated files; each intermediate commit; tests, syntax, lint, builds, and graph rebuild; every browser case and evidence path; remaining differences; console/network/accessibility/Lighthouse/performance results; sibling outcomes; blockers/waivers; and rollback boundary. Never claim unexecuted evidence.

## Unresolved risks

- Shared summary methods and base CSS have broad FPB blast radius; preserve business owners and prove all presets.
- The 1024px component boundary may require responsive construction rather than viewport-only CSS.
- Compact/Horizontal scroll-lock divergence may affect focus and page scroll when unified.
- Storefront cache can present stale output, so active-asset verification is mandatory.

## Rollback guidance

Revert only the failed verified slice and its generated outputs, then rebuild widgets/CSS and restore the last clean test fixture through normal application configuration. Do not reintroduce legacy branches or hand-edit generated assets. Retain approved design contracts and redacted QA reports as durable history.
