---
schema_version: 1
id: storefront-design-director-audit-test-spec
title: Storefront Design Director Architecture and Content Audit Test Spec
type: test-spec
status: active
summary: Defines regression coverage for lifecycle integrity, artifact immutability, handoff quality, safe scripts, and default-profile Chrome QA.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - skill-testing
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director
related_docs:
  - .agents/skills/storefront-design-director/AUDIT_REPORT.md
tags:
  - tdd
keywords:
  - audit
  - lifecycle
---

# Test Spec: Storefront Design Director Architecture and Content Audit

**Spec ID:** storefront-design-director-audit  **Created:** 2026-08-03

## Purpose

Prove that the skill is discoverable, stage-complete, artifact-safe, default-profile-only, and mechanically unable to approve shallow or mutated handoffs.

## Test Cases

### SkillAudit

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | New job | Safe repository and ID | Job, metadata, registry, and directories created | No production path |
| 2 | Resume | Matching and mismatched identity | Match resumes; mismatch blocks | No silent collision |
| 3 | Illegal transition | Stage skip or special-state switch | Error and unchanged manifest | Terminal rules included |
| 4 | Changed decision | No affected artifacts | Transition blocks | Affected scope required |
| 5 | Approved mutation | Changed approved artifact | Validation blocks | Supersession preserves hash |
| 6 | Draft handoff | Untouched generated templates | Handoff validation blocks | Empty sections also block |
| 7 | Complete handoff | Complete artifacts and approvals | Handoff validation passes | IDs, revisions, hashes align |
| 8 | Chrome profile | Isolated-context plan | Validation blocks | Default profile only |
| 9 | Browser evidence traversal | Parent-relative artifact | Summary blocks | QA root containment |
| 10 | Failed visual diff | Changed or mismatched image | Failed result and evidence | No false approval |
| 11 | Package collision | Existing archive | Error unless force is explicit | Deterministic package |
| 12 | CLI contract | Every executable script with --help | Exit 0 and useful usage | Standard library path |
| 13 | Documentation integrity | All skill docs and links | Exact metadata, no broken links or unfinished markers | Includes audit report |

## Acceptance Criteria

- [ ] All listed unit and lifecycle tests pass.
- [ ] Every validator passes a complete synthetic job and rejects malformed inputs.
- [ ] No critical or high-severity audit gap remains.
- [ ] No storefront production file is modified.
