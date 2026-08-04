---
schema_version: 1
id: storefront-design-director-example-conversations
title: Storefront Design Director Example Conversations
type: skill-reference
status: active
summary: Demonstrates concise evidence-led dialogue across nine common design-job situations.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/example-conversations.md
related_docs:
  - .agents/skills/storefront-design-director/references/conversational-guidance.md
tags:
  - examples
keywords:
  - status-block
  - design-decisions
---

# Example Conversations

Each example is a response pattern, not canned copy. Persist every decision before moving stages.

## 1. New screenshot-led component job

~~~text
Job: fpb-standard-card-20260803
Stage: REFERENCE_INTAKE
Revision: 1
Status: active
Locked decisions: none
Open decisions: target hierarchy, mobile action placement
Blockers: none
Next gate: comparable current and target evidence

I recorded the desktop and mobile files without editing storefront code. Recommendation: use the current card as the behavioral source and the target only for presentation.

1. Is the target an exact match or structural reference? Recommendation: structural until viewport metadata is confirmed.
2. Should the selected state retain current quantity behavior? Recommendation: yes, preserve business semantics.
~~~

## 2. Incomplete screenshot set

~~~text
Job: ppb-grid-card-20260803
Stage: REFERENCE_VALIDATION
Revision: 1
Status: blocked
Locked decisions: component scope
Open decisions: exact desktop geometry
Blockers: target crop omits the card boundary; viewport and zoom are unknown
Next gate: corrected target capture

The image supports hierarchy and color direction, not exact width or spacing. Please provide one 1440 x 900 capture at 100 percent zoom with the full card and limited surrounding grid context.
~~~

## 3. Existing component and ownership

~~~text
Job: fpb-summary-sidebar-20260803
Stage: COMPONENT_ANATOMY
Revision: 1
Status: active
Locked decisions: approved visual direction
Open decisions: scroll owner
Blockers: none
Next gate: one canonical owner per region

Repository evidence shows shared summary behavior and template-owned presentation. Recommendation: keep selection and totals in the shared owner; change only the canonical template CSS owner. Do not add a wrapper or specificity override.
~~~

## 4. Competing directions

~~~text
Job: ppb-mobile-tray-20260803
Stage: DIRECTION_APPROVAL
Revision: 1
Status: awaiting-approval
Locked decisions: business behavior unchanged
Open decisions: compact tray or disclosure tray
Blockers: user selection required
Next gate: explicit direction approval

Direction A minimizes height but hides selected products. Direction B adds a disclosure and preserves review before checkout. Recommendation: B because it supports error recovery and long-list stress without changing cart logic. Approve A, approve B, or request one specific revision.
~~~

## 5. Resume after interruption

~~~text
Job: fpb-progress-20260802
Stage: RESPONSIVE_CONTRACT
Revision: 2
Status: active
Locked decisions: desktop geometry, mobile replacement
Open decisions: 768px transition
Blockers: none
Next gate: critical boundary behavior

The manifest and history validate. Yesterday's settled desktop decisions remain locked. Recommendation: reflow at the existing container boundary rather than introduce a viewport-only breakpoint. Should the labels wrap or scroll at 768px? Recommendation: wrap to preserve keyboard and zoom access.
~~~

## 6. Implementation handoff

~~~text
Job: fpb-product-modal-20260803
Stage: HANDOFF_VALIDATION
Revision: 1
Status: ready-for-validation
Locked decisions: anatomy, states, responsive, interaction, tokens
Open decisions: none
Blockers: none
Next gate: validator pass and handoff approval

The packet identifies canonical rendering, state, event, CSS, token, fixture, and test owners. All artifacts are complete and checksum-recorded. I will run the handoff validator; implementation remains a separate Codex task.
~~~

## 7. Chrome preflight blocked

~~~text
Job: ppb-list-card-20260803
Stage: CHROME_QA_PREFLIGHT
Revision: 1
Status: blocked
Locked decisions: approved handoff
Open decisions: none
Blockers: Chrome DevTools MCP is unavailable
Next gate: reconnect Chrome DevTools MCP

Playwright or another browser cannot complete this gate. Configure Chrome DevTools MCP, keep the connected default Chrome profile, and resume this same job. Do not create an isolated context or alternate profile.
~~~

## 8. Failed visual diff

~~~text
Job: fpb-standard-card-20260803
Stage: VISUAL_REMEDIATION
Revision: 1
Status: failed
Locked decisions: approved baseline
Open decisions: none
Blockers: selected card is 8 CSS px too tall; mobile focus outline clips
Next gate: bounded implementation correction and rerun

Visual geometry and accessibility fail independently. Correct the canonical card spacing owner by 8 CSS px and the focus clipping owner without changing selection logic. Retest selected desktop, selected mobile, keyboard focus, and one sibling card baseline.
~~~

## 9. Final approval and archive

~~~text
Job: fpb-summary-sidebar-20260803
Stage: FINAL_APPROVAL
Revision: 2
Status: awaiting-approval
Locked decisions: all design and remediation decisions
Open decisions: final acceptance
Blockers: none
Next gate: explicit final approval

Functional, visual, geometry, responsive, console, network, accessibility, performance, and non-regression gates pass. Approve revision 2 to freeze the baselines and archive, or identify a measured remaining difference.
~~~
