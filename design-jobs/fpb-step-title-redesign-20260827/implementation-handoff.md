---
schema_version: 1
id: fpb-ppb-step-title-implementation-handoff
title: FPB and PPB Step Title Implementation Handoff
type: implementation-handoff
status: complete
summary: Provides the bounded production-renderer implementation and Settings Design preview-parity contract for Direction A.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - implementation-handoff
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/component-anatomy.md
  - design-jobs/fpb-step-title-redesign-20260827/state-matrix.md
  - design-jobs/fpb-step-title-redesign-20260827/responsive-contract.md
  - design-jobs/fpb-step-title-redesign-20260827/interaction-contract.md
  - design-jobs/fpb-step-title-redesign-20260827/design-tokens.json
related_docs:
  - .agents/skills/storefront-design-director/references/code-ownership-and-handoff.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - codex
  - handoff
  - preview-parity
---

# Implementation Handoff

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: approved

## Identity and approved references

- Job: `fpb-step-title-redesign-20260827`, revision 2.
- Approved direction: Direction A — Content Heading.
- Locked decisions: D-001 through D-004.
- Contracts: `component-anatomy.md`, `state-matrix.md`, `responsive-contract.md`, `interaction-contract.md`, `accessibility-checklist.md`, `design-tokens.json`, and `content-stress-cases.yaml`.

## Source-of-truth priority

1. Existing product and business semantics.
2. Repository AGENTS.md and architecture.
3. Approved interaction, state, responsive, and accessibility contracts.
4. Approved standalone prototype, when present.
5. Design tokens and geometry.
6. Approved reference images for visual nuance.

## Goal

Render merchant-configured Step Title once as a responsive content-aligned heading for the active FPB/PPB product-selection area, keep Step Name as compact navigation/group identity, and make Settings > Design inherit the exact production bundle UI without preview-only styling.

## Non-goals

- Admin Step Config controls, persistence, translations, product cards, pricing, selection, validation, summary, and cart behavior.
- Neutral store chrome inside Settings Design.
- New color controls, theme aliases, animation, decorative surfaces, compatibility shims, or migration logic.

## Current architecture map

- FPB Step Title text originates in `createStepContentHeader` and is placed by `renderFullPageLayout`.
- PPB navigation/body/slot ownership is split across `layout-shell-methods.ts`, `modal-slot-template.ts`, and the picker DOM in `dom-methods.ts`.
- Settings Design fixture data is built by `storefront-preview-fixtures.ts`; the frame imports production controllers and CSS.
- Blast radius: full-page widget god node, PPB layout/template community, and Settings Design production-preview community.

## Exact component anatomy

Implement the tree and ownership in `component-anatomy.md`. Do not create parallel preview markup.

## Required states

S-01 through S-08 in `state-matrix.md`.

## Responsive transformations

Follow `responsive-contract.md`, including 799/800/801 FPB and 767/768/769 PPB boundaries, 320 px stress, and logical Settings Design canvases.

## Interaction contract

Step Title is non-interactive. Existing navigation, modal, selection, validation, and focus behavior remain unchanged.

## Accessibility contract

- Use one contextual heading for non-empty Step Title; emit no empty heading.
- Navigation/group/dialog identity uses Step Name.
- PPB dialog `aria-labelledby` continues to reference Step Name; body heading does not steal focus.

## Tokens and merchant-configurable values

- Reuse FPB and PPB existing primary-text color ownership.
- Apply approved 18–24 px responsive scale, weight 700, line-height 1.25, natural wrapping, and content-driven height.
- Reuse the PPB picker product-grid inset; do not invent a second spacing token.

## Content fixtures

Use `content-stress-cases.yaml`. Settings Design fixture must expose distinct Step Name and Step Title values and remain deterministic/side-effect free.

## Allowed production areas

- `app/assets/widgets/full-page/methods/mobile-summary-methods.ts`
- `app/assets/widgets/full-page/methods/responsive-layout-methods.ts`
- `app/assets/widgets/full-page-css/base/steps-header-banners.css`
- `app/assets/widgets/full-page-css/shared/responsive-layout.css`
- `app/assets/widgets/product-page/methods/layout-shell-methods.ts`
- `app/assets/widgets/product-page/templates/modal-slot-template.ts`
- `app/assets/widgets/product-page/methods/dom-methods.ts`
- `app/assets/widgets/product-page-css/base/layout-steps-summary.css`
- `app/assets/widgets/product-page-css/base/bottom-sheet-modal.css`
- `app/assets/widgets/product-page-css/templates/inpage-grid.css`
- `app/assets/widgets/product-page-css/templates/inpage-cascade.css`
- `app/routes/app/app.settings/storefront-preview-fixtures.ts`
- Focused tests, test spec, generated widget/CSS assets, and Graphify outputs required by repository rules.

## Prohibited changes

- Preview-frame-specific Step Title markup or CSS.
- Bundle-config loading order, API/data contracts, persistence, translation mapping, navigation mechanics, validation, selection, pricing, summary, or cart behavior.
- Runtime style injection, CSS `!important`, legacy fallbacks, unrelated cleanup, deploy, dev-server start, or fixture persistence.

## Test commands discovered from repository

1. Focused red/green Jest for Step Name/Step Title resolver behavior and preview fixture separation.
2. `node --check` on generated raw storefront widget entry files after build.
3. `npm run build:widgets`
4. `npm run minify:assets css`
5. `npx eslint --max-warnings 9999` on modified TypeScript/test files.
6. `git diff --check`
7. `npm run graphify:rebuild`

## Chrome DevTools QA plan

Use `browser-test-plan.yaml`. Hard reload with cache bypass before each storefront or Settings Design cohort. Verify all four FPB and all four PPB templates at desktop and mobile; verify title/content alignment, distinct navigation labels, PPB picker body heading, empty/long copy, accessibility tree, console/network, and non-regression of summary and modal focus. Direct Chrome DevTools MCP only.

## Acceptance criteria

All checks in `acceptance-criteria.md` pass. Production and Settings Design bundle UI must have no measured Step Title inconsistency.

## Stopping criteria

Stop for a semantic conflict with locked decisions, required production owner outside allowed areas, unavailable direct Chrome tooling, stale served assets that require deployment/restart, or an unapproved destructive/external action.

## Expected final report format

Report changed source/generated files, focused tests/lint/build/Graphify, hard-reloaded Chrome evidence by family/template/viewport, any remaining differences or blockers, and rollback.

## Unresolved risks

- Existing unrelated worktree changes overlap preview and widget files; preserve them and report overlap precisely.
- The live storefront will not show source changes until the user-provided dev process serves rebuilt assets; do not deploy or restart autonomously.
- Browser screenshot persistence may be restricted; inline evidence remains reviewable, but durable PNG gates may block final archival.

## Rollback guidance

Revert only this task's renderer, CSS, fixture, test, and generated-asset hunks. Do not reset or overwrite unrelated worktree changes.
