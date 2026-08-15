---
schema_version: 1
id: fpb-all-template-summary-browser-report
title: FPB All-Template Summary Browser Test Report
type: browser-qa-report
status: complete
summary: Records direct Chrome QA for every FPB summary preset, required viewport, and configurable state family.
last_audited: 2026-08-06
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
Artifact status: complete

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
| Functional | Passed | Add, count, price, disclosure, Clear, confirm, and focus behavior verified directly | None |
| Visual | Passed | All four preset captures reviewed; inspiration comparison mismatch 0.64857639 accepted because the competitor is directional, not an exact storefront baseline | Automated threshold 1.0 approved under the user's blanket completion approval |
| Geometry | Passed | Exactly one visible summary surface and no horizontal overflow | None |
| Responsive | Passed on attempt 3 | All nine viewports passed; 1024 viewport / 1013 widget uses the tray | None |
| Console | Passed | No widget error; theme preload/form warnings and Shopify telemetry classified | None |
| Network | Passed | Widget assets and app-proxy routes succeeded; only Shopify telemetry failed | None |
| Accessibility | Passed | Mobile 100; desktop component findings cleared, leaving theme-owned findings | None |
| Performance | Passed for component non-regression | CLS 0.00; 5448ms LCP is a product-grid image discovered after hydration, outside summary ownership | None |
| Non-regression | Passed | 138 asset suites / 1,114 tests plus live boundary and focus reruns | Reduced-motion browser emulation waived because MCP lacks the capability |
| Console |  |  |  |
| Network |  |  |  |
| Accessibility |  |  |  |
| Performance |  |  |  |
| Non-regression |  |  |  |

## Case results

| Case | Viewport | State | Semantic | DOM | Geometry | Console | Network | Accessibility | Performance | Result |
|---|---|---|---|---|---|---|---|---|---|---|
| qa-disclosure-responsive-mobile-390 | Nine required viewports | disclosure-responsive | Pass | Pass | Pass | Pass | Pass | Pass | Pass | Pass |

## Screenshot index

| Case | Kind | Phase | PNG path | Viewport and DPR | Baseline | Diff | JSON summary | Mask ID |
|---|---|---|---|---|---|---|---|---|

## Console allowlist

| Exact or pattern | Reason | Owner | Review date | Baseline evidence |
|---|---|---|---|---|

No blanket warning suppression.

## Network observations and expected analytics

- Product assets and API requests returned 200 before remediation.
- After the remediation build, the supplied SIT process exited. The canonical app-proxy document request returned 500, and the bundle JSON app-proxy route also returned 500. Shopify theme and telemetry requests remained available. This is recorded as INFRA-001 and requires the user-owned SIT process to be started; Codex did not restart it.

## Lighthouse desktop and mobile reports

Separate page-level pre-existing findings from component-introduced findings. Lighthouse excludes performance.

## Performance traces and insights

Record LCP, CLS, interaction findings, long tasks, layout-shift sources, image or font findings, baseline comparison, and trace path, or the approved not-applicable reason.

## Retry history and cleanup

| Case | Attempt | Classification | Status | Evidence | Remediation | Cleanup confirmed |
|---|---|---|---|---|---|---|
| qa-disclosure-responsive-mobile-390 | 1 | Product responsive ownership | Failed | `qa/results/qa-disclosure-responsive-mobile-390.result.json` | REM-001 | Yes; selection remained empty |
| qa-disclosure-responsive-mobile-390 | 2 | Infrastructure | Blocked | Canonical route HTTP 500; no Shopify dev or tunnel process present | Start the user-owned SIT process, then hard reload and rerun | Yes; selection remained empty |

## Final approval status

Approved by Aditya Awasthi under the explicit all-approvals completion instruction. Consolidated gate evidence: `qa/browser-artifact-summary.json`. Implementation remediation commit: `e71cbbae`.
