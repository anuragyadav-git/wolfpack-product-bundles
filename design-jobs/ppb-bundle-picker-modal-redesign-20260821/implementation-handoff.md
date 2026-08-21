---
schema_version: 1
id: storefront-design-director-implementation-handoff-template
title: Implementation Handoff Template
type: design-job-template
status: active
summary: Provides the complete approved design and architecture contract for bounded Codex implementation.
last_audited: 2026-08-21
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

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 6
Artifact status: approved

## Identity and approved references

PPB Horizontal Slots and Vertical Slots shared bundle-picker and stacked product-details sheets, revision 6. Approved references are the prior live WPB audit, accepted EB PPB modal/grouped-variant/quantity evidence, the user-supplied revision-2 findings, and the revision-4 footer capture. EB supplies density and interaction hierarchy; Wolfpack branding and accessibility remain authoritative.

## Source-of-truth priority

1. Existing product and business semantics.
2. Repository AGENTS.md and architecture.
3. Approved interaction, state, responsive, and accessibility contracts.
4. Approved standalone prototype, when present.
5. Design tokens and geometry.
6. Approved reference images for visual nuance.

## Goal

Deliver compact modal cards with independent native variant, image-details, and Add actions; filled slots capped by their existing responsive Horizontal tile or Vertical row geometry, with titles that wrap and clamp only at the cap while retaining the complete accessible name, plus a compact overlaid cross badge with a 44px target; validation-owned quantity presentation whose selector matches the full-width Add/Added action footprint; a content-responsive, footer-contained cart/price summary; and an editable 88dvh PPB details sheet stacked over the existing 85dvh picker.

## Non-goals

FPB, PPB Product List/Grid redesign, Admin UI, APIs, data, cart semantics, copy, and new merchant settings.

## Current architecture map

`dom-methods.ts` owns picker markup; `modal-state-methods.ts` owns picker lifecycle/focus; `modal-methods.ts` owns modal cards/native variant context/events; `BundleProductModal` owns editable details; `drawer-layer-manager.ts` owns stacked dismissal and scroll lifetime; product-page CSS owns presentation; `scripts/build-storefront.mjs` owns deployable widget version/assets.

## Exact component anatomy

Use `component-anatomy.md`. Preserve one picker tree and one PPB details tree. Horizontal/Vertical have no custom mobile variant drawer; reuse the shared product-card magnifier markup without changing FPB presentation.

## Required states

Use every state in `state-matrix.md`, including filled-slot identity/removal, add, quantity below maximum, maximum reached/remove-all, grouped variant, details Add/Update/cancel, exact replacement, capacity, failure, restoration, and topmost-layer behavior.

## Responsive transformations

Use `responsive-contract.md`: 85dvh picker, 88dvh details ceiling, five columns at 1440, four at 1280, two at 768/390/360, responsive filled-slot maximum heights owned by the existing Horizontal tile and Vertical row tokens, title clamping only at the cap, a top-end overlaid cross badge, start-aligned non-stretched sparse tracks, a shrink-wrapped footer summary capped inside its dock, no overflow, and safe-area-aware fixed regions.

## Interaction contract

Use `interaction-contract.md`. Variant changes update card identity/image/price/availability without adding or migrating selection. Only image opens details; Add stays independent. Details Add/Update commits once to the originating slot. Topmost-only containment and exact focus restoration are mandatory.

## Accessibility contract

Dialog must be labelled by the dynamic title; keep `aria-modal`, initial focus, Escape/backdrop, scroll lock, visible focus, 44px close and cross-badge targets, product-specific Remove naming with the complete unclamped name, same-index focus restoration after removal, exact sheet focus restoration, and reduced-motion behavior.

## Tokens and merchant-configurable values

Use `design-tokens.json`. Existing merchant variables own colors and typography. Add no customer-facing text and no fixed fixture-specific styling.

## Content fixtures

Use `content-stress-cases.yaml`, especially long titles, compare-at price, missing image, long variants, validation error, and slow loading.

## Allowed production areas

PPB modal render/state/keyboard methods; selected-slot rendering in `inpage-render-methods.ts`; PPB mode in the shared product-details modal; shared pure card-presentation helper; `modal-slots.css` and product-page modal CSS; focused behavior tests/spec; widget version/generated assets; required docs.

## Prohibited changes

FPB presentation, Product List/Grid semantics, APIs, Prisma, cart payloads, subscriptions, localized strings, runtime layout-style injection, template forks, competitor naming in code, dev server, deploy, and production fixtures.

## Test commands discovered from repository

Focused Jest modal suites; `node --check` generated widget JS; ESLint modified TS; `npm run build:widgets`; `npm run minify:assets css`; `git diff --check`; `npm run graphify:rebuild`.

## Chrome DevTools QA plan

Name the deterministic route, default-profile authentication mode, preflight result path, desktop and mobile viewports, required states and recipes, case IDs, assertions, screenshot and baseline paths, console and network policies, Lighthouse reports, performance trace or exclusion reason, non-regression cases, cleanup, and maximum retries. `validate_handoff.py` must pass before implementation begins.

Use the authenticated default Chrome profile and `browser-test-plan.yaml`. Fixture route: `https://agent-5sfidg3m.myshopify.com/products/ppb-mobile-modal-qa-2026-08-20`. Clear Cache Storage and hard reload with cache ignored before evidence. Test 1440x900, 1280x800, 768x1024, 390x844, and 360x800; run Horizontal/Vertical cases plus Product List/Grid non-regression. No destructive cart submission.

## Acceptance criteria

All criteria in `acceptance-criteria.md`, focused and four-template tests/builds, generated asset checks, and served version 14.0.0.

## Stopping criteria

Stop for missing direct Chrome tooling, stale served assets, unavailable fixture/template switch, business-semantics conflict, or any change outside allowed areas. Report browser gates as blocked instead of substituting tooling or deploying.

## Expected final report format

Report files, tests and builds, browser evidence, remaining differences, blockers, and rollback.

## Unresolved risks

The user-owned SIT server may continue serving 12.3.0 after local builds; full live Chrome proof then remains blocked. Existing unrelated Admin and Graphify changes must be preserved.

## Rollback guidance

Revert only the focused PPB modal source/generated-asset changes and restore the previous widget version; do not reset the worktree.
