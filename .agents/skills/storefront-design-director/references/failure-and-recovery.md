---
schema_version: 1
id: storefront-design-director-failure-recovery
title: Failure and Recovery
type: skill-reference
status: active
summary: Defines blocked, failed, retry, preservation, and resume behavior across the design lifecycle.
last_audited: 2026-08-04
owners:
  - Aditya Awasthi
domains:
  - design-operations
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/references/failure-and-recovery.md
related_docs:
  - .agents/skills/storefront-design-director/references/workflow-state-machine.md
tags:
  - recovery
keywords:
  - blocked
  - retry
---

# Failure and Recovery

Never mark blocked as passed. Retry only plausibly transient failures. Record every attempt, separate infrastructure and product failure, preserve evidence, give one exact recovery action, and resume from the failed gate.

Before writing remediation, reconcile every measured failure into the case result, reports, summary, manifest QA fields, and approval state. If raw evidence contradicts a declared pass, durable gate and approval records must show failed or blocked before remediation is considered complete.

- Missing or unreadable screenshot: preserve inventory and request corrected capture.
- Mismatched viewport or zoom: block exact comparison and recapture.
- Missing repository or instructions: block architecture handoff.
- Business-logic conflict: preserve semantics and return to scope or direction.
- Missing route, fixture, data, Chrome capability, or server: block preflight and identify setup.
- Default profile authentication missing: ask the user to authenticate in the default profile, then resume; never create an alternate or isolated profile.
- Stale snapshot IDs: take a fresh snapshot and retry once.
- Console or network error: preserve logs and fail affected cases.
- Dimension mismatch: select or capture a comparable baseline; never resize silently.
- Missing pixel dependency: install with authorization or use PPM; remain blocked.
- Dynamic instability: stabilize fixture data and media first; only if that is unavailable, use an explicitly approved narrow mask and rerun.
- Declared pass contradicts raw console, network, accessibility, Lighthouse, or comparison JSON: fail the affected gate, preserve sanitized evidence, and rerun after remediation.
- Flake: repeat identically and record all outcomes.
- Changed approval: supersede, revise, and return to the earliest affected stage.
- Missing implementation: remain IMPLEMENTATION_AWAITED.
- Missing baseline: capture and approve one.
- Partial implementation: issue measured remediation.
- Timeout: preserve evidence and retry once only when deterministic.
- Retry exhaustion: honor the browser plan maximum, preserve every attempt, emit measured remediation, and remain failed or blocked according to cause.
- Declared pass contradicted by console, network, assertion, or diff evidence: trust the evidence, fail the affected gate, and map it to the canonical owner.
- Invalid or over-broad dynamic mask: block comparison until the mask stays inside its approved rectangle and does not cover pixels or geometry exercised by the case assertions.

Cancellation preserves artifacts and history.
