---
schema_version: 1
id: ppb-selected-slot-redesign-implementation-handoff
title: PPB Selected Slot Redesign Implementation Handoff
type: implementation-handoff
status: complete
summary: Provides the approved Direction A architecture, state, responsive, interaction, and QA contract for PPB selected slots.
last_audited: 2026-08-21
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - app/assets/widgets/product-page/methods/inpage-render-methods.ts
  - app/assets/widgets/product-page-css/templates/modal-slots.css
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/direction-comparison.md
tags:
  - ppb
  - handoff
keywords:
  - selected-slot
  - implementation
---

# Implementation Handoff

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 2
Artifact status: approved

## Identity and approved references

- Approved direction: Direction A — Quiet Product Tile.
- Approved contracts: component anatomy, state matrix, responsive contract, interaction contract, accessibility checklist, design tokens, and content stress cases.
- EB evidence is structural inspiration only. It does not authorize copied dimensions, code, selectors, or runtime names.

## Source-of-truth priority

1. Existing product, pricing, capacity, persistence, replacement, removal, and cart semantics.
2. Repository AGENTS.md and internal architecture.
3. Approved state, responsive, interaction, and accessibility contracts in this design job.
4. Approved Direction A hierarchy.
5. Approved design tokens and content-stress fixtures.
6. EB evidence for visual nuance only.

## Goal

Redesign the selected state of PPB Horizontal Slots and Vertical Slots into one responsive product-led system. Horizontal renders readable equal-height tiles; Vertical renders compact full-width rows. Both expose product identity, optional variant, payable price, available compare-at price, exact replacement, and one remove action.

## Non-goals

- Product Grid or Product List cards and selected summaries.
- Picker product-card redesign or quantity-selector behavior.
- Pricing, discount, validation, capacity, persistence, step navigation, or cart changes.
- Merchant settings, APIs, Prisma, Liquid configuration, or translations.
- FPB presentation.
- A new slot runtime, component family, overlay, or compatibility layer.

## Current architecture map

- Render and event owner: app/assets/widgets/product-page/methods/inpage-render-methods.ts.
- Orientation/empty-slot owner: app/assets/widgets/product-page/templates/modal-slot-template.ts.
- Template presentation owner: app/assets/widgets/product-page-css/templates/modal-slots.css.
- Shared primitive owner: app/assets/widgets/product-page-css/base/slot-cards-default-products.css.
- Generated widget assets are built through npm run build:widgets.
- Generated CSS is produced through npm run minify:assets css.
- Graph community: shared storefront widget modules and PPB modal-slot template registry. The product-page widget is a high-blast-radius shared node; keep behavioral edits narrowly inside selected-slot rendering.

## Exact component anatomy

Use component-anatomy.md. One semantic tree serves both orientations:

- filled instance wrapper and exact replacement action;
- product media;
- title and optional resolved variant;
- payable and conditional compare-at price group;
- conditional included/unavailable status;
- independent semantic remove action;
- existing empty slot with saved label/number.

The renderer currently omits variant and price. Add only the conditional markup needed to expose existing data. Do not recalculate pricing or create a parallel formatter.

## Required states

Use every required state in state-matrix.md, especially:

- empty reachable and ordinary filled;
- focus-visible and keyboard activation;
- long title/variant;
- discounted and compare-at;
- missing/slow image;
- restored unavailable;
- default included;
- minimum trailing empty and exact full;
- loading, removal recovery, reduced motion, and high zoom.

## Responsive transformations

- Horizontal: auto-fit/minmax-style intrinsic columns using one semantic minimum-tile token; equal-height auto rows; reduce columns before content collision.
- Vertical: one full-width content-driven row at every viewport.
- The widget/container width, not viewport width, determines Horizontal columns.
- Selected and empty outer geometry is equal within an orientation.
- No fixed 200px card height.
- Slot anatomy does not change across the existing 767/768 picker boundary.
- Verify 320x700, 390x844, 767x900, 768x900, and 1280x800.

## Interaction contract

- Filled replacement activates the exact clicked instance.
- Remove stops replacement activation and removes only the clicked instance.
- Empty activation opens the picker with no replacement target.
- Enter and Space complete every action.
- Picker dismissal returns focus to the exact invoking slot.
- After removal, focus resolves to same-index empty, next slot, previous slot, then step heading.
- No slot quantity selector is introduced.

## Accessibility contract

- Do not create invalid nested button semantics.
- Replacement and remove have distinct names and focus stops.
- Interactive targets are at least 44px.
- Focus is visible, unclipped, and merchant-token-aware.
- Truncated visual text does not truncate the accessible identity.
- Selection/status is not color-only.
- High zoom grows vertically without horizontal scrolling.
- Reduced motion removes decorative transitions.

## Tokens and merchant-configurable values

- Reuse existing bundle surface, border, typography, muted-text, price, focus, and primary merchant tokens.
- Add only selected-slot aliases listed in design-tokens.json.
- Hairline border and 44px target are fixed primitives.
- Spacing, card block size, radius, and column geometry are responsive/content-driven.
- No hardcoded merchant color and no new merchant setting.

## Content fixtures

Use content-stress-cases.yaml. Required fixtures include long title, long variant, compare-at, wide currency, missing image, multi-selection, restored unavailable, zero selection, loading, and validation recovery.

## Allowed production areas

- app/assets/widgets/product-page/methods/inpage-render-methods.ts: selected-slot semantic markup only.
- app/assets/widgets/product-page-css/templates/modal-slots.css: PPB modal-slot presentation.
- Existing focused PPB selected-slot behavior tests.
- test-spec/ppb-selected-slot-redesign.spec.md.
- scripts/build-storefront.mjs: version-only bump to 12.2.0 if this is the next available minor version at implementation time.
- Generated widget/CSS assets produced by required build commands.
- Relevant Product Card Layout Contract or Widget Architecture note only if implementation changes durable ownership beyond what is already documented.

## Prohibited changes

- Selection quantities, validation conditions, replacement keys, persistence storage, cart payloads, pricing/discount calculation, or configuration loading.
- FPB files or FPB selectors.
- Product Grid/List renderers or picker product-card quantity behavior.
- Runtime style injection, inline presentation styles, important declarations, copied EB measurements, legacy fallbacks, or new storefront copy.
- New public fields, merchant settings, API routes, database changes, or deployment.

## Test commands discovered from repository

1. Add test-spec/ppb-selected-slot-redesign.spec.md before implementation.
2. Add behavior tests before renderer changes; do not assert CSS, class names, source order, or visual placement.
3. Run focused existing tests:
   - tests/unit/assets/ppb-vertical-filled-row.test.ts
   - tests/unit/assets/ppb-modal-slot-keyboard-access.test.ts
   - tests/unit/assets/ppb-modal-slot-selection-refresh.test.ts
   - tests/unit/assets/ppb-horizontal-slots-empty-placeholders.test.ts
   - tests/unit/assets/ppb-vertical-slots-shared-shell.test.ts
4. Run node --check on each modified raw widget JS file when applicable.
5. Run npx eslint --max-warnings 9999 on every modified source/test file.
6. Run npm run build:widgets.
7. Run npm run minify:assets css.
8. Run npm run graphify:rebuild after code changes.
9. Run git diff --check.

## Chrome DevTools QA plan

Use browser-test-plan.yaml with direct Chrome DevTools MCP in the connected default profile.

- Environment: development agent store.
- Route: https://agent-5sfidg3m.myshopify.com/products/ppb-template-parity-2026-08-20
- Fixture bundle: cmt1l6lt50000v0tlyp73d2ml.
- Clear Cache Storage and hard reload with ignoreCache before each fixture group.
- Carry compatible selection state Horizontal → Vertical; restore Product Grid only at the fixture-group boundary.
- Record served widget version and asset URL before trusting visual evidence.
- Capture accessibility-tree, semantic, geometry, viewport/element PNG, console, network, Lighthouse, performance trace, and non-regression evidence.
- Never use a browser wrapper or alternate profile.

## Acceptance criteria

Use acceptance-criteria.md. All criteria are mandatory unless a waiver records reason, approver, and timestamp.

## Stopping criteria

Stop and report when:

- required product/variant/price data is absent from the existing selected item and exposing it would require a new public contract;
- a change would alter selection, price, capacity, persistence, cart, FPB, or protected configuration loading;
- the agent-store fixture cannot be safely restored;
- direct Chrome DevTools MCP, the provided dev environment, or required signed-in state is unavailable;
- a responsive/design decision outside this approved contract is required.

## Expected final report format

- Source and generated files changed.
- Behavior tests, lint, syntax, builds, Graphify, and diff checks.
- Chrome evidence by viewport/state, served version, overflow, focus, console, network, Lighthouse, and performance.
- Fixture restoration result.
- Remaining differences or blockers.
- Commit batches and rollback points.

## Unresolved risks

- Existing selected item data must be inspected before assuming variant and compare-at fields.
- Current selected-slot wrapper semantics must stay valid when remove remains independent.
- Merchant theme typography and product-column widths may change intrinsic column count.
- Live CDN may serve a stale version until the normal user-controlled deployment/sync cycle occurs.

## Rollback guidance

Revert the selected-slot renderer markup, modal-slots source CSS, focused tests, version bump, and generated assets as one coherent batch. Do not reset unrelated work. Restore the development fixture to Product Grid and hard reload to confirm the original storefront state.
