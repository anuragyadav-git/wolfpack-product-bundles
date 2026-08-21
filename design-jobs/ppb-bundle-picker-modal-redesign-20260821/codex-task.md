---
schema_version: 1
id: storefront-design-director-codex-task-template
title: Codex Task Template
type: design-job-template
status: active
summary: Converts an approved handoff into a bounded implementation task with explicit evidence and stopping rules.
last_audited: 2026-08-21
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

Artifact job ID: ppb-bundle-picker-modal-redesign-20260821
Artifact revision: 6
Artifact status: approved

## Job, revision, goal, and non-goals

Implement revision 6 of `ppb-bundle-picker-modal-redesign-20260821`: preserve the approved shared picker/details work and cap filled Horizontal/Vertical slots using their existing responsive geometry owners. Product names wrap normally and visually clamp only at the cap while the complete name remains programmatically available. Replace the separate Remove action with a compact cross badge over the slot, retaining a 44px target, localized product-specific accessible name, existing single-removal mutation, replacement activation, and focus restoration. Exclude FPB presentation, Admin, APIs, data, cart semantics, and Product List/Grid redesign.

## Approved references and source-of-truth priority

Follow `implementation-handoff.md`, repository behavior/architecture, approved contracts, existing merchant tokens, live WPB current-state evidence, then accepted EB inspiration evidence.

## Repository instructions and current architecture map

Inspect before editing. Implement the smallest architecture-correct change. Do not create parallel components, duplicate logic, bypass merchant variables, or make unrelated visual changes.

## Component anatomy and required states

Implement `component-anatomy.md` and every applicable state in `state-matrix.md` without a second modal tree.

## Responsive transformations

Implement `responsive-contract.md` at 767/768/769, 1023/1024/1025, 1439/1440/1441 and the five required viewports using intrinsic responsive CSS.

## Interaction and accessibility contract

Implement `interaction-contract.md` and `accessibility-checklist.md`, including dynamic dialog labelling and top-layer Tab containment.

## Tokens, geometry, and content fixtures

Use existing merchant tokens plus approved aliases in `design-tokens.json`; exercise `content-stress-cases.yaml`.

## Allowed production areas and prohibited changes

Allowed: PPB selected-slot rendering, PPB modal methods/CSS, PPB mode in shared details, a pure card-presentation helper, focused tests/spec, version/generated assets, required docs. Prohibited: FPB presentation, Admin, APIs, DB, new copy, cart semantics, template forks, runtime CSS injection, dev server, deploy, fixtures.

## Tests and generated-asset commands

Write behavior tests first. Run focused Jest, ESLint on modified TS/tests, typecheck if available, `npm run build:widgets`, `npm run minify:assets css`, generated JS syntax checks, `git diff --check`, and `npm run graphify:rebuild`.

## Chrome DevTools QA plan

Capture semantic, visual, geometry, responsive, console, network, accessibility, performance, and non-regression evidence.

Run strict Chrome preflight first. Use fresh accessibility snapshots, direct Chrome DevTools MCP interactions, before and after screenshots, element and viewport PNGs, desktop and mobile Lighthouse reports, approved mask bounds, and append-only retry history. Do not substitute another browser.

## Acceptance, stopping, final report, risks, and rollback

Stop for missing authority, semantic conflict, unavailable required tooling, or an unapproved design decision. Report remaining differences honestly.

Run direct Chrome QA from `browser-test-plan.yaml` only if served version is 14.0.0. If stale or direct Chrome tools are absent, report the live gate blocked and do not start/restart/deploy. Roll back only focused files.
