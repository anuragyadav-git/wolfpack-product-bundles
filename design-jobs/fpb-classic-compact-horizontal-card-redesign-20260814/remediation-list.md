---
schema_version: 1
id: storefront-design-director-remediation-template
title: Remediation List Template
type: design-job-template
status: active
summary: Converts measured QA failures into bounded canonical-owner corrections and retest scope.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/remediation-list.md
related_docs:
  - .agents/skills/storefront-design-director/assets/templates/visual-qa-report.md
tags:
  - template
keywords:
  - remediation
  - measured-delta
---

# Remediation List

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 1
Artifact status: complete

| ID | Gate | Region and state | Expected | Actual | Measured delta | Severity | Canonical owner | Correction | Retest cases | Status |
|---|---|---|---|---|---|---|---|---|---|---|

## Infrastructure blockers and product failures

- `INF-CLASSIC-ASSET-01` resolved: after the user restarted the SIT dev server, request 11177 returned the rebuilt Classic CSS and the full retry passed. No deployment was required or attempted.

## Approved waivers

| ID | Reason | Risk | Approver | Timestamp | Follow-up |
|---|---|---|---|---|---|
| WAIVER-CL-A11Y-SHARED | Lighthouse findings belong to the frozen shared card renderer, shared summary, or theme rather than Classic preset CSS | Shared semantics and desktop-summary contrast remain unresolved | Aditya Awasthi | 2026-08-14 | Separately approve shared renderer, summary, or theme remediation |
| WAIVER-CL-PERF-SHARED | Delayed shared widget hydration produced LCP 7034ms and CLS 0.6949; preset CSS does not own loading/runtime | Slow paint and late layout shift remain unresolved | Aditya Awasthi | 2026-08-14 | Separately investigate shared widget hydration and layout reservation |

## Retry history

| Case | Attempt | Failure class | Evidence | Fast checks | Full matrix | Result |
|---|---|---|---|---|---|---|
| classic-live-asset-hard-reload | 1 | Infrastructure | Request 10772; live card border 0px; title 93px and unclamped | Runtime CLASSIC and no page overflow passed | Not run | Blocked |
| classic-live-asset-hard-reload | 2 | Infrastructure retry | Request 11177 contained rebuilt CSS; Cache Storage cleared; ignore-cache reload | Runtime, asset ownership, and default geometry passed | Five widths, interactions, Lighthouse, trace, and frozen Standard smoke passed | Passed with scoped shared-owner waivers |
| compact-live-five-width | 1 | Product CSS correction | At 390/360 desktop-width emulation, shared responsive cascade initially collapsed Compact to one column | Forced the approved two-column track contract in Compact preset CSS | Five widths, interactions, Lighthouse, trace, and frozen Standard smoke passed | Passed with scoped shared-owner waivers |
| horizontal-live-five-width | 1 | Product CSS correction and infrastructure retry | Shared catalog query kept 768px at two columns; unconstrained square media expanded one-column cards; dev preview briefly retained the preceding generated body | Increased preset selector ownership, constrained non-variant row tracks, and touched the generated asset to trigger preview republish | Five widths, 799/800/801 boundary, interactions, Lighthouse, trace, and final four-preset regression passed | Passed with scoped shared-owner waivers |
