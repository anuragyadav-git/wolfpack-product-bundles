---
schema_version: 1
id: fpb-all-template-summary-codex-task
title: Implement FPB Unified Calm Review System
type: implementation-task
status: approved
summary: Provides a bounded task for implementing and proving Direction A across every FPB summary preset.
last_audited: 2026-08-05
owners:
  - Aditya Awasthi
domains:
  - storefront-implementation
systems:
  - fpb-summary
source_paths:
  - design-jobs/fpb-all-template-summary-20260804/implementation-handoff.md
related_docs:
  - design-jobs/fpb-all-template-summary-20260804/browser-test-plan.yaml
tags:
  - fpb
  - summary
keywords:
  - implementation
  - browser-qa
---

# Codex Task

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 2
Artifact status: approved

## Job, revision, goal, and non-goals

Implement revision 2 of `fpb-all-template-summary-20260804`: Direction A, Unified Calm Review System, for Standard, Classic, Compact, and Horizontal desktop summaries plus one shared tray below 1024px measured widget-container width. Preserve all business semantics. Do not redesign cards, Admin, PPB, settings, pricing, validation, navigation, add-ons, or cart behavior. Do not deploy or restart the provided server/tunnel.

## Approved references and source-of-truth priority

Read `implementation-handoff.md` first, followed by anatomy, state, responsive, interaction, accessibility, token, stress, acceptance, and browser-plan artifacts. Existing behavior and repository instructions override visual inference. Screenshots guide nuance only.

## Repository instructions and current architecture map

Inspect `internal docs/` then `graphify-out/GRAPH_REPORT.md` before raw source and map downstream impact. Canonical owners are `side-panel-methods.js`, `mobile-summary-methods.js`, `responsive-layout-methods.js`, shared summary CSS, and the four `side-footer-*.css` preset files. Box/validation/add-on and token owners are conditional only when evidence demands them. Avoid the high-connectivity composition file, generated assets, custom CSS, and runtime style injection. Implement the smallest architecture-correct change without parallel components or duplicate logic.

## Component anatomy and required states

Use the exact shared hierarchy in `component-anatomy.md`, with header and total/action outside the selected-list scroll region. Retain Standard narrow bordered, Classic airy borderless, Compact wide coherent, and Horizontal intermediate bordered identities. Support SUM-01 through SUM-20 using existing predicates and handlers; one action must produce one update or submit.

## Responsive transformations

Use the desktop sidebar at widget-container widths of 1024px and above and one shared non-modal inset tray below 1024px. Prove 1023/1024/1025, 767/768/769, 600px constrained host, 320px minimum, short height, safe area, orientation, 200% zoom, and reduced motion. Never lock page/body scroll; only a tall expanded selected-list region may scroll.

## Interaction and accessibility contract

Preserve removal protection, Clear confirmation, quantity tiers, disclosure, Back/Next, busy/error recovery, and Add to cart. The single disclosure exposes `aria-expanded`; collapsed content is inert and hidden. Keep native controls, useful names, visible focus, perceivable disabled/busy reasons, logical focus recovery, non-color-only feedback, minimum targets, reflow, and reduced motion.

## Tokens, geometry, and content fixtures

Use existing merchant variables and `design-tokens.json`; use content-driven CSS, not captured fixed geometry. Incrementally transition the Agent fixture within each matrix group and execute every browser-required stress case in `content-stress-cases.yaml`.

## Allowed production areas and prohibited changes

Allowed: canonical summary/responsive methods, shared summary CSS, four preset identity files, narrowly proven supporting owners/token bridge, focused behavior tests, mandatory test spec, and generated build outputs. Prohibited: business contracts, config loading, proxy retry, Admin/PPB/DB work, compatibility shims, fabricated copy, `!important`, CSS/class/placement tests, direct generated edits, deploy, dev-server launch, repair apply, real orders, and unrelated cleanup.

## Tests and generated-asset commands

First create `test-spec/fpb-all-template-summary.spec.md` and write behavior tests before implementation. Run focused tests, `node --check` on changed raw JS, ESLint on modified lintable files, `npm run build:widgets:full-page` after JS changes, `npm run minify:assets css` after CSS changes, and `npm run graphify:rebuild` after code changes. Before every commit run the required lint and audit hook-generated diffs. Do not bump widget version without imminent approved deploy.

Commit verified slices with impact-analysis bodies: (1) shared behavior/accessibility/responsive ownership, (2) shared mobile tray, (3) Standard and Classic desktop identities, (4) Compact and Horizontal desktop identities, and (5) final state-matrix remediation. Collapse a slice only when it makes no production change; never commit a failing slice.

## Chrome DevTools QA plan

Execute `browser-test-plan.yaml` using direct Chrome DevTools MCP in the connected default profile. Before every storefront pass clear Cache Storage and hard reload with cache bypass. Verify the active asset and widget version. Capture storefront-only PNGs plus semantic, geometry, console, network, Lighthouse, performance, accessibility, and regression evidence. Keep raw browser evidence uncommitted and never substitute another browser.

## Acceptance, stopping, final report, risks, and rollback

All `acceptance-criteria.md` items must pass. Stop for ownership conflict, missing authority, missing tooling, failed local gates, or an unapproved semantic/design decision. Report files, commits, command results, every browser case/evidence path, exact remaining differences, blockers/waivers, and rollback. Revert only the failed bounded slice and its generated outputs; never add a legacy fallback.
