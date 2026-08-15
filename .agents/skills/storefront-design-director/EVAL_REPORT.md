---
schema_version: 1
id: storefront-design-director-eval-report
title: Storefront Design Director Eval Report
type: skill-eval-report
status: active
summary: Records the completed passing regression suite, strict release gate, direct Chrome evidence, and remaining non-gating risks.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - skill-evaluation
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/evals
  - .agents/skills/storefront-design-director/scripts/run_skill_evals.py
  - .agents/skills/storefront-design-director/tests
related_docs:
  - .agents/skills/storefront-design-director/evals/runbook.md
tags:
  - eval
  - regression
keywords:
  - invocation-precision
  - workflow-quality
---

# Storefront Design Director Eval Report

## Outcome

The release gate is passed.

- Deterministic status: passed
- Model status: passed
- Overall status: passed
- Current evaluation results: 74 passed, 0 failed, 0 evaluator-blocked, 0 invalid, 0 unexecuted, 0 critical, and 0 threshold-failed
- Aggregate rubric mean: 4.373 with no aggregate threshold failure

Evaluation status is derived from evidence rather than copied from the product-workflow outcome. Fourteen current responses correctly retain a blocked workflow outcome while still passing evaluation because they made the expected routing, refusal, or QA-gate decision.

No production storefront source, deployment, live order, secret, cookie, or personal browser data was changed or captured.

## Baseline

Before this eval expansion, 65 skill tests passed. The invocation corpus contained 8 cases, the workflow corpus contained 8 cases, and there was no complete machine rubric, strict release runner, paired model evidence, or final report.

The current corpus contains:

- 37 invocation cases: 17 should-invoke, 13 should-not-invoke, and 7 ambiguous
- All 30 required workflow scenarios
- 7 focused browser-QA cases
- 13 concrete checks
- 12 qualitative dimensions
- 10 critical-failure conditions

The retained old-skill comparison derives 47 passes and 27 failures across the same 74 cases. Those failures remain visible but do not gate the fixed current skill.

## Invocation precision and recall

All 30 binary invocation cases executed:

- True positives: 17
- False positives: 0
- False negatives: 0
- True negatives: 13
- Precision: 1.0000
- Recall: 1.0000

All 7 ambiguous cases passed separately. Invocation cases now use a routing-only contract; downstream artifact and browser assertions remain registered under workflow follow-ups instead of being misclassified as invocation blockers.

## Scenario results

| Suite | Current passed | Current failed | Old passed | Old failed |
|---|---:|---:|---:|---:|
| Invocation | 37 | 0 | 30 | 7 |
| Workflow | 30 | 0 | 12 | 18 |
| Browser QA | 7 | 0 | 5 | 2 |
| Total | 74 | 0 | 47 | 27 |

Current product-workflow outcomes are 60 passed and 14 blocked. The blocked outcomes comprise 11 routing cases that correctly awaited downstream workflow evidence and 3 browser cases that correctly withheld product approval.

## Direct Chrome and SIT evidence

A fresh SIT full-page bundle was created after the database refresh:

- Store: agent-5sfidg3m
- Bundle: SDD Eval FPB 2026-08-04
- Bundle ID: cmse8sp170000v0ytaqqzsvtw
- Fixture: one step, one category, six products, FBP_SIDE_FOOTER with STANDARD

The canonical storefront route rendered successfully after a final cache-bypassing queryless reload. One earlier queryless reload returned a transient Shopify app-proxy 500; the bundle JSON endpoint and a cache-busted document probe remained 200, and the final canonical reload recovered without source or deployment changes.

Direct Chrome DevTools MCP evidence covered 1280x800 desktop and 390x844 mobile:

- Selected-card height delta: 0px at both viewports on the refreshed fixture
- Mobile add-button focus outline: visible and not clipped
- Mobile selected quantity-control focus outline: visible and not clipped
- Canonical ownership resolved to the shared product-card, focus, and Standard preset source CSS

The supplied measured-remediation case still preserves its exact-build +8px and clipped-focus failures. Fresh non-reproduction does not erase supplied failing evidence, so the product workflow remains blocked until that exact build is available.

Two raw mobile performance traces were saved under the Chrome MCP process temp root:

- Candidate: CLS 0.3139, LCP 7814ms
- Repeat baseline: CLS 0.0006, LCP 12631ms

Both are labeled lab-only; no CrUX field data was available. Chrome's CLS insight identified no potential root cause in either trace. The evaluation passes because trace use, CLS investigation, labeling, baseline, and trace persistence all succeeded; product approval remains blocked on the bad candidate and high cross-run variance.

Sanitized evidence is stored in evals/results/latest/browser-evidence/sit-fpb-2026-08-04.json. No investigation screenshot was committed.

## Rubric scores

Thresholds apply only to dimensions declared applicable by each case.

| Dimension | Mean | Critical dimension |
|---|---:|---|
| Accessibility rigor | 4.065 | Yes |
| Browser test specificity | 4.333 | Yes |
| Completeness without overwhelming | 4.552 | No |
| Consistency across turns | 4.452 | No |
| Design reasoning quality | 4.067 | No |
| Evidence discipline | 4.784 | Yes |
| Handoff implementability | 4.067 | No |
| Recovery from incomplete inputs | 4.527 | No |
| Remediation precision | 4.273 | No |
| Repository ownership reasoning | 4.129 | Yes |
| Responsive rigor | 4.152 | Yes |
| State coverage | 4.097 | Yes |

The aggregate mean is 4.373. Every dimension mean and every critical-dimension mean passes.

## Critical failures

The current configuration has zero critical failures.

The old-skill comparison retains two:

- workflow-09: blocked-evidence-passed
- workflow-20: ownership-free-specific-patch

## Fixes applied

- Separated derived evaluation status from the preserved product-workflow outcome.
- Made exact expectation coverage, exact critical-failure coverage, suite routing labels, result-key uniqueness, executor success, and rubric thresholds executable gates.
- Added explicit applicability profiles so routing-only and focused browser cases are not distorted by unrelated workflow dimensions.
- Converted invocation cases to routing_only, preserved moved assertions as workflow_followups, and corrected controlled-alternatives intent.
- Enforced strict-zero release rules and nonzero exits for incomplete or failed runs.
- Kept old-skill failures visible but non-gating.
- Added a one-time, tested evidence normalizer that preserves raw outcomes while regrading against the corrected contracts.
- Added direct-Chrome evidence for canonical ownership, desktop/mobile geometry, keyboard focus, CLS investigation, baseline comparison, and persisted raw traces.
- Synchronized the compatibility catalog and added a deterministic test that the checked-in latest evidence itself derives 74 of 74 passes.

No production storefront code was modified.

## Rerun results

- Deterministic Python tests: 117 passed
- Focused eval-contract tests: 27 passed
- Model evidence rows: 150 valid rows, covering 74 current cases and 74 old-skill comparison cases; two current browser cases have a newer direct-Chrome run
- Current workflow evaluations: 30 passed
- Current invocation evaluations: 37 passed; precision 1.0 and recall 1.0
- Current browser evaluations: 7 passed
- Current total: 74 passed, 0 failed, 0 evaluator-blocked, 0 unexecuted, 0 invalid, 0 critical, 0 threshold-failed
- Runner exit: 0

The normalized evidence is stored in evals/results/latest/model-results.jsonl; the generated JSON and Markdown summaries are stored beside it.

## Unexecuted cases

None. All 74 current cases and all 74 old-skill comparison cases executed.

## Remaining risks

- This remains one model run per configuration for most cases, not the three runs needed for a stable variance benchmark.
- Fourteen product-workflow outcomes remain blocked by design; an evaluation PASS is not a product approval.
- The two raw Chrome traces live in the MCP process temp directory and may not survive host cleanup. Their paths, sizes, hashes, and derived metrics are preserved in the sanitized evidence manifest.
- The mobile performance evidence is highly variable and includes one bad CLS run. It needs a stable reproduction before any source remediation or product approval.
- Historical raw executor transcripts remain in temporary directories; normalized grades and final summaries are durable in the skill results directory.
