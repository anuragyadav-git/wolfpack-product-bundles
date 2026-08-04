---
schema_version: 1
id: storefront-design-director-workflow-state-machine
title: Storefront Design Workflow State Machine
type: skill-reference
status: active
summary: Defines legal design-job stages, evidence gates, backward transitions, and revision effects.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/workflow-state-machine.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - workflow
keywords:
  - stage-transition
  - revision
---

# Workflow State Machine

Use scripts/update_job_stage.py for every transition. Forward movement is one stage at a time. PAUSED, BLOCKED, and CANCELLED are special states. Backward movement requires an explicit reason, an allowed contract stage, and a revision increment. A material component-boundary or primary-action change may return any non-archived later stage to SCOPE. ARCHIVED is immutable and can be followed only by a linked successor job.

A successor job may not retain untouched initialization templates or stale predecessor revisions. At creation, hydrate cumulative predecessor artifacts required by the resume stage with the successor job ID and revision, preserve unaffected content with provenance, invalidate affected and downstream artifacts, reconcile approvals, and refresh the artifact registry before reporting the successor stage.

The response status stage must exactly match `job.stage` in the durable manifest after the transition command succeeds. If required predecessor artifacts, approvals, or transition evidence are missing, keep the current stage or record BLOCKED with its resume stage. Do not synthesize approval, skipped stages, or predecessor history from a scenario description.

Status: blocked requires `job.stage` to be `BLOCKED`, a numbered `job.resume_stage`, and a legal history entry produced by the transition command. If only a later handoff or approval gate is blocked, keep the current numbered stage and use an active or awaiting-user response status; do not overload the status word.

When the current stage cannot advance because mandatory external evidence, host capability, or permission is unavailable, no in-scope work remains, and recovery depends on the user or host, transition the durable job to BLOCKED with the current numbered stage as resume_stage. Awaiting-user applies when a bounded design choice or approval is recorded as open at the numbered stage, current-stage work can still continue, or the blocker belongs solely to a later downstream gate.

A finding that spans responsive, interaction, accessibility, or browser-plan ownership must update every affected artifact before advancing. Do not transition merely because one current-stage artifact is complete while another affected contract or test plan remains stale.

A bounded revision to a token-owned visual treatment returns to `TOKENS_GEOMETRY` when the approved direction, component boundary, hierarchy, geometry, behavior, and accessibility remain unchanged. Increment the revision, supersede the prior token decision, invalidate only affected token and downstream artifacts, and record missing replacement values as open token decisions without rolling back to DIRECTION_EXPLORATION.

An unresolved visual token choice that can be recorded as an open decision stays at `TOKENS_GEOMETRY` with an awaiting-user status instead of entering the special BLOCKED state.

Each stage below defines purpose; entry; inputs; actions; outputs; exit; blockers; backward transition; revision effect; and next stage.

## Workflow coverage table

| # | Stage | Primary input | Required output or gate | Forward target | Allowed backward target |
|---|---|---|---|---|---|
| 1 | DISCOVERY | User request and repository instructions | Manifest and initial brief | SCOPE | None |
| 2 | SCOPE | Problem and architecture | Complete component brief | REFERENCE_INTAKE | Restart only |
| 3 | REFERENCE_INTAKE | Supplied visual evidence | Inventoried references | REFERENCE_VALIDATION | SCOPE |
| 4 | REFERENCE_VALIDATION | Inventory and image metadata | Sufficiency decision | VISUAL_ANALYSIS | REFERENCE_INTAKE |
| 5 | VISUAL_ANALYSIS | Approved comparable evidence | Confidence-labeled visual audit | DIRECTION_EXPLORATION | REFERENCE_INTAKE or REFERENCE_VALIDATION |
| 6 | DIRECTION_EXPLORATION | Audit and product constraints | Decision-ready directions | DIRECTION_APPROVAL | VISUAL_ANALYSIS |
| 7 | DIRECTION_APPROVAL | Direction comparison | Explicit approved direction | COMPONENT_ANATOMY | DIRECTION_EXPLORATION or REFERENCE_VALIDATION |
| 8 | COMPONENT_ANATOMY | Approved direction and ownership evidence | One owner per region | STATE_CONTRACT | DIRECTION_EXPLORATION |
| 9 | STATE_CONTRACT | Anatomy and business states | Complete state matrix | RESPONSIVE_CONTRACT | COMPONENT_ANATOMY or DIRECTION_EXPLORATION |
| 10 | RESPONSIVE_CONTRACT | State matrix and viewport evidence | Region transformation contract | INTERACTION_ACCESSIBILITY | STATE_CONTRACT or COMPONENT_ANATOMY |
| 11 | INTERACTION_ACCESSIBILITY | Controls and transformations | Interaction and accessibility contracts | TOKENS_GEOMETRY | STATE_CONTRACT or RESPONSIVE_CONTRACT |
| 12 | TOKENS_GEOMETRY | Contracts and repository tokens | Owned tokens and stress cases | PROTOTYPE_OPTIONAL | Any affected contract stage |
| 13 | PROTOTYPE_OPTIONAL | Approved contracts and a high-risk question | Approved prototype or not-applicable reason | HANDOFF_ASSEMBLY | Affected contract stage |
| 14 | HANDOFF_ASSEMBLY | Approved contracts and ownership map | Complete implementation packet | HANDOFF_VALIDATION | Affected contract or direction stage |
| 15 | HANDOFF_VALIDATION | Packet and manifest | Validator pass and handoff approval | IMPLEMENTATION_AWAITED | HANDOFF_ASSEMBLY or affected contract stage |
| 16 | IMPLEMENTATION_AWAITED | Approved package | Returned implementation metadata | CHROME_QA_PREFLIGHT | HANDOFF_ASSEMBLY |
| 17 | CHROME_QA_PREFLIGHT | Implementation, route, fixture, Chrome capabilities | Deterministic default-profile preflight | CHROME_QA_EXECUTION | IMPLEMENTATION_AWAITED or HANDOFF_ASSEMBLY |
| 18 | CHROME_QA_EXECUTION | Browser plan and implementation | Separate gate evidence | VISUAL_REMEDIATION | CHROME_QA_PREFLIGHT |
| 19 | VISUAL_REMEDIATION | Measured QA failures | Owner-specific remediation and passing rerun | FINAL_APPROVAL or CHROME_QA_EXECUTION | Affected contract, handoff, or preflight |
| 20 | FINAL_APPROVAL | Passing gates or approved waivers | Explicit final approval and baselines | ARCHIVED | VISUAL_REMEDIATION or affected contract stage |
| 21 | ARCHIVED | Final approval, package, and baselines | Frozen record | None | None |

Special states preserve the current normal stage as resume_stage. PAUSED and BLOCKED may resume only there or transition to CANCELLED. A special state cannot transition directly to another special state.

## 1. DISCOVERY

- Purpose: establish the user problem and primary task.
- Entry: new job.
- Inputs: request, known product, repository instructions.
- Actions: separate facts, recommendations, assumptions, and unknowns.
- Outputs: design-job.yaml and initial component-brief.md.
- Exit: problem and intended user action are understandable.
- Blockers: missing repository or ambiguous product boundary.
- Backward: none.
- Revision: initial revision only.
- Next: SCOPE.

## 2. SCOPE

- Purpose: define component, product family, implementation mode, and non-goals.
- Entry: discovery is recorded.
- Inputs: business constraints and repository architecture summary.
- Actions: bound affected surfaces and merchant configurability.
- Outputs: completed component-brief.md.
- Exit: scope and non-goals are explicit.
- Blockers: requested change conflicts with business semantics.
- Backward: DISCOVERY only by restarting the job.
- Revision: unchanged.
- Next: REFERENCE_INTAKE.

## 3. REFERENCE_INTAKE

- Purpose: inventory the smallest useful current and target evidence set.
- Entry: scope is stable.
- Inputs: screenshots, URLs, files, prototypes.
- Actions: classify roles, provenance, state, viewport, and intended use.
- Outputs: screenshot-inventory.yaml and copied reference files.
- Exit: every supplied reference has a stable ID.
- Blockers: unreadable or inaccessible source.
- Backward: SCOPE when references reveal a different component boundary.
- Revision: increment if approved scope changes.
- Next: REFERENCE_VALIDATION.

## 4. REFERENCE_VALIDATION

- Purpose: determine what geometry and behavior can be inferred.
- Entry: inventory exists.
- Inputs: image metadata, capture context, counterpart mapping.
- Actions: inspect dimensions, crop, zoom, state, load completeness, and comparability.
- Outputs: inventory quality findings and recapture requests.
- Exit: references are sufficient or limitations are explicitly accepted.
- Blockers: incomparable evidence for an exact-match request.
- Backward: REFERENCE_INTAKE.
- Revision: unchanged unless approved references change.
- Next: VISUAL_ANALYSIS.

## 5. VISUAL_ANALYSIS

- Purpose: decompose current and target UI.
- Entry: usable references exist.
- Inputs: approved references and repository-observed semantics.
- Actions: analyze layout, geometry, type, surfaces, hierarchy, interaction, responsiveness, and accessibility.
- Outputs: visual-audit.md with confidence labels.
- Exit: gaps and invariant business behavior are explicit.
- Blockers: visual evidence cannot identify the requested state.
- Backward: REFERENCE_INTAKE or REFERENCE_VALIDATION.
- Revision: increment when approved reference set changes.
- Next: DIRECTION_EXPLORATION.

## 6. DIRECTION_EXPLORATION

- Purpose: propose materially different, behavior-equivalent directions.
- Entry: audit is complete.
- Inputs: visual findings, scope, copy, stress fixtures.
- Actions: create concepts or precise generation prompts and compare tradeoffs.
- Outputs: direction-comparison.md and direction artifacts.
- Exit: options are decision-ready.
- Blockers: insufficient product constraints or reference rights.
- Backward: VISUAL_ANALYSIS.
- Revision: increment when revisiting an approved direction.
- Next: DIRECTION_APPROVAL.

## 7. DIRECTION_APPROVAL

- Purpose: secure explicit design direction approval.
- Entry: comparison is decision-ready.
- Inputs: direction artifacts and recommendation.
- Actions: record approval, rejection, assumptions, and rationale.
- Outputs: locked-decisions.yaml and approval-record.yaml update.
- Exit: one direction is approved.
- Blockers: user has not approved a direction.
- Backward: DIRECTION_EXPLORATION or REFERENCE_VALIDATION.
- Revision: approval fixes the current revision; changed approval increments it.
- Next: COMPONENT_ANATOMY.

## 8. COMPONENT_ANATOMY

- Purpose: define named component regions and ownership.
- Entry: direction is approved.
- Inputs: approved direction and repository ownership evidence.
- Actions: map roots, repeated items, controls, feedback, overlays, scroll regions, and responsive replacements.
- Outputs: component-anatomy.md.
- Exit: every visible and interactive region has one owner.
- Blockers: architecture cannot be inspected or ownership conflicts.
- Backward: DIRECTION_EXPLORATION.
- Revision: increment when approved anatomy changes.
- Next: STATE_CONTRACT.

## 9. STATE_CONTRACT

- Purpose: select and define all applicable states.
- Entry: anatomy is complete.
- Inputs: component tree, business rules, state catalog.
- Actions: record trigger, data precondition, visible result, interactions, accessibility, viewport behavior, screenshot, assertion, and approval.
- Outputs: state-matrix.md.
- Exit: required state coverage is complete.
- Blockers: missing business-state semantics.
- Backward: COMPONENT_ANATOMY or DIRECTION_EXPLORATION.
- Revision: increment for changed approved state behavior.
- Next: RESPONSIVE_CONTRACT.

## 10. RESPONSIVE_CONTRACT

- Purpose: specify transformations at every required width.
- Entry: states are known.
- Inputs: anatomy, states, viewport matrix.
- Actions: define size, layout, order, visibility, replacement, scroll, sticky behavior, text, image, controls, spacing, safe areas, and overflow.
- Outputs: responsive-contract.md.
- Exit: every region has explicit breakpoint behavior.
- Blockers: unsupported viewport or missing mobile product semantics.
- Backward: STATE_CONTRACT or COMPONENT_ANATOMY.
- Revision: increment for approved transformation changes.
- Next: INTERACTION_ACCESSIBILITY.

## 11. INTERACTION_ACCESSIBILITY

- Purpose: define operable, perceivable interactions.
- Entry: state and responsive contracts exist.
- Inputs: controls, focus order, keyboard paths, announcements, motion.
- Actions: define semantics, names, focus, activation, errors, modal behavior, contrast risks, and reduced motion.
- Outputs: interaction-contract.md and accessibility-checklist.md.
- Exit: every interaction has semantic and keyboard requirements.
- Blockers: inaccessible behavior or unknown error semantics.
- Backward: STATE_CONTRACT or RESPONSIVE_CONTRACT.
- Revision: increment for approved interaction changes.
- Next: TOKENS_GEOMETRY.

## 12. TOKENS_GEOMETRY

- Purpose: convert evidence into implementable tokens and tolerances.
- Entry: contracts are stable.
- Inputs: computed evidence, repository tokens, merchant controls.
- Actions: classify source and confidence; distinguish exact values from recommendations.
- Outputs: design-tokens.json and content-stress-cases.yaml.
- Exit: geometry and configurable values have owners.
- Blockers: merchant token ownership is unknown.
- Backward: COMPONENT_ANATOMY through INTERACTION_ACCESSIBILITY.
- Revision: increment for approved token changes.
- Next: PROTOTYPE_OPTIONAL.

## 13. PROTOTYPE_OPTIONAL

- Purpose: resolve remaining high-risk interaction or layout ambiguity.
- Entry: contracts exist and a prototype has clear value.
- Inputs: locked contracts and stress fixtures.
- Actions: build an isolated semantic prototype without production imports or mutations.
- Outputs: prototype files and evidence, or a recorded not-applicable reason.
- Exit: prototype questions are resolved or stage is marked not-applicable.
- Blockers: prototype would duplicate production architecture or imply unapproved behavior.
- Backward: relevant contract stage.
- Revision: increment only if contracts change.
- Next: HANDOFF_ASSEMBLY.

## 14. HANDOFF_ASSEMBLY

- Purpose: produce an architecture-correct implementation packet.
- Entry: contracts are approved.
- Inputs: ownership map, artifacts, source-of-truth priority, test commands.
- Actions: define allowed and prohibited areas, acceptance, stopping, QA, risk, and rollback.
- Outputs: implementation-handoff.md, codex-task.md, acceptance-criteria.md, browser-test-plan.yaml.
- Exit: handoff contains no blocking ambiguity.
- Blockers: unresolved ownership, open decisions, missing state coverage.
- Backward: relevant contract or direction stage.
- Revision: increment if approved design changes.
- Next: HANDOFF_VALIDATION.

## 15. HANDOFF_VALIDATION

- Purpose: mechanically and semantically validate the packet.
- Entry: handoff artifacts exist.
- Inputs: manifest and handoff artifacts.
- Actions: run validate_handoff.py and resolve every blocking issue.
- Outputs: validation result and handoff approval.
- Exit: validator passes and user approves.
- Blockers: any validator error or absent approval.
- Backward: HANDOFF_ASSEMBLY or earlier contract stage.
- Revision: unchanged for clerical fixes; increment for design changes.
- Next: IMPLEMENTATION_AWAITED.

## 16. IMPLEMENTATION_AWAITED

- Purpose: preserve approved intent while implementation happens separately.
- Entry: handoff approved.
- Inputs: package path, implementation owner, branch, and eventual commit.
- Actions: wait, answer contract questions, record authorized clarifications.
- Outputs: implementation return metadata.
- Exit: implementation branch or artifact is available.
- Blockers: implementation absent or materially diverges from handoff.
- Backward: HANDOFF_ASSEMBLY when clarification changes the contract.
- Revision: increment for approved contract changes.
- Next: CHROME_QA_PREFLIGHT.

## 17. CHROME_QA_PREFLIGHT

- Purpose: establish deterministic, safe browser conditions.
- Entry: implementation returned.
- Inputs: route, fixture, environment, actual exposed Chrome tools.
- Actions: detect capability; confirm the connected default profile; verify no isolated context is used; establish server, viewport, zoom, locale, currency, flags, fonts, images, and evidence paths.
- Outputs: preflight section in browser-test-report.md and manifest QA fields.
- Exit: preflight_status is passed.
- Blockers: Chrome MCP unavailable, default profile authentication missing, server failure, missing fixture.
- Backward: IMPLEMENTATION_AWAITED or HANDOFF_ASSEMBLY.
- Revision: unchanged unless implementation or contract changes.
- Next: CHROME_QA_EXECUTION.

## 18. CHROME_QA_EXECUTION

- Purpose: execute semantic, visual, geometry, responsive, console, network, accessibility, performance, and non-regression checks.
- Entry: preflight passed.
- Inputs: browser-test-plan.yaml and deterministic implementation.
- Actions: drive every required state and viewport, capture fresh evidence, compare baselines.
- Outputs: case result JSON, screenshots, logs, traces, diffs, browser-test-report.md, visual-qa-report.md.
- Exit: all mandatory cases pass or produce remediation.
- Blockers: infrastructure failure, product failure, unstable evidence.
- Backward: CHROME_QA_PREFLIGHT.
- Revision: unchanged for retries; implementation revision recorded when code changes.
- Next: VISUAL_REMEDIATION.

## 19. VISUAL_REMEDIATION

- Purpose: turn measured gaps into bounded correction instructions.
- Entry: QA produced failures or differences.
- Inputs: assertions, screenshots, diffs, console, network, and trace evidence.
- Actions: classify root owner, expected delta, tolerance, risk, and retest scope.
- Outputs: remediation-list.md and revised handoff when needed.
- Exit: failures are corrected and rerun, or explicitly waived.
- Blockers: missing owner, unapproved behavior change, implementation unavailable.
- Backward: relevant contract, HANDOFF_ASSEMBLY, or CHROME_QA_PREFLIGHT.
- Revision: increment for design changes, not implementation-only corrections.
- Next: FINAL_APPROVAL after a passing rerun; otherwise CHROME_QA_EXECUTION.

## 20. FINAL_APPROVAL

- Purpose: obtain explicit acceptance of design and implementation evidence.
- Entry: all mandatory QA gates, including Lighthouse and non-regression, pass or have complete approved waivers in the reconciled browser artifact summary.
- Inputs: reconciled browser artifact summary, final reports, baselines, unresolved-risk statement.
- Actions: record approver, timestamp, scope, waivers, and baseline paths.
- Outputs: approval-record.yaml and saved baselines.
- Exit: final approval is recorded.
- Blockers: any failed, blocked, missing, contradictory, or unapproved gate; absent Lighthouse result; absent baseline.
- Backward: VISUAL_REMEDIATION or an affected contract stage.
- Revision: increment if approval changes the design.
- Next: ARCHIVED.

## 21. ARCHIVED

- Purpose: freeze the approved record for future regression and resume context.
- Entry: complete final approval exists and the reconciled browser artifact summary is approved.
- Inputs: manifest, existing handoff package, reconciled QA evidence, and existing immutable baseline files.
- Actions: validate references and record archive location.
- Outputs: archived status and immutable history.
- Exit: terminal.
- Blockers: missing package, approval, or baseline.
- Backward: none. Create a linked successor job for further work; never mutate the archived manifest, approvals, package, or baselines.
- Revision: final.
- Next: none.

## Special states

- PAUSED: voluntary interruption. Record resume_stage and reason. Resume only at that stage.
- BLOCKED: required evidence, capability, permission, or product decision is unavailable. Record exact recovery action.
- CANCELLED: terminal for this job. Preserve artifacts and history; do not delete evidence.
