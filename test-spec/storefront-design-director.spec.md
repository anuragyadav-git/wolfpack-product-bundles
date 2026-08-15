---
schema_version: 1
id: storefront-design-director
title: Storefront Design Director Skill
type: test-spec
status: active
summary: Verifies the repository-scoped storefront design workflow, artifact lifecycle, handoff validation, and browser QA evidence gates.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director
related_docs:
  - storefront-design-director-prompt-pack/01-master-build-prompt.md
tags:
  - skill
  - tdd
keywords:
  - design-job
  - chrome-qa
---

# Test Spec: Storefront Design Director

**Spec ID:** storefront-design-director  **Created:** 2026-08-03

## Purpose

Verify that the skill creates durable design jobs, enforces legal workflow gates, validates handoffs, compares stable images, packages approved artifacts safely, and never converts missing browser evidence into a pass.

## Test Cases

### SkillContract

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Required skill tree | Skill root | Every required file exists | Prevents broken progressive-disclosure links |
| 2 | Skill metadata | SKILL.md | Name and discriminative description are valid | Supports reliable triggering |
| 3 | Repository documentation metadata | New Markdown files | Required frontmatter fields appear in order | Excludes SKILL.md because it uses the skill schema |
| 4 | Eval corpus | JSON and JSONL eval files | Cases parse and include positive and negative coverage | Covers invocation, workflow, and Chrome QA |

### DesignJobLifecycle

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Create job | Valid title and repository | Slugged job with copied templates and manifest | Uses configurable artifact root |
| 2 | Collision and resume | Existing job ID | Collision fails; explicit resume succeeds | Prevents accidental overwrite |
| 3 | Stage transitions | Sequential, backward, pause, and blocked transitions | Only legal transitions are persisted | History remains append-only |
| 4 | Manifest validation | Valid, malformed, and incomplete jobs | Structured blocking and advisory issues | Missing evidence cannot pass |

### HandoffAndQA

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Handoff completeness | Approved references and contracts | Complete handoff passes | Open decisions block |
| 2 | Deterministic package | Approved handoff | Stable archive and checksum manifest | Secrets and temporary files excluded |
| 3 | Image metadata | PNG, JPEG, GIF, and mismatched widths | Dimensions, hashes, and quality warnings | Viewport remains estimated unless supplied |
| 4 | Visual comparison | Equal, changed, and mismatched images | Pass, fail, or blocked with JSON evidence | Unsupported comparison never passes |
| 5 | Browser evidence summary | Passing and incomplete result sets | Separate gate statuses and overall decision | Missing evidence produces blocked |

## Acceptance Criteria

- [ ] All listed tests pass.
- [ ] Scripts use atomic manifest writes and deterministic outputs.
- [ ] Chrome DevTools MCP remains a mandatory QA gate.
- [ ] No production application code or configuration is modified.
- [ ] Eval cases cover triggering, guided workflow, interruption, and blocked Chrome QA.
