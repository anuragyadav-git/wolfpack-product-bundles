---
schema_version: 1
id: fpb-three-preset-codex-task
title: FPB Classic Compact Horizontal Codex Task
type: design-job-artifact
status: complete
summary: Converts the approved three-preset design into three independently verified CSS implementation slices.
last_audited: 2026-08-14
owners:
  - Aditya Awasthi
domains:
  - implementation-handoff
systems:
  - full-page-bundle-widget
source_paths:
  - app/assets/widgets/full-page-css/templates/classic
  - app/assets/widgets/full-page-css/templates/compact/overrides.css
  - app/assets/widgets/full-page-css/templates/horizontal/overrides.css
related_docs:
  - implementation-handoff.md
  - acceptance-criteria.md
tags:
  - fpb
  - codex
keywords:
  - CSS-only
  - browser QA
---

# Codex Task

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 1
Artifact status: complete

## Job, revision, goal, and non-goals

Revision 1. Implement CL-A, then CO-A, then HO-A as independent preset-CSS slices. Preserve Standard and all shared behavior. Non-goals and stop conditions are exactly those in `implementation-handoff.md`.

## Approved references and source-of-truth priority

Use `locked-decisions.yaml`, `component-anatomy.md`, `state-matrix.md`, `responsive-contract.md`, `interaction-contract.md`, `accessibility-checklist.md`, `design-tokens.json`, and the existing C01-C15 ledger, in the priority stated by the handoff.

## Repository instructions and current architecture map

Inspect before editing. Implement the smallest architecture-correct change. Do not create parallel components, duplicate logic, bypass merchant variables, or make unrelated visual changes. The shared foundation renders/behaves; the active preset stylesheet owns this presentation slice.

## Component anatomy and required states

Keep the existing card DOM. Prove all nine required states with zero state-driven card-height change and equal same-row heights.

## Responsive transformations

Use intrinsic layout and existing container ownership. Preserve Classic 4-cap/phone 2, Compact 3-cap/phone 2, and Horizontal desktop 2/below-800 1. Verify five target widths plus 799/800/801.

## Interaction and accessibility contract

No behavior code changes. Retain mouse, touch, and keyboard operation; visible focus; 44px targets; state semantics; immediate add-to-quantity swap; and existing modal/drawer/summary behavior.

## Tokens, geometry, and content fixtures

Reuse merchant and shared tokens. Use exact pixels only for the one-pixel frame and existing control primitive/boundary. Exercise all required stress fixtures.

## Allowed production areas and prohibited changes

Edit only the preset raw CSS paths listed in `implementation-handoff.md`, then regenerate the existing minified CSS. Standard, shared CSS/runtime, renderers, data, and settings are prohibited.

## Tests and generated-asset commands

Per slice: `npm run minify:assets css`, `git diff --check`, `npm run graphify:rebuild`, relevant Git status/diff audit, and direct Chrome QA. No CSS-source unit tests or TDD spec. Commit each verified preset independently with mandatory Impact/Affected/Tested-by body.

## Chrome DevTools QA plan

Execute `browser-test-plan.yaml` using direct Chrome DevTools MCP only. Cache-bypass reload after every build/deploy state change. Capture semantics, geometry, responsive behavior, console, network, accessibility, layout-shift/performance, and Standard non-regression. Do not deploy.

## Acceptance, stopping, final report, risks, and rollback

All `acceptance-criteria.md` items are blocking. Stop on scope conflict or unavailable strict browser evidence. Report per-preset commits and evidence, remaining differences, no-deploy status, and independent reverse-order revert guidance.
