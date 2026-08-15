---
schema_version: 1
id: storefront-design-director-eval-runbook
title: Storefront Design Director Eval Runbook
type: skill-eval
status: active
summary: Runs deterministic skill regressions and defines isolated Codex execution, grading, comparison, and review without false passes.
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
keywords:
  - benchmark
  - codex-exec
---

# Eval Runbook

## Deterministic run

From the repository root:

~~~bash
python3 -m unittest discover -s .agents/skills/storefront-design-director/tests -p 'test_*.py'
python3 .agents/skills/storefront-design-director/scripts/run_skill_evals.py \
  --skill-root .agents/skills/storefront-design-director \
  --output-dir .agents/skills/storefront-design-director/evals/results/latest
~~~

The first command covers scripts, safety contracts, the checked-in release evidence, and catalog synchronization. The second validates every JSONL row, category count, all 30 workflow IDs, the machine rubric, cross-suite case IDs, exact expectation coverage, exact critical-failure coverage, applicability profiles, unique result keys, and the strict release gate. It writes `eval-summary.json` and `eval-summary.md`.

Without `--model-results`, deterministic status may pass while model status remains `not_run` and overall status remains `incomplete`. Never reinterpret that result as a model or Chrome pass.

Use `--sync-catalog` only after intentionally editing the canonical JSONL files. It mechanically rebuilds `evals/evals.json` for skill-creator compatibility.

The CLI exit contract is strict: `0` means overall PASS, `1` means incomplete or failed release evidence, and `2` means malformed corpus or result evidence.

## Current Codex mechanism

This Codex CLI has no dedicated `eval` subcommand. The supported primitive is `codex exec`. Run every case in a disposable repository, never in the live worktree. Use a copy containing the repository instructions and current skill for `with_skill`; use the same scratch content without this skill for `without_skill`. For regression comparisons, preserve the pre-change skill snapshot as `old_skill`.

Read-only invocation case:

~~~bash
codex exec \
  -C "$CASE_REPO" \
  --model gpt-5.6-sol \
  --sandbox read-only \
  --ephemeral \
  --ignore-user-config \
  -c 'approval_policy="never"' \
  --output-schema "$RESULT_SCHEMA" \
  --json \
  --output-last-message "$RUN_DIR/final.json" \
  - \
  < "$RUN_DIR/prompt.txt" \
  > "$RUN_DIR/events.jsonl" \
  2> "$RUN_DIR/stderr.log"
~~~

Set `RESULT_SCHEMA` to `evals/model-response.schema.json`. Prefix the case prompt with its case ID and require the final JSON to repeat that ID. Save the CLI version, model, exit code, wall duration, token count, final response path, and artifact list separately; do not ask the tested model to grade itself.

Use `invoke`, `defer`, or `ask_minimal_scope` only for invocation-suite routing. A workflow or browser-QA case has already activated the skill, so its normalized `invocation_decision` must be `not_applicable`.

Invocation cases use `execution_mode: routing_only`. Grade only routing checks in `expected_checks`; downstream artifact or browser assertions remain traceable under `workflow_followups` and execute in the workflow or browser suites. A correct invocation may lead to a blocked product workflow and still pass the invocation evaluation.

Artifact-writing workflow cases may use `--sandbox workspace-write` only inside a disposable per-case repository with synthetic inputs. Never use a bypass flag, live merchant data, the live worktree, search, browser connectors, or shared personal Chrome state for model eval execution.

## Run layout

Use one directory per descriptive case and configuration:

~~~text
storefront-design-director-workspace/
  skill-snapshot/
  iteration-1/
    eval-<case-name>/
      eval_metadata.json
      with_skill/run-1/
        outputs/
        grading.json
        timing.json
      without_skill/run-1/
        outputs/
        grading.json
        timing.json
~~~

Run with-skill and baseline cases in the same batch. Use three runs per configuration before generating a variance benchmark. The installed skill-creator aggregator reports three runs per configuration, so do not use it for one-run data.

## Independent grading

Grade the saved response, event log, and artifact diff against the case’s exact expected IDs and `rubric.json`. Derive evaluation status from evidence; never copy `result.status`. That field records the product-workflow outcome and may correctly be `blocked` while the evaluation passes. `grading.json.expectations` uses exactly:

~~~json
{"text":"status_block_present","passed":true,"evidence":"final response lines 1 through 10"}
~~~

Score all twelve qualitative dimensions from 1 through 5 for schema stability. Apply thresholds only to the case’s declared `applicable_dimensions`; low non-applicable scores remain visible but non-gating. Record every critical failure exactly once as `{id, present, evidence}`. Normalize each finished run into one JSONL row with:

- `case_id`, `configuration`, and positive `run_number`
- `executor`: model, Codex CLI version, exit code, duration milliseconds, and total tokens
- `result`: status, invocation decision, response file, and artifact files
- `grading`: expectations, all qualitative scores, and all evaluated critical failures

Then run:

~~~bash
python3 .agents/skills/storefront-design-director/scripts/run_skill_evals.py \
  --skill-root .agents/skills/storefront-design-director \
  --output-dir .agents/skills/storefront-design-director/evals/results/model-run \
  --model-results /absolute/path/to/model-results.jsonl
~~~

Invocation precision and recall are computed only when every binary invocation case has a recorded with-skill result. The seven ambiguous cases are excluded from binary precision and recall and reviewed for one-question routing accuracy.

For a one-time migration from the earlier mixed routing/workflow grading contract, write to a new path first and review the diff:

~~~bash
python3 .agents/skills/storefront-design-director/scripts/normalize_eval_results.py \
  --skill-root .agents/skills/storefront-design-director \
  --input /absolute/path/to/old-model-results.jsonl \
  --output /absolute/path/to/regraded-model-results.jsonl
~~~

The normalizer preserves raw responses, product-workflow statuses, qualitative scores, and critical evidence. It only emits the current exact expectation set and normalizes non-invocation routing labels to `not_applicable`.

## Direct Chrome browser lane

Browser cases that require rendered ownership evidence, measured geometry, focus clipping, or performance traces must run through direct Chrome DevTools MCP against a deterministic non-production fixture. Use the connected default Chrome profile, omit `isolatedContext`, keep unrelated tabs untouched, clear Cache Storage, and hard reload with cache ignored before each desktop and mobile pass.

For storefront QA, record both 1280x800 desktop and 390x844 mobile evidence. Label performance data as lab evidence unless field data is independently available. Save raw traces through the MCP recorder; on macOS, file-writing is restricted to the MCP process temp root when the client does not negotiate workspace roots. Record the trace path, byte size, and SHA-256 in a durable sanitized evidence manifest. Never commit investigation screenshots.

A browser case passes evaluation when every expected check, applicable threshold, and critical gate passes. Its product-workflow outcome can remain blocked when the observed product regression or evidence variance still prevents approval.

## Benchmark and human review

After three runs for every selected configuration, use the installed skill-creator scripts:

~~~bash
python3 -m scripts.aggregate_benchmark "$EVAL_WORKSPACE/iteration-1" --skill-name storefront-design-director
python3 "$SKILL_CREATOR_ROOT/eval-viewer/generate_review.py" \
  "$EVAL_WORKSPACE/iteration-1" \
  --skill-name storefront-design-director \
  --benchmark "$EVAL_WORKSPACE/iteration-1/benchmark.json" \
  --static "$EVAL_WORKSPACE/iteration-1/review.html"
~~~

Set `SKILL_CREATOR_ROOT` to the installed `skill-creator` directory and run the first command from that directory so its `scripts` module resolves. Generate no benchmark or viewer when there are no model outputs; that would fabricate review evidence.

## Failure handling

- Invalid JSON or JSONL: fix the corpus; no cases execute.
- Missing model result fields or grading evidence: runner exits nonzero.
- Missing Chrome or app fixture: keep the product workflow blocked and the eval unexecuted or failed unless the case explicitly evaluates correct preflight blocking.
- Any critical failure: patch the skill, rerun deterministic checks, then rerun the affected model cases and their baseline configurations.
- Any high-severity failure: keep the report incomplete until the fixed case is rerun.
- Overall PASS requires all 74 current cases executed, 74 derived passes, zero failures, zero evaluator blockers, zero invalid rows, zero unexecuted cases, zero critical failures, zero run-threshold failures, and no aggregate-threshold failures. Old-skill failures remain visible but do not gate the current release.
