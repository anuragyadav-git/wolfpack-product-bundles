---
schema_version: 1
id: storefront-design-director-evals
title: Storefront Design Director Evals and Regression Suite
type: test-spec
status: active
summary: Defines deterministic coverage for skill invocation, workflow quality, rubric enforcement, and honest model-run reporting.
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
related_docs:
  - .agents/skills/storefront-design-director/EVAL_REPORT.md
tags:
  - eval
  - regression
keywords:
  - invocation
  - workflow-quality
---

# Test Spec: Storefront Design Director Evals and Regression Suite

**Spec ID:** storefront-design-director-evals  **Created:** 2026-08-04

## Purpose

Prove that the skill ships a complete, machine-readable evaluation corpus and a deterministic runner that never represents missing model or Chrome evidence as a pass.

## Test Cases

### EvalSuiteContractTests

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parse all eval data | Every JSON and JSONL eval file | Every non-empty row parses and carries the required schema | Deterministic |
| 2 | Cover invocation decisions | Invocation corpus | At least 13 should-invoke, 11 should-not-invoke, and 7 ambiguous cases | Covers every prompt-pack example |
| 3 | Handle ambiguous prompts | Every ambiguous invocation case | Expected behavior requires one minimal scoping question or a correct defer decision | Never silently assumes scope |
| 4 | Cover workflow regressions | Workflow corpus | Exactly the 30 required numbered scenarios with stages, references, checks, artifacts, severity, and execution mode | Deterministic corpus validation |
| 5 | Enforce concrete checks | Rubric contract | Every prompt-pack concrete check is machine-readable | Missing evidence cannot pass |
| 6 | Enforce qualitative scoring | Rubric contract | All 12 dimensions use a 1–5 scale with explicit passing thresholds | Human/model grading remains separate |
| 7 | Enforce critical failures | Rubric contract | All 10 critical-failure conditions fail the run regardless of aggregate score | Safety gate |
| 8 | Execute deterministic runner | Valid eval corpus | Runner exits zero and writes JSON plus Markdown summaries | No external dependencies |
| 9 | Report model-dependent coverage honestly | No model result input | Every model-dependent case is listed as unexecuted, never passed | No fabricated model grades |
| 10 | Reject incomplete model results | Malformed or partial result rows | Runner exits non-zero or reports the affected case invalid/blocked | Evidence discipline |
| 11 | Preserve design-director boundary | Skill contract | Direct production edit requests are deferred to a separate implementation task | No production mutation |
| 12 | Publish rerun evidence | Completed local rerun | EVAL_REPORT records baseline, fixes, rerun results, unexecuted cases, and risks | Required final artifact |
| 13 | Submit a Codex-compatible response schema | `model-response.schema.json` | Schema uses only response-format keywords accepted by the current Codex model service | Prevents pre-execution 400 errors |
| 14 | Route vague prompts before activating the skill | Ambiguous invocation contract | One question names the missing decision and no design-job status is claimed before storefront design or QA scope is established | Prevents false activation and under-specified routing |
| 15 | Score negative routing by non-invocation | Every should-not-invoke case | Either `defer` or `not_applicable` passes when the skill stays inactive and no artifact is mutated | Avoids treating two safe routing labels as different outcomes |
| 16 | Keep response stage aligned with durable state | Active design job with missing predecessor evidence | Response status exactly matches the manifest; no approval or stage history is synthesized | Regression from measured-remediation model grading |
| 17 | Bound remediation while ownership is unresolved | Measured failure without production ownership evidence | Record outcome, constraints, risk, and rerun scope without prescribing a CSS or JavaScript mechanism | Prevents ownership-free high-specificity patches |
| 18 | Persist special blocked state | Response reports `Status: blocked` | Manifest stage is `BLOCKED`, resume stage is valid, and transition history records the block | Prevents status and durable-stage drift |
| 19 | Describe partial model execution honestly | Valid results for only some model-dependent cases | Summary names the exact unexecuted count without claiming all model quality is unmeasured | Keeps rerun evidence and remaining gaps distinct |
| 20 | Persist a current-stage external blocker | Mandatory external evidence, host capability, or permission is unavailable and no in-scope work remains | Job transitions to `BLOCKED`, records the numbered resume stage, and gives the exact recovery action | Prevents preflight blockers from being mislabeled as ordinary awaiting-user state |
| 21 | Keep unobserved responsive recommendations at the contract gate | Desktop is approved but mobile screenshot evidence is absent | Recommendations are labeled, persisted as assumptions or decisions, and remain at `RESPONSIVE_CONTRACT` until approved or delegated | Prevents recommendations from being treated as approved observations |
| 22 | Reconcile cross-contract findings before transition | A responsive defect also affects interaction, accessibility, or browser-plan behavior | Every affected artifact is updated before the job advances | Prevents a complete responsive draft from leaving stale downstream contracts |
| 23 | Reopen bounded token-only revisions at the earliest owner | An approved visual treatment changes while direction, geometry, hierarchy, behavior, and accessibility remain fixed | Revision returns to `TOKENS_GEOMETRY`, supersedes the old token, and preserves unaffected decisions | Prevents needless rollback to direction exploration |
| 24 | Distinguish an open token decision from an external blocker | Replacement visual token value is not yet supplied but can be recorded as a bounded open decision | Job remains at `TOKENS_GEOMETRY` with awaiting-user status instead of entering special `BLOCKED` | Preserves the corpus stage while keeping missing values explicit |
| 25 | Reconcile measured failures before remediation | Raw browser evidence contradicts a durable passed gate | Case result, reports, summary, manifest QA fields, and approval state all record failure before remediation | Prevents blocked or failed evidence from coexisting with a false durable pass |
| 26 | Prefer fixture stabilization over masking | A dynamic image is the only pixel difference | Stable fixture data and media are attempted first; a narrow approved mask is only a last resort and requires a rerun | Avoids normalizing avoidable visual noise |
| 27 | Hydrate successor artifacts at the successor revision | An archived job creates a linked successor at an affected contract stage | Required predecessor artifacts carry successor metadata and provenance; affected/downstream artifacts and approvals are invalidated without stale templates | Prevents semantically empty revision-1 files in later-stage successors |
| 28 | Reserve routing labels for invocation evals | Workflow or browser model execution has already invoked the skill | Response schema requires `not_applicable`; `ask_minimal_scope`, `defer`, and `invoke` remain invocation-suite decisions | Prevents an active durable workflow from being mislabeled as pre-invocation routing |
| 29 | Report complete model execution accurately | Model summary has zero unexecuted cases and one or more blocked results | Markdown says every case executed while preserving blocked and failed outcomes | Prevents completed execution from being described as still unexecuted |
| 30 | Separate workflow outcome from evaluation status | A case correctly returns a blocked workflow outcome and satisfies every applicable check | Evaluation status is passed while workflow outcome remains blocked | A correct refusal or evidence block is not an evaluator failure |
| 31 | Derive status from evidence | A result claims passed but has a failed required expectation | Evaluation status is failed | Never trust a supplied status label |
| 32 | Enforce per-run rubric thresholds | Applicable scores miss mean, minimum-dimension, or critical-dimension thresholds | Evaluation status is failed with threshold reasons | Rubric is a release gate, not report-only data |
| 33 | Exclude non-applicable dimensions | A routing case scores applicable dimensions at passing values and unrelated dimensions below threshold | Only declared applicable dimensions affect the run and aggregate | Prevents workflow-only criteria from distorting routing evals |
| 34 | Require exact expectation coverage | A grade omits or duplicates a case-required expectation | Result is rejected as invalid evidence | Missing checks cannot disappear from the denominator |
| 35 | Require exact critical-failure coverage | A grade omits or duplicates a rubric critical-failure ID | Result is rejected as invalid evidence | Every critical condition is evaluated exactly once |
| 36 | Enforce suite routing labels | Workflow or browser result uses an invocation-suite routing label | Result is rejected | Active workflows use `not_applicable` |
| 37 | Reject duplicate result keys | Two rows share case ID, configuration, and run number | Corpus validation fails | Input order cannot select the winner |
| 38 | Use strict release zeros | Any current result is failed, evaluator-blocked, invalid, unexecuted, critical, or threshold-failed | Overall status is not passed and CLI exits nonzero | PASS is a complete release gate |
| 39 | Keep baseline non-gating | Current skill is clean while old-skill comparison fails | Overall status passes and old failures remain visible | Historical regression evidence cannot block the fixed skill |
| 40 | Treat routing-only invocation checks separately | Invocation route is correct but downstream workflow artifacts are not produced by the read-only harness | Invocation eval passes and moved assertions remain registered as workflow follow-ups | Tests invocation reliability without weakening workflow coverage |
| 41 | Scope browser rubric dimensions to observable work | Browser QA case corpus | Each case declares only the qualitative dimensions its prompt can exercise; ownership and performance-specific dimensions remain required where relevant | Prevents unrelated workflow criteria from distorting focused browser gates |
| 42 | Reject incomplete suite execution metadata | Invocation or browser corpus row omits routing mode, follow-ups, or applicability metadata | Deterministic validation fails before model results are summarized | Corpus unit tests and the release runner enforce the same contract |
| 43 | Regrade saved evidence without rewriting outcomes | Historical result rows use the prior mixed routing/workflow contract | A one-time normalizer preserves responses, statuses, scores, and critical evidence; emits exact current expectation IDs; and uses `not_applicable` outside invocation | Makes the corrected gate auditable and repeatable |
| 44 | Gate the checked-in latest evidence as a release corpus | `evals/results/latest/model-results.jsonl` | Latest current runs cover all 74 cases and derive 74 passes, strict-zero failures, and overall release PASS while old-skill failures remain visible and non-gating | Prevents report text from drifting away from executable evidence |
| 45 | Keep the compatibility catalog synchronized | Canonical invocation, workflow, and browser JSONL corpora | `evals/evals.json` exactly equals the deterministic catalog built from current cases | Prevents legacy skill-creator inputs from silently grading stale checks |

## Acceptance Criteria

- [x] All listed test cases pass.
- [x] The invocation corpus contains at least 31 cases and all required categories.
- [x] The workflow corpus contains all 30 required scenarios.
- [x] The deterministic runner validates JSONL and emits an eval summary.
- [x] Model-dependent scenarios without recorded output remain unexecuted.
- [x] Every critical or high-severity deterministic failure is fixed and rerun.
- [x] Evaluation status is derived from exact applicable evidence rather than copied from a model or grader label.
- [x] Overall PASS requires zero current failures, evaluator blockers, invalid rows, unexecuted cases, critical failures, and rubric-threshold failures.
- [x] Browser cases declare an explicit, non-empty applicability profile matched to the evidence their prompts can produce.
- [x] No production storefront code is modified.
