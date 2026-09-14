---
schema_version: 1
id: storefront-design-director-implementation-handoff-template
title: Implementation Handoff Template
type: design-job-template
status: active
summary: Provides the complete approved design and architecture contract for bounded Codex implementation.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - implementation-handoff
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/implementation-handoff.md
related_docs:
  - .agents/skills/storefront-design-director/references/code-ownership-and-handoff.md
tags:
  - template
keywords:
  - codex
  - handoff
---

# Implementation Handoff

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 4
Artifact status: approved

## Identity and approved references

- Product: Only Bundles storefront widgets; FPB and PPB.
- Surfaces: FPB Standard, Classic, Compact, Horizontal cards and product-details overlay; PPB Grid, List, Horizontal Slots, Vertical Slots cards/picker.
- Approved direction: Direction A — Adaptive intrinsic matrix, approved by the user on 2026-09-11.
- Approved reference: `direction-comparison.md`. Current screenshot evidence in `screenshot-inventory.yaml` is structural context only and must not be used as exact selector geometry.
- Revision: 3. This user-authorized revision extends Direction A to FPB category modes and stable internal product-card regions.

## Source-of-truth priority

1. Existing product and business semantics.
2. Repository AGENTS.md and architecture.
3. Approved interaction, state, responsive, and accessibility contracts.
4. Approved standalone prototype, when present; none is applicable here.
5. Design tokens and geometry.
6. Approved reference images for visual nuance; none is an exact selector reference in revision 1.

## Goal

Redesign existing FPB and PPB variant selectors inside every product-card shape and existing product modal/picker so dropdowns, pills, color swatches, and image swatches remain readable, directly reachable, and contained on desktop and mobile. Use the existing category setting for both families. For FPB products with more than one option dimension, keep one primary or canonical visual dimension visible and render additional dimensions as labeled native selects; preserve complete-variant dropdown mode. Give media, identity, price, selector, and action their own stable regions. Preserve Shopify variant semantics and every adjacent card action, and verify iteratively in the Agent store through direct Chrome DevTools.

## Non-goals

- Adding a new persistence model or parallel swatch source.
- Changing Shopify product, option, variant, swatch, inventory, price, market, or cart semantics.
- Inferring color/image swatches or restoring legacy maps/fallbacks.
- Adding a new product-details modal, popover, selector rail, save path, data model, endpoint, or compatibility layer.
- Redesigning product media, product cards, sticky summaries, bundle navigation, discounts, checkout, or theme CSS beyond selector accommodation.
- Deploying the app; SIT and production deploys remain manual.

## Current architecture map

- FPB shared selector behavior and DOM: `apps/OnlyBundles-app/app/assets/widgets/shared/variant-selector.ts`.
- FPB card composition/event delegation: `full-page/methods/product-card-footer-methods.ts`.
- FPB details overlay composition/event delegation: `full-page/methods/modal-product-methods.ts`.
- PPB mode validation, Shopify swatch resolution, selector DOM, semantics, tooltip, and callback: `product-page/variant-selector-modes.ts`.
- PPB in-page placement: `product-page/methods/inpage-render-methods.ts`.
- PPB slot-picker placement: `product-page/methods/modal-methods.ts`.
- PPB shared selector presentation: `product-page-css/base/variant-selector-modes.css`.
- PPB template placement/density: `product-page-css/templates/inpage-grid.css`, `inpage-cascade.css`, and `modal-slots.css`.
- FPB presentation: existing Standard, Classic, Compact, and Horizontal raw CSS owners under `full-page-css/templates/`.
- Generated deploy assets: `extensions/bundle-builder/assets/`; never edit them directly.
- God-node/downstream risk: storefront bundle runtime, shared product-card composition, variant selection, price/inventory refresh, modal/drawer lifecycle, sticky cart actions, and all eight templates.

## Exact component anatomy

Implement `component-anatomy.md` exactly. Each option dimension owns a visible label and one selector group; cards/modals own placement only; family selector owners own state, semantics, and events; template CSS owns density only; sticky footers and modal/drawer scroll remain independent.

## Required states

Implement all `VS-01` through `VS-22` in `state-matrix.md`. Critical states are single/multiple variants, every PPB mode, mapped/missing swatches, selected/pressed/focus, mixed/all unavailable, long/many values, multiple dimensions, adjacent controls, FPB modal/drawer, PPB picker, high zoom, reduced motion, and PPB fail-closed hydration.

## Responsive transformations

Follow `responsive-contract.md`: intrinsic wrapping, compact multi-dimensional PPB rows, full-width native selects, no selector-owned scroller, no hidden values, no reduced hit targets, no duplicate responsive trees, existing FPB 799/800 container boundary, PPB 767/768 and Grid 479/480 boundaries, and unchanged sticky/modal safe areas. A compact swatch visual stays centered inside a 44px target. Final proof requires actual 390x844 and 1280x800 Chrome windows.

## Interaction contract

Follow `interaction-contract.md`. A selector activation fires exactly one variant update and cannot bubble into card Add/details behavior. Existing image, price, compare-at price, inventory, quantity clamp, selected summary, and Add eligibility update through current owners. Unavailable values never mutate state.

## Accessibility contract

Follow `accessibility-checklist.md`: visible labels, native select semantics for native dropdowns, one named radio group per non-dropdown option dimension, unique instance-scoped IDs/names, visible unclipped focus, persistent selected text for swatches, color-independent state, 44px targets, keyboard completion, focus preservation/restoration, high zoom, and reduced motion.

## Tokens and merchant-configurable values

Use revision 2 of `design-tokens.json`. Reuse existing merchant selector border/background/text/radius and primary-action variables. Shopify `ProductOptionValue.swatch` is the only runtime visual input. In multi-dimensional color/image-swatch mode, a dimension with no canonical swatch of the requested kind resolves to the existing native select presentation; it never guesses a color or reuses a variant product image. Static layout belongs in raw CSS. Unmeasured density values remain recommendations to tune through Chrome evidence; do not hard-code captured store geometry.

## Content fixtures

Use every browser-required case in revision 2 of `content-stress-cases.yaml`, including twelve values, the Agent-store Black Crew Neck T-Shirt with seven Size values by four Color values, mixed availability, canonical/missing color and image swatches, long values, long product identity, wide currency, compare-at price, quantity 12, duplicate instances, and hydration failure. Persist the fixture through the normal Admin save flow and prove it survives an Admin hard reload before trusting preview evidence.

## Allowed production areas

- The six canonical source owners listed in Current architecture map, but composition files only when placement/event isolation actually requires it.
- Raw FPB template CSS under `app/assets/widgets/full-page-css/templates/` and the existing shared FPB selector CSS owner discovered from imports.
- Raw PPB selector and three template CSS files listed above; remove contradictory generic selector presentation from `discount-footer-shared.css` or `modal-product-grid.css` only when proven to conflict.
- Focused selector behavior tests under `apps/OnlyBundles-app/tests/unit/assets/` and a mandatory new `apps/OnlyBundles-app/test-spec/storefront-variant-selector-redesign.spec.md` created before implementation.
- `internal docs/Architecture/Widget Architecture.md` and `Product Card Layout Contract.md` only for durable architecture changes, preserving ordered frontmatter and setting `last_audited: 2026-09-11`.
- `scripts/build-storefront.mjs` only for the required MINOR `WIDGET_VERSION` bump immediately before release-candidate generated assets are built.
- Generated full-page/product-page JS and CSS assets only through build/minification commands.

## Prohibited changes

- Prisma, routes, loaders/actions, Admin controls, Storefront queries, app proxy, pricing, cart payloads, checkout, or unrelated card/summary styling.
- A new selector component, generic cross-widget engine, service locator, compatibility alias, legacy read, swatch inference, runtime static-style injection, one-line horizontal option rail, `+N` hiding control, nested selector scroller, or new modal/popover.
- Editing minified/generated extension assets by hand.
- Unit tests that read CSS/source and assert classes, properties, selectors, order, placement, or pixels.
- Starting `npm run dev`, running Shopify deploy, mutating Prisma directly, using a tunnel URL in Chrome, or testing a store other than the Agent store.
- Committing Chrome screenshots, signed preview URLs, tokens, network bodies, `test-report.json`, or unrelated dirty files.

## Test commands discovered from repository

1. Create the test spec, then add failing behavior tests to existing selector suites or a focused `storefront-variant-selector-redesign.test.ts`.
2. Focused tests: `npx ts-node tests/test-runner.ts unit/assets/ppb-variant-selector-modes.test.ts unit/assets/fpb-horizontal-grouped-variant-selector.test.ts unit/assets/fpb-variant-selector-disabled.test.ts` from `apps/OnlyBundles-app`, plus the new test.
3. Full unit suite: `npm run test:unit`.
4. Raw JS syntax: `node --check` on each modified widget JS source.
5. Typecheck: `npm run typecheck`.
6. Modified-file ESLint: `npx eslint --max-warnings 9999 <modified TS files>`.
7. Build: `npm run build:widgets` and `npm run minify:assets css` after source changes.
8. Repository checks: `git diff --check`, focused/full relevant suites, `npm run graphify:rebuild`, and Knip after confirming its repaired command/config.
9. Do not deploy. Provide the manual SIT deploy command only after all local and Chrome gates pass.

## Chrome DevTools QA plan

- Use `browser-test-plan.yaml` and direct Chrome DevTools only in the connected default profile.
- Deterministic entry is the Agent-store Shopify Admin configure URL. Generate every signed storefront URL through its current Preview Bundle action; never reuse an expired URL or open the tunnel directly.
- Preflight output: `qa/preflight.json`. Clear Cache Storage, hard reload with `ignoreCache: true`, wait for fonts/images/hydration/target state, record actual viewport and element geometry, and capture only storefront pixels.
- Required windows: 1280x800 and an actually achieved 390x844 at 100% zoom, plus critical boundaries and 200% zoom. A tool-enforced 580px width is a blocker for the 390 case, not a substitute.
- Cover all eight designs, FPB card/modal/drawer, PPB in-page/picker, every PPB mode, long/many/multi-dimensional/unavailable/missing-swatch states, keyboard/focus, sticky actions, fail-closed hydration, console/network, Lighthouse, performance, and non-regression.
- Store PNGs and results only under the design job's `qa/`; never commit screenshots. Use no masks unless the user explicitly approves a positive rectangle that covers no tested assertion.
- Maximum retries: two per case, append-only. Resolve failures at the canonical owner and rerun the affected case plus opposite-viewport and sibling-template non-regression.

## Acceptance criteria

All independently testable requirements in `acceptance-criteria.md` pass. In particular: every option remains directly reachable; there is no selector/card/page overflow or clipping; card geometry is stable across interaction states; same-row cards remain equal height; sticky actions and modal controls remain unobstructed; current data/events are preserved; accessibility passes; generated assets reflect sources; and all eight templates pass desktop/mobile Chrome QA.

## Stopping criteria

- Stop before production changes if the handoff validator or explicit handoff approval is missing.
- Stop and report if the normal Admin save flow cannot persist a multi-variant fixture after a hard reload; do not seed Prisma or add a persistence workaround under this task.
- Stop if Direction A requires a new business behavior, data source, modal, API, or selector mode.
- Stop if direct Chrome DevTools cannot achieve required access or actual 390x844; do not substitute another browser/emulation tool.
- Stop before any deploy and provide the manual SIT command.

## Expected final report format

Report task-owned source/test/doc/generated files; exact tests, lint, typecheck, build, minification, Graphify, Knip, and diff results; Agent-store routes/fixtures and Chrome case IDs; actual viewport and selector/card/modal geometry; accessibility/console/network/Lighthouse/performance evidence; remaining differences/blockers; unrelated dirty files preserved; widget version; and rollback paths.

## Unresolved risks

- Current PPB Admin fixture additions showed “Bundle not saved” and did not survive hard reload. This may be transient or an upstream save regression, but it blocks trustworthy multi-variant PPB evidence until reverified.
- Existing FPB selector behavior caps four primary values behind `+N`; Direction A requires direct normal-flow access and may expose latent combination/focus bugs.
- Current PPB flex wrapping may still collide with template-specific width/placement rules; remove ownership conflicts instead of escalating specificity.
- The connected Chrome session previously enforced a 580px inner-width minimum after requesting 390x844.
- No approved target raster exists; exact cosmetic tuning must stay within existing merchant/template language and be evidenced iteratively.

## Rollback guidance

Revert only task-owned selector source/CSS/tests/docs and regenerate widget assets from the preceding widget version. Do not reset the worktree or discard unrelated changes. If Chrome finds a template regression, revert the smallest template-density slice while retaining shared behavior only when its full sibling matrix remains green. If the release candidate was manually deployed, use the repository's prior committed generated assets and a new manual deploy; never edit Shopify CDN assets directly.
