---
schema_version: 1
id: fpb-ppb-step-title-codex-task
title: FPB and PPB Step Title Codex Task
type: implementation-task
status: complete
summary: Implements approved Direction A in production FPB/PPB renderers and verifies exact Settings Design bundle-preview parity.
last_audited: 2026-08-27
owners:
  - Aditya Awasthi
domains:
  - implementation-handoff
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-step-title-redesign-20260827/implementation-handoff.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/implementation-handoff.md
tags:
  - fpb
  - ppb
  - step-title
keywords:
  - implementation-task
  - acceptance
  - preview-parity
---

# Codex Task

Artifact job ID: fpb-step-title-redesign-20260827
Artifact revision: 2
Artifact status: complete

## Job, revision, goal, and non-goals

Implement job `fpb-step-title-redesign-20260827` revision 2. Goal and non-goals are those in `implementation-handoff.md`; do not broaden them.

## Approved references and source-of-truth priority

Direction A and locked decisions D-001 through D-004 are approved. Follow the handoff source priority exactly.

## Repository instructions and current architecture map

Inspect before editing. Implement the smallest architecture-correct change. Do not create parallel components, duplicate logic, bypass merchant variables, or make unrelated visual changes.

Change the shared production renderers and their canonical CSS owners. Settings Design must inherit them through its existing production-renderer adapter.

## Component anatomy and required states

Implement `component-anatomy.md` and S-01 through S-08.

## Responsive transformations

Implement `responsive-contract.md`, including content-aligned desktop/mobile wrapping and existing FPB/PPB boundary ownership.

## Interaction and accessibility contract

Preserve all existing controls and focus behavior. Render non-empty Step Title as a contextual body heading; keep Step Name in navigation/group/dialog identity.

## Tokens, geometry, and content fixtures

Use `design-tokens.json` and `content-stress-cases.yaml`; reuse existing merchant color tokens and picker grid inset.

## Allowed production areas and prohibited changes

Use the exact lists in `implementation-handoff.md`.

## Tests and generated-asset commands

TDD: create the required test spec, add failing resolver/fixture tests, then implement. Run focused Jest, widget build, CSS minification, syntax checks, changed-file ESLint, `git diff --check`, and Graphify rebuild.

## Chrome DevTools QA plan

Capture semantic, visual, geometry, responsive, console, network, accessibility, performance, and non-regression evidence.

Run strict Chrome preflight first. Use fresh accessibility snapshots, direct Chrome DevTools MCP interactions, before and after screenshots, element and viewport PNGs, desktop and mobile Lighthouse reports, approved mask bounds, and append-only retry history. Do not substitute another browser.

Hard reload every storefront and Settings Design cohort with cache bypass. Ignore neutral general-store chrome; compare only bundle UI.

## Acceptance, stopping, final report, risks, and rollback

Stop for missing authority, semantic conflict, unavailable required tooling, or an unapproved design decision. Report remaining differences honestly.

Do not deploy or start/restart the dev environment. Preserve unrelated worktree changes and roll back only task-owned hunks.
