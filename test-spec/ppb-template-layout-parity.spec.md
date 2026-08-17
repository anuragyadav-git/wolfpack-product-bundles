---
schema_version: 1
id: ppb-template-layout-parity
title: Product Page Bundle Template Layout Parity
type: test-spec
status: in-progress
summary: Verifies responsive layout behavior for all four Product Page Bundle storefront designs.
last_audited: 2026-08-15
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-bundle-widget
source_paths:
  - app/assets/widgets/product-page
  - app/assets/widgets/product-page/templates
  - app/assets/widgets/shared
related_docs:
  - docs/issues-prod/product-page-bundle-template-fixture-spec.md
  - docs/competitor-analysis/16-eb-full-data-flow-investigation.md
tags:
  - ppb
  - templates
keywords:
  - Product Page Bundle
  - layout parity
---

# Test Spec: Product Page Bundle Template Layout Parity

**Spec ID:** ppb-template-layout-parity

**Fixture:** [Product Page Bundle Template Fixture Specification](../docs/issues-prod/product-page-bundle-template-fixture-spec.md)

**Created:** 2026-08-14

## Purpose
Verify PPB storefront layout and interaction behavior for all four template contracts (`CASCADE`, `COGNIVE`, `MODAL`, `SIMPLIFIED`) against EB parity, using direct viewport proof and stateful behavior matrices.

## Shared Gates
- Contracts must resolve through PPB registry to canonical contracts:
  - `PDP_INPAGE + CASCADE` -> LIST
  - `PDP_INPAGE + COGNIVE` -> GRID
  - `PDP_MODAL + MODAL` -> HORIZONTAL_SLOTS
  - `PDP_MODAL + SIMPLIFIED` -> VERTICAL_SLOTS
- Runtime markers must exist consistently:
  - `data-ppb-template-type`, `data-ppb-design-preset`, `data-ppb-template-id`
  - `template-id`, `template-type`
  - `wpbmix-template-type`, `wpbmix-template-id`

## Test Cases
### Fixture contracts and targets

- Base fixture: `cmpzr5n3s0000v0glfwuklzgd` (`docs/issues-prod/product-page-bundle-template-fixture-spec.md`).
- Storefront target: `https://agent-5sfidg3m.myshopify.com/products/wpb-fresh-ppb-template-parity-2026-06-04-97524`
- All scenarios switch contracts on the same bundle (`PDP_INPAGE|COGNIVE|MODAL|SIMPLIFIED`) and revalidate runtime markers/persistence after each switch.

### Product Page Template Layout
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Contract resolve smoke | Any viewport, template contract pair `PDP_INPAGE|PDP_MODAL` + preset | Marker/model contract pair resolves to LIST/GRID/HORIZONTAL_SLOTS/VERTICAL_SLOTS with no fallback drift | No UI edits without this check |
| 2 | Product List desktop | 1280×800, `PDP_INPAGE + CASCADE`, multi-step categories | In-page rows, step flow, selected drawer, and footer layout align to EB baseline | Includes sold-out, compare-at, and empty-state behavior |
| 3 | Product List mobile | 390×844, same contract as case 2 | No overflow and stable row controls; same selection/compare-at semantics in narrow placement | Includes restore-after-reload behavior |
| 4 | Product Grid desktop | 1280×800, `PDP_INPAGE + COGNIVE`, multi-category fixture | Grid card structure, equal-height geometry, and cascade header flow remain aligned with EB references | Includes grouped variants and one-variant-only cases |
| 5 | Product Grid mobile | 390×844, same contract as case 4 | Compact card stack and two-column behavior on permitted host widths; no geometry clipping or overlap | Includes variant selection restore edge case |
| 6 | Horizontal Slots desktop | 1280×800, `PDP_MODAL + MODAL`, slot-filled fixture | Horizontal slot rail, modal trigger, replacement/removal and bottom-sheet behavior align to EB | `slots.orientation` remains horizontal |
| 7 | Horizontal Slots mobile | 390×844, same contract as case 6 | Slot cards and modal controls remain touch-target correct, no wrap overflow, same CTA progression | Includes open-picker replacement and remove |
| 8 | Vertical Slots desktop | 1280×800, `PDP_MODAL + SIMPLIFIED`, slot-filled fixture | Vertical slot rail and filled-slot rows align with EB; one-column slot presentation only | Validate against the same interaction sequence as horizontal lane |
| 9 | Vertical Slots mobile | 390×844, same contract as case 8 | No clipping/overlap and no shared-state divergence versus Horizontal Slots | Includes remove and replace actions |
| 10 | Cross-template persistence | Same bundle switching contracts and hard-reload | Selected state persists and restores identically across contract boundaries | Detects accidental state source duplication |
| 11 | Card component parity | All templates, product cards with variant image, compare-at, and sold-out states | Shared card behavior applies: `renderSharedProductCard` modes match contract and product-level controls remain correct | Includes one-quantity-limit and multi-quantity controls |
| 12 | Runtime resilience | All contracts under loading/empty/error paths | Existing fallback states remain unchanged (loader, no-products, modal retry) while preserving contract markers | No behavior regressions in non-visual branches |

## Acceptance Criteria
- [x] Shared contract + marker smoke pass for all four contracts (unit test gate: `ppb-template-markers-and-preset-resolve.test.ts` + `ppb-template-design-preset-resolution.test.ts`).
- [x] PPB unit parity suite passes (`npx jest tests/unit/assets/ppb-*.test.ts`, 37 suites, 204 tests).
- [ ] Desktop scenarios pass for Product List/Grid and Slots with parity evidence.
- [ ] Mobile scenarios pass for Product List/Grid and Slots with parity evidence.
- [ ] Cross-template persistence (scenario 10) passes with no state-shape changes.
- [ ] Product card parity scenario passes for variant, compare-at, sold-out, and replacement flows.
- [ ] Runtime resilience scenario (12) keeps existing fallback/loading/error behavior for all templates.
- [ ] Direct Chrome DevTools evidence attached at 1280×800 and 390×844 for each lane.

## Current Verification Status
- Automated gates (pass): preset resolution, marker contract, product-card control behavior, product-grid/list interactions, modal placeholders, empty slots, variant restoration, PPB session/persistence behavior, and PPB bundle init contract test.
  - `tests/unit/assets/ppb-template-design-preset-resolution.test.ts`
  - `tests/unit/assets/ppb-template-markers-and-preset-resolve.test.ts`
  - `tests/unit/assets/ppb-product-page-card-controls.test.ts`
  - `tests/unit/assets/ppb-product-grid-interaction-parity.test.ts`
  - `tests/unit/assets/ppb-horizontal-slots-empty-placeholders.test.ts`
  - `tests/unit/assets/ppb-list-shared-card.test.ts`
  - `tests/unit/assets/ppb-vertical-slots-shared-shell.test.ts`
  - `tests/unit/assets/bundle-widget-product-page-init.test.ts`
  - `npx jest tests/unit/assets/ppb-*.test.ts` (37 suites, 203 tests)
- Manual parity gates (pending): explicit viewport and fixture evidence for scenarios 2–12 via Chrome DevTools.
  - Historical reference used for baseline deltas: `docs/refactor/full-page-and-product-page-template-baseline-matrix.md` (historical captures from 2026-06-11; not a replacement for post-change evidence).
  - Current blocker: authenticated storefront fixture automation path is not currently available in this environment.

## Implementation gate plan

- Gate A: Contract and marker validation can ship only with all of these passing:
  - [x] `ppb-template-markers-and-preset-resolve.test.ts`
  - [x] `ppb-template-design-preset-resolution.test.ts`
- Gate B: Template UI behavior and parity requires live evidence, per scenario matrix below:
  - All lanes must have desktop and mobile `take_screenshot` evidence.
  - All lanes must have computed-style snapshots for critical elements (container, card, CTA, modal) at both viewports.
  - All lanes must include state transition logs for selection/reload/replacement flows.
- Gate C: Product card and selected-state gates remain blocked until parity evidence confirms:
  - variant compare-at behavior
  - sold-out disabled state
  - shared payload after restore/replacement
- Gate D: Release completion only after 100% manual matrix entries are checked and blockers cleared.

## Evidence Capture Matrix (Pending)

| Scenario | Template | Viewport | Required artifacts | Status |
|---|---|---|---|---|
| 2 | Product List | 1280×800 | screenshot + computed styles + selection/reload trace | [ ] pending |
| 2b | Product List | 390×844 | screenshot + computed styles + selection/reload trace | [ ] pending |
| 3 | Product Grid | 1280×800 | screenshot + computed styles + slot-capacity/selection trace | [ ] pending |
| 3b | Product Grid | 390×844 | screenshot + computed styles + slot-capacity/selection trace | [ ] pending |
| 4 | Horizontal Slots | 1280×800 | screenshot + modal interaction log + computed styles + replace/remove trace | [ ] pending |
| 4b | Horizontal Slots | 390×844 | screenshot + modal interaction log + computed styles + replace/remove trace | [ ] pending |
| 5 | Vertical Slots | 1280×800 | screenshot + modal interaction log + computed styles + replace/remove trace | [ ] pending |
| 5b | Vertical Slots | 390×844 | screenshot + modal interaction log + computed styles + replace/remove trace | [ ] pending |
| 6 | Cross-template persistence & restore | 390×844 + 1280×800 | hard-reload trace + persisted payload diff | [ ] pending |
| 7 | Runtime load/error resilience | 390×844 + 1280×800 | console logs + retry/fallback traces | [ ] pending |

## Guardrails (required fail-fast criteria)

Fail a run immediately if any of these conditions occur:

- Contract contract mismatch: `PDP_INPAGE` renders any slot-only template or `PDP_MODAL` renders in-page contract behavior.
- Missing runtime markers: any test path lacks `data-ppb-template-type`, `data-ppb-template-id`, or `wpbmix-template-*`.
- Product card variant mismatch: List/Grid uses a non-mapped `renderSharedProductCard` variant mode.
- Selection divergence: cart/add payload, selection IDs, or restore shape differs across template lanes.
- Layout regression: overflow clipping, duplicated scroll regions, or unavailable CTA in required viewport snapshots.
- Accessibility break: broken keyboard flow or empty accessible name for CTA/action targets.
- Evidence gap: unresolved pending matrix entries for required desktop/mobile scenarios.
