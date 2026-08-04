---
schema_version: 1
id: fpb-all-template-summary-browser-report
title: FPB All-Template Summary Browser Test Report
type: browser-qa-report
status: active
summary: Records direct Chrome QA for every FPB summary preset, required viewport, and configurable state family.
last_audited: 2026-08-05
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

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 2
Artifact status: remediation-required

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
| Responsive | Failed on attempt 1 | At viewport 1024px the widget measured 1013px and reported `tray`, while CSS displayed the desktop panel | None |
| Console |  |  |  |
| Network |  |  |  |
| Accessibility |  |  |  |
| Performance |  |  |  |
| Non-regression |  |  |  |

## Case results

| Case | Viewport | State | Semantic | DOM | Geometry | Console | Network | Accessibility | Performance | Result |
|---|---|---|---|---|---|---|---|---|---|---|
| qa-disclosure-responsive-mobile-390 | 1024x768 (widget 1013px) | disclosure-responsive | Pass | Fail: runtime/CSS owner mismatch | Fail | Pass | Pass | Pass with ownership mismatch | Deferred | Fail |

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
| qa-disclosure-responsive-mobile-390 | 1 | Product responsive ownership | Failed | `qa/results/qa-disclosure-responsive-mobile-390.result.json` | REM-001 | Yes; selection remained empty |

## Final approval status
