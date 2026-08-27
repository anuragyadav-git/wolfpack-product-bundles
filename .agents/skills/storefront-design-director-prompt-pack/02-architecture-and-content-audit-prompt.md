---
schema_version: 1
id: storefront-design-director-architecture-audit-prompt
title: Storefront Design Director Architecture and Content Audit
type: prompt-pack
status: active
summary: Defines the architecture, content, lifecycle, and safety audit for the storefront design director skill.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - storefront-design
systems:
  - storefront-design-director
source_paths:
  - storefront-design-director-prompt-pack/02-architecture-and-content-audit-prompt.md
related_docs:
  - storefront-design-director-prompt-pack/README.md
tags:
  - prompt
  - architecture-audit
keywords:
  - storefront-design-director
  - audit
---

# Prompt 2 — Architecture and content audit

Run this after Prompt 1 has created the skill.

---

Perform an exhaustive audit and hardening pass on:

```text
.agents/skills/storefront-design-director/
```

Do not trust the previous implementation merely because tests pass. Inspect every file and correct omissions, contradictions, shallow guidance, invalid references, and nonfunctional scripts.

## Audit objectives

### 1. Skill discovery and boundaries
Verify that:

- the skill name is exactly `storefront-design-director`
- the description front-loads screenshot-to-storefront design and Chrome visual QA
- positive triggers are explicit
- negative triggers are explicit
- it will not accidentally activate for backend-only coding, general illustration, or direct production implementation
- explicit invocation instructions are correct
- `SKILL.md` is not so long that progressive disclosure is defeated
- important gates are not hidden only in a reference that the skill never reads

### 2. Workflow completeness
Trace a design job through every stage from `DISCOVERY` to `ARCHIVED`.

For every stage verify:

- entry criteria
- required inputs
- generated artifacts
- user guidance
- allowed transitions
- blocking conditions
- exit criteria
- revision behavior
- next stage
- resume behavior

Construct a workflow coverage table. Fix every gap.

### 3. Conversational guidance
Check that the skill:

- asks at most three questions per turn
- asks only unanswered, gate-relevant questions
- gives recommendations
- distinguishes observations from assumptions
- updates locked decisions
- displays status every turn
- handles new, resume, revise, approve, package, QA, and archive
- does not repeat the entire intake process after resuming
- does not ask the user to restate information found in artifacts
- does not overwhelm the user with all missing screenshots at once
- knows when to proceed with a conservative default
- knows when business semantics require blocking

Add example conversations for:

1. a vague new request
2. incomplete screenshots
3. mismatched viewport screenshots
4. user accepting recommendations
5. user revising an approved direction
6. returning with an implementation for QA
7. Chrome MCP unavailable
8. a failed visual comparison
9. final approval

### 4. Design rigor
Check for complete guidance covering:

- anatomy
- hierarchy
- geometry
- typography
- color and surfaces
- tokens
- merchant customization
- states
- content stress
- responsive transformation
- interaction
- accessibility
- animation and reduced motion
- sticky/fixed/overflow behavior
- long lists
- errors and loading
- mobile safe areas
- landscape and narrow widths
- copy and price formatting
- design approval and immutable revisions

Fix any section that contains only high-level slogans.

### 5. Repository ownership
Verify the skill requires evidence-based discovery of:

- DOM owner
- state owner
- event owner
- shared style owner
- preset style owner
- media-query owner
- runtime-injected style owner
- token owner
- test owner
- fixture route
- visual baseline owner

Ensure it explicitly rejects specificity escalation and parallel component implementations as default fixes.

### 6. Artifact consistency
Validate that:

- every template field has a purpose
- identifiers are consistent across YAML, Markdown, JSON, scripts, and tests
- every path referenced by `SKILL.md` exists
- every path referenced by references exists
- stage names match exactly everywhere
- statuses match exactly everywhere
- required fields are validated
- approval records are immutable or revisioned
- handoff archives include checksums
- secret and temp exclusions are tested
- generated outputs are deterministic

### 7. Script quality
Read and run every script.

Check:

- `--help`
- type hints
- error messages
- exit codes
- atomic writes
- collision safety
- revision safety
- schema validation
- path traversal resistance
- malformed input handling
- missing dependency handling
- macOS/Linux compatibility
- no network access
- no production-code modifications
- unit-test coverage

Add tests for uncovered branches. Do not leave scripts as stubs.

### 8. Progressive disclosure
Move detailed material out of `SKILL.md` when appropriate, but preserve all hard gates in the operational flow.

Create a reference-loading map:

```text
stage → references that must be read → reason
```

Ensure the skill explicitly follows it.

### 9. Wolfpack applicability
Verify the skill knows the FPB and PPB template families and common component slices, but does not hard-code stale file paths.

Ensure it requires cross-template non-regression testing based on actual ownership.

### 10. Final validation
Run:

- all unit tests
- every local validator
- a synthetic new-job creation
- a synthetic resume
- a synthetic illegal stage transition
- a synthetic complete handoff
- a synthetic blocked Chrome QA
- a synthetic failed visual diff
- handoff packaging

Produce:

```text
.agents/skills/storefront-design-director/AUDIT_REPORT.md
```

The report must contain:

- findings by severity
- files changed
- tests added
- test results
- remaining limitations
- a requirement-to-file traceability matrix
- a zero-placeholder scan result
- a broken-reference scan result

Do not declare completion while any critical or high-severity gap remains. Apply the fixes now.

---
