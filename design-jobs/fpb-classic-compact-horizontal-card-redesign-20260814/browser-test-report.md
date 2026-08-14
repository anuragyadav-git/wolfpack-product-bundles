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

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 1
Artifact status: complete

## Job, implementation, and Chrome QA preflight

- Environment, Chrome version, URL, branch, commit, fixture: SIT; Chrome 150.0.0.0; `https://agent-5sfidg3m.myshopify.com/apps/product-bundles/wpb/2`; `feature/26.05-UI-changes`; `6846f4c64bd22c1a481726e0d7394ed267ec4010`; FPB Subscription Compatibility 2026-08-14
- Browser profile: default profile only
- Isolated context used: no
- Available Chrome DevTools capabilities: page selection, navigation, emulation, snapshots, evaluation, screenshots, console, and network inspection
- Missing capabilities: none for this retry
- Preflight status: passed
- Blocker and recovery: resolved after the user restarted the SIT dev server; request 11177 served the rebuilt Classic asset after Cache Storage clear and an ignore-cache reload

| Mandatory preflight check | Status | Direct evidence | Blocker | Recovery action |
|---|---|---|---|---|
| Chrome MCP connected | Passed | Existing default-profile page 4 selected |  |  |
| Supported Chrome available | Passed | Chrome 150.0.0.0 |  |  |
| Intended page selected | Passed | Storefront page 4 and Admin configure page 2 |  |  |
| Server, environment, and fixture reachable | Passed | Storefront and widget requests returned HTTP 200 |  |  |
| Authentication intentional and sensitive tabs avoided | Passed | Existing authenticated default profile only |  |  |
| Resize, snapshot, screenshot, console, and network work | Passed | Required tool calls completed in the current session |  |  |
| Repository, job revision, and baseline identified | Passed | Job revision 1 and pre-change Classic baselines under `/private/tmp` |  |  |

## Conditions

| Case | Viewport | DPR | Zoom | Locale | Currency | Theme | State |
|---|---|---|---|---|---|---|---|
| Classic desktop | 1440x900 | 1 | 100% | Store default | Store default | Test theme | Default, hover, keyboard focus |
| Classic desktop stress | 1280x800 | 1 | 100% | Store default | Store default | Test theme | Default |
| Classic tablet stress | 768x1024 | 1 | 100% | Store default | Store default | Test theme | Default |
| Classic mobile | 390x844 | 1 and 3 capture | 100% | Store default | Store default | Test theme | Default |
| Classic mobile stress | 360x800 | 1 | 100% | Store default | Store default | Test theme | Default, selected, quantity |

## Gate summary

| Gate | Status | Evidence | Waiver or not-applicable reason |
|---|---|---|---|
| Functional | Passed | Runtime resolves `CLASSIC`; mouse, touch-equivalent card controls, and keyboard focus operate |  |
| Visual | Passed | Rebuilt Classic frame, two-line title track, aligned price/action row, and focus treatment are live |  |
| Geometry | Passed | Equal row heights; zero outer-card delta for hover, selection, and quantity changes |  |
| Responsive | Passed | Five target widths show no overflow, clipping, sticky overlap, or unstable rows |  |
| Console | Passed | No new app-owned console error after reload |  |
| Network | Passed | Classic request 11177 returned HTTP 200 with rebuilt declarations; required widget requests returned 200 |  |
| Accessibility | Waived | Lighthouse desktop 88 and mobile 95 | `WAIVER-CL-A11Y-SHARED`: findings belong to frozen shared renderer/summary or theme |
| Performance | Waived | Desktop trace LCP 7034ms and CLS 0.6949 during delayed shared hydration | `WAIVER-CL-PERF-SHARED`: shared loading/runtime is outside preset CSS ownership |
| Non-regression | Passed | Frozen Standard retained three desktop columns, one mobile column, correct preset stylesheet, and no overflow |  |

## Case results

| Case | Viewport | State | Semantic | DOM | Geometry | Console | Network | Accessibility | Performance | Result |
|---|---|---|---|---|---|---|---|---|---|---|
| classic-live-asset-hard-reload | Five-width matrix | default, hover, focus, selected, quantity | Passed | Passed | Passed | Passed | Passed | Waived | Waived | Passed with scoped waivers |

## Screenshot index

| Case | Kind | Phase | PNG path | Viewport and DPR | Baseline | Diff | JSON summary | Mask ID |
|---|---|---|---|---|---|---|---|---|
| Classic desktop | Viewport | Before/after | `/private/tmp/fpb-classic-compact-horizontal-card-redesign-20260814/qa/actual/classic-live-desktop.png` | 1440x900 DPR1 | `classic-desktop-prechange.png` | `classic-desktop-diff.png` | `classic-desktop-diff.json` | None |
| Classic mobile | Viewport | Before/after | `/private/tmp/fpb-classic-compact-horizontal-card-redesign-20260814/qa/actual/classic-live-mobile-dpr3.png` | 390x844 DPR3 | `classic-mobile-prechange.png` | `classic-mobile-diff.png` | `classic-mobile-diff.json` | None |

## Console allowlist

| Exact or pattern | Reason | Owner | Review date | Baseline evidence |
|---|---|---|---|---|
| `/favicon.ico` 404 | Theme-owned missing favicon | Theme | 2026-08-14 | Final network list |
| Missing label / preload warning | Theme-owned markup and resource hint | Theme | 2026-08-14 | Final console list |

No blanket warning suppression.

## Network observations and expected analytics

The active Classic asset used the restarted extension preview URL and returned HTTP 200 with the rebuilt focus, frame, and line-clamp declarations. Settings, controls, products, configuration, and view requests returned HTTP 200. The only failed request was the theme-owned `/favicon.ico` 404.

## Lighthouse desktop and mobile reports

Desktop accessibility scored 88 and mobile accessibility scored 95. Findings were pre-existing and outside preset CSS ownership: `aria-pressed` on the shared card root's `role="group"`, product-details accessible names that omit visible titles, shared desktop-summary contrast, and theme list semantics. Best Practices scored 77, SEO 92, and Agentic 51 at both viewports. Reports are under `/private/tmp/fpb-classic-compact-horizontal-card-redesign-20260814/qa/lighthouse/`.

## Performance traces and insights

The desktop navigation trace measured LCP 7034ms and CLS 0.6949. The largest shift occurred during delayed shared widget hydration; Chrome reported no potential root cause. The trace is `/private/tmp/fpb-classic-compact-horizontal-card-redesign-20260814/qa/performance/classic-desktop-trace.json.gz` with SHA256 `97ac62bd4b497f574b0093849015cf3d696e51cb15f09e55a97dd4e8ff619883`. Shared loading/runtime remains frozen for this preset-owned CSS slice.

## Retry history and cleanup

| Case | Attempt | Classification | Status | Evidence | Remediation | Cleanup confirmed |
|---|---|---|---|---|---|---|
| classic-live-asset-hard-reload | 1 | Infrastructure | Blocked | Cache Storage keys `[]`; `ignoreCache: true`; request 10772; no QA style injection after reload | Refresh the user-owned SIT Shopify dev preview and rerun | Yes; reload removed the temporary style injection |
| classic-live-asset-hard-reload | 2 | Infrastructure retry | Passed | Request 11177 served rebuilt CSS; five-width matrix and Standard smoke passed | None | Yes; no QA style injection present |

## Final approval status

Classic slice passed with the two explicitly scoped shared-owner waivers above. The fixture was restored to Classic. No deployment was attempted.
