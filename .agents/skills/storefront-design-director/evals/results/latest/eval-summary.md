---
schema_version: 1
id: storefront-design-director-eval-summary
title: Storefront Design Director Eval Summary
type: skill-eval-result
status: active
summary: Records deterministic validation and separately reports model-dependent execution evidence.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - skill-evaluation
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/evals
related_docs:
  - .agents/skills/storefront-design-director/EVAL_REPORT.md
tags:
  - eval
keywords:
  - regression
---

# Eval Summary

- Deterministic status: passed
- Model status: passed
- Overall status: passed
- Invocation cases: 37
- Workflow cases: 30
- Browser QA cases: 7

## Deterministic checks

- invocation-corpus: passed - {"categories": {"ambiguous": 7, "should_invoke": 17, "should_not_invoke": 13}, "total": 37}
- workflow-corpus: passed - {"severities": {"critical": 17, "high": 12, "medium": 1}, "total": 30}
- browser-corpus: passed - {"total": 7}
- rubric-contract: passed - {"concrete_checks": 13, "critical_failures": 10, "qualitative_dimensions": 12}
- jsonl-validation: passed - Every non-empty JSONL row parsed as an object.

## Model-dependent execution

- Executed unique cases: 74
- Unexecuted unique cases: 0
- Passed runs: 74
- Failed runs: 0
- Blocked runs: 0

All model-dependent cases executed; evaluation status is derived independently from workflow outcomes.
