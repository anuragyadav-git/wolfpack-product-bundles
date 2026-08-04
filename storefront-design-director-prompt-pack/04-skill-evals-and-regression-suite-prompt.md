---
schema_version: 1
id: storefront-design-director-evals-prompt
title: Storefront Design Director Skill Evals and Regression Suite
type: prompt-pack
status: active
summary: Defines the systematic invocation, workflow, browser, and rubric evaluation suite for the storefront design director skill.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - skill-evaluation
systems:
  - storefront-design-director
source_paths:
  - storefront-design-director-prompt-pack/04-skill-evals-and-regression-suite-prompt.md
related_docs:
  - storefront-design-director-prompt-pack/README.md
tags:
  - prompt
  - regression
keywords:
  - storefront-design-director
  - evals
---

# Prompt 4 — Skill evals and regression suite

Run after the skill and Chrome automation have been hardened.

---

Build and run a systematic evaluation suite for:

```text
.agents/skills/storefront-design-director/
```

The eval suite must test both invocation reliability and workflow quality.

## 1. Invocation evals

Create at least 30 cases divided into:

### Should invoke
- redesign a product card from screenshots
- recreate a summary sidebar design
- design a mobile bundle tray
- compare current and target storefront screenshots
- create a responsive state board
- prepare a Codex handoff from an approved design
- resume a prior design job
- verify a completed storefront component in Chrome
- investigate visual regressions
- define product-card states
- design a product-details modal
- audit bundle progress UX
- generate controlled design alternatives

### Should not invoke
- backend GraphQL query
- database migration
- Shopify Function logic
- generic logo illustration
- social-media poster
- legal document
- spreadsheet analysis
- pure performance debugging with no design/component objective
- direct bug fix where no design or visual QA is requested
- product research
- unrelated website browsing

### Ambiguous
- “make this page better”
- “copy this”
- “the footer is broken”
- “review this screenshot”
- “fix mobile”
- “create a Figma-like component”
- “test this page in Chrome”

For ambiguous cases, evaluate whether the skill asks a minimal scoping question or correctly defers.

## 2. Workflow eval scenarios

Create end-to-end scenarios for:

1. New FPB product-card design with current and target desktop screenshots.
2. Missing mobile reference; mobile design must be derived and clearly marked as recommended.
3. Current and target screenshots at mismatched widths.
4. User provides only an inspiration image, not an exact-match target.
5. User approves one of three directions.
6. User changes the approved button treatment later.
7. Job resumed in a fresh conversation using artifacts.
8. Long product title reveals insufficient card height.
9. Selected border causes layout shift.
10. Variant selection is missing from the first design.
11. Sidebar has no long-list state.
12. Mobile tray covers its CTA.
13. Shared CSS change could affect four FPB templates.
14. Styling is split between shared CSS, preset CSS, and runtime-injected JS.
15. Chrome MCP is unavailable.
16. App cannot start.
17. Authentication is required.
18. Console error appears after add-to-bundle.
19. Duplicate API request appears after quantity change.
20. Lighthouse reports a new component accessibility issue.
21. Pixel diff fails due solely to dynamic product image.
22. Baseline screenshot dimensions differ.
23. User asks to approve despite an unwaived high-severity regression.
24. Implementation passes target template but breaks a sibling template.
25. User provides implementation screenshots rather than a running app.
26. User interrupts halfway and changes scope.
27. User says “use your recommendations” for all noncritical decisions.
28. User asks for direct code edits while the skill is in design-director mode.
29. Job reaches final approval and archives baselines.
30. Approved job is reopened for a new revision.

## 3. Rubric

Use both concrete checks and qualitative scoring.

### Concrete checks
- correct skill invocation
- status block present
- correct stage
- no more than three questions
- recommendation supplied
- artifacts updated
- legal state transition
- blocking evidence identified
- correct required reference loaded
- no production code change
- correct Chrome gate behavior
- no false pass
- exact expected output file exists

### Qualitative dimensions, scored 1–5
- design reasoning quality
- completeness without overwhelming the user
- evidence discipline
- responsive rigor
- state coverage
- accessibility rigor
- repository ownership reasoning
- handoff implementability
- browser test specificity
- remediation precision
- recovery from incomplete inputs
- consistency across turns

Define minimum passing scores and critical-failure conditions.

Critical failures include:

- claims Chrome QA passed without Chrome evidence
- modifies production code in design-director mode
- skips direction approval
- omits state/responsive contract
- ignores an existing answer and re-asks it
- marks blocked evidence as pass
- loses job state after resume
- gives vague remediation with no measured evidence
- recommends a high-specificity patch without ownership analysis
- exposes secrets or personal browser data

## 4. Eval runner

Use the current OpenAI/Codex eval mechanism available in the repository or environment. If none is available, create a deterministic local eval runbook and machine-readable expected checks without inventing unsupported commands.

Do not claim model-graded evals were executed if the environment cannot run them.

At minimum:

- validate JSONL
- run all script-level deterministic checks
- generate an eval summary
- identify unexecuted model-dependent cases
- provide exact instructions for running them later

## 5. Improve the skill from eval findings

Run available evals, identify failures, patch the skill, and rerun.

Create:

```text
.agents/skills/storefront-design-director/EVAL_REPORT.md
```

Include:

- invocation precision/recall where measurable
- scenario pass/fail
- rubric scores
- critical failures
- fixes applied
- rerun results
- unexecuted cases and why
- remaining risks

Do not finish at the first report. Apply fixes for all critical and high-severity failures, then rerun.

---
