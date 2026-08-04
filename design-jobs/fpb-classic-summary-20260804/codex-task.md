---
schema_version: 1
id: fpb-classic-summary-codex-task
title: Implement FPB Classic Calm Review Panel
type: implementation-task
status: complete
summary: Provides a self-contained bounded Codex task for implementing and proving the approved Classic summary redesign.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-implementation
systems:
  - fpb-classic-summary
source_paths:
  - design-jobs/fpb-classic-summary-20260804/implementation-handoff.md
related_docs:
  - design-jobs/fpb-classic-summary-20260804/browser-test-plan.yaml
tags:
  - fpb
  - classic
  - codex
keywords:
  - implementation
  - chrome-qa
---

# Codex Task

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: approved

## Job, revision, goal, and non-goals

Implement revision 1 of `fpb-classic-summary-20260804`: Direction A, Calm Review Panel, for only the FPB Classic desktop summary and its mobile/tablet tray. Preserve every existing business semantic. Do not redesign cards, change pricing/validation/cart behavior, add settings/copy, touch sibling templates, deploy, commit, or perform unrelated cleanup.

## Approved references and source-of-truth priority

Read `implementation-handoff.md` first, then the anatomy, state, responsive, interaction, accessibility, tokens, stress, acceptance, and browser-plan artifacts. Existing business behavior and repository `AGENTS.md` override visual inference. Approved screenshots refine visual nuance only.

## Repository instructions and current architecture map

Inspect `internal docs/` and `graphify-out/GRAPH_REPORT.md` before raw source. Map downstream dependencies. Inspect before editing. Implement the smallest architecture-correct change. Do not create parallel components, duplicate logic, bypass merchant variables, or make unrelated visual changes.

Canonical owners are `side-panel-methods.js`, `mobile-summary-methods.js`, `responsive-layout-methods.js`, Classic `desktop-sidebar.css`, Classic `mobile.css`, and `side-footer-classic.css`. Treat shared base CSS and token generators as conditional owners only when evidence demands it. Do not implement in empty `classic-template.js`, merchant custom CSS, generated assets, or runtime CSS injection.

## Component anatomy and required states

Build the exact anatomy in `component-anatomy.md`. Header/feedback/footer remain outside the selected-list scroll. Support every one of the 30 states in `state-matrix.md`, using existing predicates and event handlers. One interaction produces one update or submit.

## Responsive transformations

Use one tray below 64rem available component width and the desktop sidebar at 64rem+. Prove 1023/1024/1025, 767/768/769, a 600px constrained host, 320px minimum width, short heights, safe area, 200% zoom, orientation, and reduced motion. Never lock body/page scroll; only the selected list may scroll.

## Interaction and accessibility contract

Preserve remove, protected-item, Clear confirmation, quantity, disclosure, Next, Add to cart, busy, and error behavior. Keep native controls, unique names, `aria-expanded`, perceivable disabled reasons, logical focus recovery, non-color-only totals/progress, visible focus, safe target sizes, and reduced-motion behavior.

## Tokens, geometry, and content fixtures

Use `design-tokens.json`, existing merchant variables, and intrinsic responsive CSS. Do not copy fixed screenshot geometry. Exercise every stress case flagged for browser QA in `content-stress-cases.yaml` against the Agent Classic fixture.

## Allowed production areas and prohibited changes

Allowed: canonical Classic summary methods/CSS, narrowly necessary token bridge work, focused behavior tests, the required test spec, and generated outputs from repository build commands. Prohibited: business contracts, config-loading priority, proxy retry, Admin/DB code, sibling presets, compatibility shims, fabricated copy, CSS/class/placement tests, direct generated-file edits, deploy, dev-server launch, repair apply, or live production mutation.

## Tests and generated-asset commands

Before implementation create `test-spec/fpb-classic-summary.spec.md`; write behavior tests first. Do not test CSS or source class names. Run focused tests, `node --check` for changed raw widget JS, ESLint on modified lintable files, `npm run build:widgets:full-page` after JS changes, `npm run minify:assets css` after CSS changes, and `npm run graphify:rebuild` after code changes. Audit generated diffs. Do not bump `WIDGET_VERSION` until an explicitly approved deploy is imminent, and never deploy autonomously.

## Chrome DevTools QA plan

After local checks, execute `browser-test-plan.yaml` using only direct Chrome DevTools MCP in the connected default profile. Refresh the storefront with cache bypass, clear Cache Storage, and verify the active asset URL/rule/widget version. Capture storefront-only PNGs and semantic, visual, geometry, responsive, console, network, accessibility, Lighthouse, performance, and sibling non-regression evidence. Do not substitute another browser or claim unrun cases.

## Acceptance, stopping, final report, risks, and rollback

All criteria in `acceptance-criteria.md` must pass. Stop for missing authority, semantic conflict, unavailable required tooling, failed build/test, or an unapproved design decision. Stop before deploy or unrelated mutation. Report exact files, commands/results, evidence paths, remaining differences, blockers, waivers, sibling results, and rollback. Roll back only the bounded Classic source/generated-output unit; never add legacy fallbacks.
