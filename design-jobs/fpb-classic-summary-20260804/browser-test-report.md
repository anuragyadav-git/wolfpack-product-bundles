---
schema_version: 1
id: storefront-design-director-browser-report-template
title: Browser Test Report Template
type: design-job-template
status: draft
summary: Records the partial Chrome QA execution for the FPB Classic Calm Review Panel implementation.
last_audited: 2026-08-04
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

Not approved. Stage 18 remains active because required stress fixtures are not run, both no-mask visual comparisons exceed threshold, and the page-level LCP gate fails.

## Execution update — 2026-08-04

- Preflight passed all 16 checks in `qa/preflight.json`; default Chrome profile and canonical Agent fixture were used.
- Final Classic CSS freshness passed at 98,693 bytes. Cache-bypassed hard reloads were sufficient; the tunnel was not restarted after the final build.
- Desktop 1440 partial geometry passed after remediating footer selector specificity.
- Mobile 390 collapsed/expanded passed: collapsed details are inert and hidden from assistive technology; expanded details restore Clear/remove controls, preserve two selections, keep body scroll available, and assign vertical scrolling only to `.fpb-mobile-summary-products-list`.
- Responsive ownership passed at available component widths 1023/1024/1025 as tray/sidebar/sidebar. Viewport widths 319/320/767/768/769 each exposed exactly one tray and no horizontal overflow.
- Mobile 320 empty collapsed/expanded passed with no false product row or Clear action.
- Standard, Compact, and Horizontal empty desktop sibling baselines passed with zero horizontal overflow. The Agent fixture was restored and verified as Classic/sidebar.
- Lighthouse snapshot scored accessibility 100, best practices 100, agentic browsing 100, and SEO 83.
- Performance failed: LCP 5,949ms, including 5,768ms image load delay; CLS was 0.00.
- Widget CSS/JS, app configuration endpoints, tracking endpoint, and product images returned 200. Shopify theme/account infrastructure emitted an aborted login request, an ORB-blocked decorative asset, a preload warning, and a missing-label issue outside the summary component.
- The Admin customization overlay ignored pointer activation of Next after its first use and logged hydration/postMessage warnings. Keyboard activation completed sibling cycling and restoration.

Executed screenshots:

- `qa/screenshots/desktop-1440-primary-partial--desktop-1440--partial--actual--viewport.png`
- `qa/screenshots/mobile-390-partial-disclosure--mobile-390--partial--collapsed--viewport.png`
- `qa/screenshots/mobile-390-partial-disclosure--mobile-390--partial--expanded--viewport.png`
- `qa/screenshots/mobile-320-empty-and-overflow--collapsed--viewport.png`
- `qa/screenshots/mobile-320-empty-and-overflow--expanded--viewport.png`
- `qa/screenshots/sibling-template-standard--desktop-1440--empty--viewport.png`
- `qa/screenshots/sibling-template-compact--desktop-1440--empty--viewport.png`
- `qa/screenshots/sibling-template-horizontal--desktop-1440--empty--viewport.png`

Not-run required cases: long title/variant, wide EUR and German copy, missing image, quantity 12, 12 selected lines, discount boundaries, delayed loading, validation recovery, remove/clear confirmation, duplicate submit, safe-area emulation, and the 600px constrained host.
