---
schema_version: 1
id: ppb-selected-slot-redesign-codex-task
title: PPB Selected Slot Redesign Codex Task
type: implementation-task
status: complete
summary: Defines the bounded implementation task for the approved PPB selected-slot design.
last_audited: 2026-08-21
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
Artifact revision: 2
Artifact status: approved

## Job, revision, goal, and non-goals

Implement revision 2 of the approved Direction A selected-slot redesign for PPB Horizontal Slots and Vertical Slots. Preserve every business invariant and all out-of-scope surfaces listed in implementation-handoff.md.

## Approved references and source-of-truth priority

Read implementation-handoff.md and every approved contract in this job. EB is hierarchy inspiration only. Existing product and business semantics remain authoritative.

## Repository instructions and current architecture map

Read repository AGENTS.md, internal architecture, and Graphify impact evidence before source edits. Inspect selected item data before choosing markup. Implement the smallest architecture-correct change. Do not create parallel components, duplicate logic, bypass merchant variables, or make unrelated visual changes.

## Component anatomy and required states

Use component-anatomy.md and state-matrix.md exactly. Add only missing title/variant/price semantic regions to the existing selected-slot renderer. Both orientations share one runtime.

## Responsive transformations

Use responsive-contract.md. Horizontal uses intrinsic readable columns and equal-height tiles. Vertical remains a compact full-width row. Do not retain a fixed 200px selected/empty height.

## Interaction and accessibility contract

Use interaction-contract.md and accessibility-checklist.md. Preserve exact replacement/removal targeting, valid independent controls, 44px targets, keyboard completion, focus recovery, high zoom, and reduced motion.

## Tokens, geometry, and content fixtures

Use design-tokens.json and content-stress-cases.yaml. Reuse merchant tokens. Add no arbitrary spacing scale, fixed copied measurements, or new settings.

## Allowed production areas and prohibited changes

The allowed and prohibited lists in implementation-handoff.md are hard boundaries. If existing data cannot support variant or price without a contract expansion, stop and report instead of inventing a fallback.

## Tests and generated-asset commands

Follow TDD. Create test-spec/ppb-selected-slot-redesign.spec.md and behavior tests first. Do not test CSS, class names, source order, or visual placement. Run focused tests, ESLint, raw syntax checks where applicable, npm run build:widgets, npm run minify:assets css, npm run graphify:rebuild, and git diff --check.

## Chrome DevTools QA plan

Execute browser-test-plan.yaml through direct Chrome DevTools MCP only. Use the agent store, cache-cleared hard reloads, served asset proof, required viewport matrix, safe fixture transitions, and Product Grid restoration.

## Acceptance, stopping, final report, risks, and rollback

Use acceptance-criteria.md and implementation-handoff.md. Stop for missing authority, semantic conflict, unavailable required tooling, unsafe fixture restoration, or an unapproved design decision. Report remaining differences honestly and commit only coherent verified batches.
