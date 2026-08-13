---
schema_version: 1
id: storefront-design-director-eval-rubric
title: Storefront Design Director Eval Rubric
type: skill-eval
status: active
summary: Defines concrete workflow checks, twelve scored quality dimensions, passing thresholds, and critical failures.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - skill-evaluation
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/evals/rubric.json
related_docs:
  - .agents/skills/storefront-design-director/evals/evals.json
tags:
  - eval
keywords:
  - triggering
  - workflow-quality
---

# Eval Rubric

`rubric.json` is the machine-readable source of truth. This file is its reviewer guide.

## Concrete checks

Every run checks invocation, the mandatory status block, current stage, question limit, recommendations, artifact updates, transition legality, blocking evidence, required references, the production-code boundary, Chrome gate behavior, false passes, and required output paths.

Every required concrete check must appear exactly once and pass. Missing, duplicated, or contradictory grading evidence makes the evaluation invalid or failed; it never disappears from the denominator.

## Evaluation status and workflow outcome

`result.status` records the product-workflow outcome. The runner derives evaluation status independently from exact expectations, applicable qualitative thresholds, critical failures, and executor success. A correct refusal, preflight block, or product QA failure can therefore be an evaluation pass while its workflow outcome remains `blocked`.

Only missing evaluator capability or evidence prevents the evaluation itself from completing. Do not count a correctly blocked product workflow as an evaluator blocker.

## Qualitative scoring

Score each dimension from 1 through 5:

- Design reasoning quality
- Completeness without overwhelming the user
- Evidence discipline
- Responsive rigor
- State coverage
- Accessibility rigor
- Repository ownership reasoning
- Handoff implementability
- Browser test specificity
- Remediation precision
- Recovery from incomplete inputs
- Consistency across turns

A passing run needs an applicable-dimension mean of at least 4, no applicable dimension below 3, and at least 4 in every applicable critical dimension named by `rubric.json`.

Invocation routing cases declare the three routing dimensions. Focused browser cases declare prompt-specific applicability profiles. Workflow cases exercise the complete end-to-end rubric. All twelve scores remain present in result rows, but non-applicable dimensions do not distort run or aggregate thresholds.

## Critical failures

Any critical failure fails the run regardless of aggregate score: unsupported Chrome pass, production edits in design-director mode, skipped direction approval, omitted state or responsive contracts, repeated settled questions, blocked evidence reported as passed, lost resume state, unmeasured remediation, ownership-free high-specificity patches, or exposure of secrets and personal browser data.

Critical and high-severity failures must be fixed and rerun before the suite can be reported complete.

## Release gate

Current-skill PASS requires complete 74-case coverage and strict zeros for failed, evaluator-blocked, invalid, unexecuted, critical, and threshold-failed results, plus passing aggregate applicable thresholds. Historical `old_skill` results are comparison evidence only and cannot block a clean current release.
