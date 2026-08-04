---
schema_version: 1
id: storefront-design-director-browser-report-template
title: Browser Test Report Template
type: design-job-template
status: active
summary: Records Chrome capability, deterministic setup, per-case evidence, gate status, and retries.
last_audited: 2026-08-03
owners:
  - Aditya Awasthi
domains:
  - browser-qa
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/browser-test-report.md
related_docs:
  - .agents/skills/storefront-design-director/references/chrome-devtools-test-protocol.md
tags:
  - template
keywords:
  - chrome
  - browser-report
---

# Browser Test Report

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: draft

## Job, implementation, and Chrome QA preflight

- Environment, Chrome version, URL, branch, commit, fixture:
- Browser profile: default profile only
- Isolated context used: no
- Available Chrome DevTools capabilities:
- Missing capabilities:
- Preflight status:
- Blocker and recovery:

| Mandatory preflight check | Status | Direct evidence | Blocker | Recovery action |
|---|---|---|---|---|
| Chrome MCP connected |  |  |  |  |
| Supported Chrome available |  |  |  |  |
| Intended page selected |  |  |  |  |
| Server, environment, and fixture reachable |  |  |  |  |
| Authentication intentional and sensitive tabs avoided |  |  |  |  |
| Resize, snapshot, screenshot, console, and network work |  |  |  |  |
| Repository, job revision, and baseline identified |  |  |  |  |

## Conditions

| Case | Viewport | DPR | Zoom | Locale | Currency | Theme | State |
|---|---|---|---|---|---|---|---|

## Gate summary

| Gate | Status | Evidence | Waiver or not-applicable reason |
|---|---|---|---|
| Functional |  |  |  |
| Visual |  |  |  |
| Geometry |  |  |  |
| Responsive |  |  |  |
| Console |  |  |  |
| Network |  |  |  |
| Accessibility |  |  |  |
| Performance |  |  |  |
| Non-regression |  |  |  |

## Case results

| Case | Viewport | State | Semantic | DOM | Geometry | Console | Network | Accessibility | Performance | Result |
|---|---|---|---|---|---|---|---|---|---|---|

## Screenshot index

| Case | Kind | Phase | PNG path | Viewport and DPR | Baseline | Diff | JSON summary | Mask ID |
|---|---|---|---|---|---|---|---|---|

## Console allowlist

| Exact or pattern | Reason | Owner | Review date | Baseline evidence |
|---|---|---|---|---|

No blanket warning suppression.

## Network observations and expected analytics

## Lighthouse desktop and mobile reports

Separate page-level pre-existing findings from component-introduced findings. Lighthouse excludes performance.

## Performance traces and insights

Record LCP, CLS, interaction findings, long tasks, layout-shift sources, image or font findings, baseline comparison, and trace path, or the approved not-applicable reason.

## Retry history and cleanup

| Case | Attempt | Classification | Status | Evidence | Remediation | Cleanup confirmed |
|---|---|---|---|---|---|---|

## Final approval status
