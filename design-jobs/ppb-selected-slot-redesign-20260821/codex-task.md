---
schema_version: 1
id: ppb-selected-slot-redesign-codex-task
title: PPB Vertical Slot Redesign Codex Task
type: implementation-task
status: complete
summary: Defines the bounded implementation task for Revision 4 PPB Vertical Slots live-EB parity.
last_audited: 2026-08-24
owners:
  - wolfpack
domains:
  - storefront-design
systems:
  - product-page-bundle
source_paths:
  - design-jobs/ppb-selected-slot-redesign-20260821/implementation-handoff.md
related_docs:
  - design-jobs/ppb-selected-slot-redesign-20260821/browser-test-plan.yaml
tags:
  - ppb
  - codex
keywords:
  - selected-slot
  - implementation-task
---

# Codex Task

Artifact job ID: ppb-selected-slot-redesign-20260821
Artifact revision: 4
Artifact status: complete

## Job, revision, goal, and non-goals

Implement Revision 4 for PPB Vertical Slots only. Match the measured live EB empty and filled row contract in `implementation-handoff.md` while preserving every Wolfpack business invariant and out-of-scope surface.

## Approved references and source-of-truth priority

Read `implementation-handoff.md` and every Revision 4 contract. Live EB is the visual target; existing Wolfpack product and business semantics remain authoritative. Copy no competitor code, selector, or identifier.

## Repository instructions and current architecture map

Read repository AGENTS.md, internal architecture, and Graphify impact evidence before source edits. Inspect selected item data before choosing markup. Implement the smallest architecture-correct change. Do not create parallel components, duplicate logic, bypass merchant variables, or make unrelated visual changes.

## Component anatomy and required states

Use `component-anatomy.md` and `state-matrix.md` exactly. Do not add price or variant output. Prefer the canonical Vertical template CSS; change renderer markup only for required semantic action separation or accessible naming.

## Responsive transformations

Use `responsive-contract.md`. Vertical remains one full-width column. Target 64px filled rows, 60px empty rows, 50px media, and the measured spacing/radius/border primitives; allow accessible growth at high zoom.

## Interaction and accessibility contract

Use interaction-contract.md and accessibility-checklist.md. Preserve exact replacement/removal targeting, valid independent controls, 44px targets, keyboard completion, focus recovery, high zoom, and reduced motion.

## Tokens, geometry, and content fixtures

Use `design-tokens.json` and `content-stress-cases.yaml`. Reuse merchant color and typography ownership. The exact measured EB values are approved component primitives, not merchant colors or a new settings system.

## Allowed production areas and prohibited changes

The allowed and prohibited lists in `implementation-handoff.md` are hard boundaries. Horizontal Slots and other templates must remain unchanged.

## Tests and generated-asset commands

Follow TDD. Create test-spec/ppb-selected-slot-redesign.spec.md and behavior tests first. Do not test CSS, class names, source order, or visual placement. Run focused tests, ESLint, raw syntax checks where applicable, npm run build:widgets, npm run minify:assets css, npm run graphify:rebuild, and git diff --check.

## Chrome DevTools QA plan

Execute `browser-test-plan.yaml` through direct Chrome DevTools MCP only. Use cache-cleared hard reloads, served asset proof, the required viewport matrix, safe fixture transitions, and non-regression checks.

## Acceptance, stopping, final report, risks, and rollback

Use acceptance-criteria.md and implementation-handoff.md. Stop for missing authority, semantic conflict, unavailable required tooling, unsafe fixture restoration, or an unapproved design decision. Report remaining differences honestly and commit only coherent verified batches.
