---
schema_version: 1
id: storefront-design-director-code-ownership
title: Code Ownership and Implementation Handoff
type: skill-reference
status: active
summary: Maps design requests to canonical repository owners before producing a bounded implementation packet.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - software-architecture
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/code-ownership-and-handoff.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/implementation-handoff.md
tags:
  - ownership
keywords:
  - canonical-owner
  - blast-radius
---

# Code Ownership and Handoff

Read repository instructions, internal architecture docs, graph reports, and only then required source files. Inspect read-only.

Identify DOM or rendering owner, business-state owner, event owner, shared CSS owner, template CSS owner, viewport owner, runtime-injected style owner, merchant token owner, test owner, fixture route owner, visual-regression owner, conflicts, and the canonical location for each requested change.

Classify changes as shared behavior, shared presentation, family behavior, template presentation, state presentation, viewport presentation, merchant token, data or content, markup or accessibility, or test fixture.

Report runtime-injected static styles, duplicate selectors, contradictory media queries, specificity escalation, hard-coded colors, multiple style owners, misplaced mobile styles, presentation-only DOM recreation, duplicated business logic, and competitor or obsolete naming. Do not prescribe a higher-specificity override when the canonical owner should change.

Unresolved canonical ownership limits remediation to the measured expected outcome, constraints, risks, and rerun scope. Do not name or recommend an implementation mechanism, CSS property, selector shape, pseudo-element, JavaScript injection, or source path until repository evidence identifies the canonical owner. Record ownership as blocked instead of turning a plausible technique into a patch instruction.

The packet includes goal, non-goals, source priority, architecture, anatomy, states, responsive, interaction, accessibility, tokens, fixtures, allowed and prohibited areas, tests, Chrome QA, acceptance, stopping, report format, risk, and rollback. Instruct implementation to inspect first, make the smallest architecture-correct change, preserve semantics and merchant customization, run required builds and tests, capture Chrome evidence, and report differences honestly.
