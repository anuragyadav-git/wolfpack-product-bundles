---
schema_version: 1
id: storefront-design-director-conversational-guidance
title: Conversational Guidance
type: skill-reference
status: active
summary: Keeps design conversations focused, evidence-labeled, decision-oriented, and resumable.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/conversational-guidance.md
related_docs:
  - .agents/skills/storefront-design-director/SKILL.md
tags:
  - conversation
keywords:
  - design-decision
  - status-block
---

# Conversational Guidance

## Evidence labels

Prefix material claims in artifacts with one of:

- User-provided fact: explicitly stated by the user.
- Screenshot-observed fact: visible in an identified image and state.
- Repository-observed fact: found in current repository instructions, docs, graph, or source.
- Recommendation: a proposed design choice with rationale.
- Assumption: a reversible default used because a non-blocking detail is absent.

An assumption cannot become locked without user approval or direct evidence.

## Question selection

Ask no more than three questions. Rank candidates by:

1. Does the answer change business behavior, accessibility, data semantics, or component ownership?
2. Does it unblock the current stage exit?
3. Would a wrong answer cause expensive downstream rework?
4. Can the repository, screenshots, or existing artifacts answer it instead?

Ask the highest-ranked unanswered questions only. Include a recommended answer and one-sentence rationale for each actual choice. Do not ask for confirmation of a fact already established.

## Guided progression

Show the mandatory status block first. Then:

1. State what changed since the previous turn.
2. Separate evidence from recommendation.
3. Present the smallest useful artifact or decision.
4. Ask the next gate questions.
5. Persist answers, decisions, assumptions, and affected artifacts.

Avoid reciting all 21 stages. Mention the next gate and any blocker.

## Decision records

Each decision has stable ID, question, options considered, recommendation, selected value, rationale, evidence IDs, status, approver, approval time, revision, and affected artifacts.

After a user response, summarize newly locked decisions and open questions. "Use your recommendation" locks the recommendations presented in that turn only.

## Standing recommendation delegation

If the user explicitly delegates future noncritical choices, record a bounded `recommendation_delegation` in the manifest: status, named scope, exclusions, approver, approval time, and expiry stage. Apply it only to reversible design choices inside that scope. It never authorizes assumptions about business behavior, accessibility, data semantics, approval scope, production mutation, or a mandatory explicit approval gate. Surface each applied recommendation in the next status update so the user can revise it.

## Interruption and resume

Before pausing, save the current objective, incomplete action, resume stage, missing evidence, and next exact action. On resume, validate the manifest and restate only current status and next gate. Do not repeat settled questions.

When the user changes an approved decision:

1. Mark the old decision superseded without deleting it.
2. Increment job revision.
3. Identify every affected contract, direction artifact, handoff section, baseline, and QA case.
4. Move to the earliest affected stage.

If the component boundary or primary user action changes, SCOPE is the earliest affected stage. If the source job is ARCHIVED, leave it frozen and create a linked successor job that records the predecessor job ID and revision, then resume at the earliest affected stage in the successor.

## Blocking language

Name the blocking condition, why it matters, evidence already preserved, and one exact recovery action. Distinguish product failure from infrastructure failure. Never soften a blocked gate into "mostly passed."
