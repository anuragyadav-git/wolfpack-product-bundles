---
schema_version: 1
id: fpb-three-preset-implementation-handoff
title: FPB Four-Template Alignment Implementation Handoff
type: design-job-artifact
status: approved
summary: Provides the bounded preset-CSS implementation and direct Chrome QA contract for four-template alignment remediation.
last_audited: 2026-09-03
owners:
  - Aditya Awasthi
domains:
  - implementation-handoff
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page-css/templates/classic
  - app/assets/widgets/full-page-css/templates/standard/overrides.css
  - app/assets/widgets/full-page-css/templates/compact/overrides.css
  - app/assets/widgets/full-page-css/templates/horizontal/overrides.css
related_docs:
  - locked-decisions.yaml
  - browser-test-plan.yaml
tags:
  - fpb
  - css
keywords:
  - Classic
  - Compact
  - Horizontal
---

# Implementation Handoff

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 4
Artifact status: approved

## Identity and approved references

Implement ST-R4 first, then verify CL-A, CO-A, and HO-A in Standard → Classic → Compact → Horizontal order. References are `locked-decisions.yaml`, `direction-comparison.md`, `visual-audit.md`, and the C01-C15 ledger at `docs/competitor-analysis/fpb-feature-to-storefront-matrix.md`.

## Source-of-truth priority

1. Existing product and business semantics.
2. Repository AGENTS.md and `internal docs/Architecture/Product Card Layout Contract.md`.
3. Approved interaction, state, responsive, and accessibility contracts.
4. Design tokens and geometry.
5. Approved live-reference evidence for visual nuance.

## Goal

Remove measured state-dependent price/action movement across Standard, Classic, and Compact using only each preset's raw CSS. Recheck Horizontal and every shared widget surface, but edit them only if direct Chrome evidence reproduces a placement defect.

## Non-goals

No visual redesign; no unmeasured shared-surface cleanup; no renderer, grid-method, runtime, data, copy, API, schema, persistence, filtering, pagination, pricing calculation, validation, or cart-flow changes; no new settings, abstraction, override layer, `!important`, or runtime styling.

## Current architecture map

The app embed loads the shared full-page foundation and the active preset entrypoint last. Shared runtime renders one stable product-card DOM and owns all events/state. Shared responsive CSS owns shell gutters, summary-mode switching, general grid caps, sticky surfaces, and bounded vertical media. Preset CSS owns only visual treatment and explicitly documented preset anatomy.

## Exact component anatomy

Use the existing `.product-card` with `.product-image`, `.product-content-wrapper`, `.product-text-container`, optional variant row/selector, `.product-card-price-action`, price row, and add-or-quantity action. Classic and Compact stay vertical image-first. Horizontal stays 30/70 media/content with copy above price/action. See `component-anatomy.md`.

## Required states

Default, hover/focus, selected quantity, sale price, long title, mixed media, variant, unavailable, and disabled. Every state preserves equal card height within its row and produces zero card-height change on hover, focus, selection, quantity, or variant transitions.

## Responsive transformations

Standard and Compact cap at three intrinsic columns, Classic at four, and Horizontal at two. Existing mobile transformations remain authoritative. Test 1440x900, 1280x800, 768x1024, 390x844, 360x800 plus 799/800/801 container boundaries. No captured card width becomes a layout constant.

## Interaction contract

Preserve the current details, add, quantity, variant, unavailable, validation, and selection flows. Add swaps immediately to quantity controls without animation or geometry change. One activation causes one update. See `interaction-contract.md`.

## Accessibility contract

Keep existing semantics, names, exposed state, DOM focus order, minimum 44px control targets, keyboard operation, announcements, and reduced-motion behavior. Focus must be visible and unclipped on every surface. See `accessibility-checklist.md`.

## Tokens and merchant-configurable values

Reuse existing merchant card background, border color, text color, title size, spacing, padding, and radius tokens. Use the existing control-hit-target and 800px container boundary. The approved frame is a one-pixel primitive using the merchant/theme border color. Add no merchant setting or fixed captured geometry. See `design-tokens.json`.

## Content fixtures

Use the shared EB/Wolfpack fixture with only the active preset changed. Carry compatible fixture state forward. Required stresses include two-line long title, short title, high/wide price, sale price, long/multiple variants, unavailable option, portrait/landscape media, quantity one and ten-plus, zero/many selections, and existing validation error. See `content-stress-cases.yaml`.

## Allowed production areas

- Classic slice: `app/assets/widgets/full-page-css/templates/classic/base.css`, `desktop-products.css`, and `mobile.css`, only where the existing product-card presentation requires it.
- Compact slice: `app/assets/widgets/full-page-css/templates/compact/overrides.css`.
- Horizontal slice: `app/assets/widgets/full-page-css/templates/horizontal/overrides.css`.
- Generated output from `npm run minify:assets css`.
- One PATCH change to `WIDGET_VERSION` immediately before the eventual widget deployment only; do not deploy.

## Prohibited changes

Allowed initial owners are `templates/standard/overrides.css`, `templates/classic/desktop-products.css`, `templates/classic/mobile.css`, and `templates/compact/overrides.css`. Do not edit shared CSS, Horizontal CSS, entrypoint composition, renderer, JavaScript, Liquid, APIs, schema, data, copy, or settings without new measured evidence. Stop and re-scope under TDD if CSS and existing DOM cannot express the correction.

## Test commands discovered from repository

CSS-only slices require no styling unit tests or test-spec file. After each preset run `npm run minify:assets css` (includes Shopify 100,000-byte CSS asset gate), `git diff --check`, and `npm run graphify:rebuild`. Before each commit confirm no ESLint-applicable source was modified; if one was, run `npx eslint --max-warnings 9999 <files>`. Audit hook-generated diffs and commit only the current preset slice plus its generated CSS and durable job updates.

## Chrome DevTools QA plan

Use only direct Chrome DevTools MCP in the connected default profile against the recorded staging storefront. Before each evidence pass clear Cache Storage where available and reload with cache bypass, then confirm runtime preset and active base/preset stylesheet. Execute `browser-test-plan.yaml`: all five widths; 799/800/801 boundary; mouse, touch, and keyboard flows; nine states; screenshots; computed geometry; accessibility tree; console and network; desktop/mobile Lighthouse; layout-shift traces; and frozen Standard smoke after each slice. Keep raw screenshots/evidence under the job `qa/` directory or `/private/tmp` when Chrome permits; never commit investigation screenshots.

## Acceptance criteria

All criteria in `acceptance-criteria.md` pass in the final four-template regression. Price, action-envelope, and surrounding row rectangles must have zero state delta at a fixed viewport. No horizontal overflow, clipping, sticky overlap, unstable rows, new app-owned console errors, failed widget requests, or unintended shared-surface change is allowed.

## Stopping criteria

Stop for missing handoff approval, unavailable direct Chrome DevTools MCP, inability to save required evidence, contaminated fixture state, a requirement for shared/Standard/JS changes, semantic conflict, or any unapproved visual decision. Do not substitute browser tooling or widen scope.

## Expected final report format

Report each preset commit, raw and generated files, minifier/size gate, diff check, graph rebuild, exact Chrome cases and evidence, frozen-Standard smoke, remaining differences, blockers, and rollback. State explicitly that no deployment was run.

## Unresolved risks

The prior Chrome session rendered screenshots but rejected persisted `filePath`; strict QA preflight must prove writable PNG capture before implementation verification. Merchant color combinations may expose contrast issues. Horizontal 800px boundary and long variants require focused testing.

## Rollback guidance

Revert each preset commit independently in reverse order. Because behavior, DOM, data, and shared CSS remain untouched, rollback should restore only that preset's raw declarations and regenerated minified asset. Do not use destructive Git commands.
