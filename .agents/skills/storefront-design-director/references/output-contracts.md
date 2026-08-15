---
schema_version: 1
id: storefront-design-director-output-contracts
title: Design Job Output Contracts
type: skill-reference
status: active
summary: Defines required contents, status, naming, and approval rules for every design-job artifact.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - design-operations
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/output-contracts.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/design-job.yaml
tags:
  - artifacts
keywords:
  - handoff
  - approval-record
---

# Output Contracts

Core records: design-job.yaml, settings.yaml, component-brief.md, screenshot-inventory.yaml, visual-audit.md, direction-comparison.md, and locked-decisions.yaml.

Contracts: component-anatomy.md, state-matrix.md, responsive-contract.md, interaction-contract.md, accessibility-checklist.md, design-tokens.json, and content-stress-cases.yaml.

Handoff: implementation-handoff.md, codex-task.md, acceptance-criteria.md, and browser-test-plan.yaml. `validate_handoff.py` requires populated state, responsive, accessibility, and content-stress contracts; the direct browser-plan schema; complete desktop and mobile coverage; valid state references; complete cases; approved mask bounds; Lighthouse coverage; performance scope; at least one named non-regression case; and cleanup.

QA and approval: chrome-preflight-result.yaml copied to `qa/preflight.json`, browser-case-result.json copied per case to `qa/results/<case-id>.result.json`, browser-test-report.md, visual-qa-report.md, remediation-list.md, and approval-record.yaml. QA results record separate gates, evidence links, screenshot index, console and network observations, Lighthouse reports, trace or reasoned exclusion, waivers, and retry history.

Every approved artifact has job ID, revision, status, evidence IDs, approver, timestamp, and superseded revision when applicable. Do not overwrite approval; create a revision.

The design-job manifest owns a checksum registry for every generated artifact. Use scripts/record_artifact.py to move an artifact from draft to complete or approved. Approval requires an approver and evidence. If approved content changes, validation blocks until the old checksum is superseded with a reason in a newer revision. Unchanged approved artifacts may carry forward; changed or incomplete artifacts must match the current job revision.

Do not hand-edit registry checksums, approval timestamps, or superseded records. Validators compare file metadata, registry metadata, and current content hashes.

`summarize_browser_artifacts.py` blocks missing preflight or evidence and reconciles raw console, network, comparison, accessibility, and Lighthouse JSON before trusting declared gates. A contradictory product error fails its gate even when a result declared a pass. A waiver requires gate, reason, approver, and approval timestamp. Retry history is append-only evidence.

FINAL_APPROVAL requires an approved reconciled browser artifact summary plus passed or validly waived execution, baseline, console, network, accessibility, Lighthouse, performance, visual, and non-regression status. ARCHIVED additionally requires complete final approval metadata, an existing handoff package, and at least one existing immutable baseline file. An archived job is never changed in place; later work starts a linked successor job.
