---
schema_version: 1
id: storefront-design-director-codex-task-template
title: Codex Task Template
type: design-job-template
status: active
summary: Converts an approved handoff into a bounded implementation task with explicit evidence and stopping rules.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - implementation-handoff
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/codex-task.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/implementation-handoff.md
tags:
  - template
keywords:
  - implementation-task
  - acceptance
---

# Codex Task

Artifact job ID: storefront-variant-selectors-across-product-cards-and-modal-20260911
Artifact revision: 2
Artifact status: approved

## Job, revision, goal, and non-goals

Implement revision 2 of the approved Direction A adaptive intrinsic matrix for existing FPB and PPB variant selectors in product cards and existing product modal/picker surfaces. For multi-dimensional PPB products in a swatch mode, render each non-swatch dimension as one native select while preserving canonical Shopify swatches for dimensions that provide the requested swatch data. The Agent-store acceptance fixture is Size (seven values) by Color (four values). Make every value readable and directly reachable without clipping, congestion, hidden values, horizontal rails, or selector-owned scrolling. Preserve all Shopify product, variant, swatch, price, inventory, market, cart, modal, drawer, and sticky-action behavior. Do not add FPB selector modes, new renderers, endpoints, data models, compatibility logic, swatch inference, or unrelated card redesign.

## Approved references and source-of-truth priority

Use `implementation-handoff.md` as the controlling packet and `direction-comparison.md` as the approved design direction. Resolve conflicts in this order: business semantics; repository AGENTS.md and architecture; state/responsive/interaction/accessibility contracts; design tokens; current structural screenshots. The revision has no exact target raster, so never invent captured pixel geometry or overfit the Agent-store fixture.

## Repository instructions and current architecture map

Follow the mandatory internal-docs, Graphify, then raw-source search order already recorded in the handoff. Work in the existing FPB owner `widgets/shared/variant-selector.ts`, the existing PPB owner `product-page/variant-selector-modes.ts`, their existing composition methods, and raw template CSS only where responsibility requires it. Never hand-edit generated extension assets. Implement the smallest architecture-correct change and preserve unrelated worktree files.

## Component anatomy and required states

Implement `component-anatomy.md` and every `VS-01` through `VS-22` state in `state-matrix.md`. One visible label and one selector group belong to each option dimension. Shared family selectors own semantics/state/events; cards, templates, modals, and drawers own placement, density, scrolling, and focus restoration. Selection must fire exactly one update and never activate card Add/details behavior.

## Responsive transformations

Apply `responsive-contract.md`: normal-flow intrinsic wrapping; full-width dropdowns; long values on wider/full rows; no hidden `+N`, rail, nested scroller, duplicate responsive DOM tree, or target miniaturization. Preserve existing FPB 799/800 container behavior, PPB 767/768 behavior, PPB Grid 479/480 behavior, modal collapse, mobile drawer replacement, and sticky safe areas.

## Interaction and accessibility contract

Apply `interaction-contract.md` and `accessibility-checklist.md`: native labeled select controls or one named radio group per non-dropdown dimension; unique instance-scoped IDs; disabled unavailable values; visible persistent selected labels; 44px targets; keyboard completion; visible unclipped focus; logical focus retention/restoration; color-independent state; 200% zoom; and reduced motion.

## Tokens, geometry, and content fixtures

Use only owners defined in `design-tokens.json`. Shopify `ProductOptionValue.swatch` is authoritative. In multi-dimensional PPB swatch modes, a dimension without the requested canonical swatch kind becomes one native select; do not guess a swatch from its label or variant image. Explicit dropdown and pill modes remain unchanged. Exercise every browser-required fixture in `content-stress-cases.yaml`, including the exact seven-size by four-color Agent-store product, mixed availability, mapped/missing swatches, long identity and currency, compare-at price, quantity 12, duplicate instances, and delayed/failed hydration.

## Allowed production areas and prohibited changes

The allowed file and documentation boundaries in `implementation-handoff.md` are exhaustive. Prohibited: Prisma/routes/Admin/app-proxy/cart/checkout changes; new selector engines/components/overlays; legacy or fallback logic; swatch inference; runtime CSS injection; direct generated edits; styling/placement unit tests; dev/deploy commands; direct database mutation; non-Agent-store QA; screenshots or private URLs in Git; and unrelated cleanup.

## Tests and generated-asset commands

Before production code, create `apps/OnlyBundles-app/test-spec/storefront-variant-selector-redesign.spec.md`, then add failing behavior/data-flow tests. Run focused selector suites, full relevant unit tests, `node --check` for changed widget JS, typecheck, modified-file ESLint, and `git diff --check`. Build with `npm run build:widgets` and `npm run minify:assets css`; bump `WIDGET_VERSION` MINOR immediately before the release-candidate build. Finish with repaired Knip and `npm run graphify:rebuild`. Do not write CSS/class/layout assertions.

## Chrome DevTools QA plan

Execute `browser-test-plan.yaml` with direct Chrome DevTools in the connected default profile and Agent store only. Prove the Admin fixture persists after hard reload, generate fresh Preview Bundle URLs, clear Cache Storage, hard reload with cache bypass, and capture actual 1280x800 and actual 390x844 windows plus critical boundaries. Cover all eight templates, cards, FPB modal/drawer, PPB picker, four PPB modes, stress/availability/failure states, keyboard/focus, console/network, Lighthouse, performance, visual diff, and sibling non-regression. Keep all evidence uncommitted under `qa/`; no unapproved masks or alternate browser tooling.

## Acceptance, stopping, final report, risks, and rollback

All items in `acceptance-criteria.md` must pass. Stop before code if handoff approval is absent; stop if a fixture cannot persist, direct Chrome cannot achieve a required viewport, the approved direction would require new business behavior, or a deploy is needed. Report task-owned sources/tests/docs/generated assets, exact command results, case IDs and actual geometry, remaining blockers, widget version, and preserved dirty files. Roll back only the smallest task-owned selector slice and regenerate assets from canonical sources; never reset the worktree or discard unrelated changes.
