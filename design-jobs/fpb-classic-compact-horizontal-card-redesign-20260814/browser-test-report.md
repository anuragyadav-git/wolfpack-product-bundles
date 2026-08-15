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
Artifact revision: 3
Artifact status: complete

## Job, implementation, and Chrome QA preflight

- Environment, Chrome version, URL, branch, commit, fixture: SIT; Chrome 150.0.0.0; `https://agent-5sfidg3m.myshopify.com/apps/product-bundles/wpb/2`; `feature/26.05-UI-changes`; `a5250ef8f6e613bc729daba8b0ad96dfac2360e8`; FPB Subscription Compatibility 2026-08-14
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
| Repository, job revision, and baseline identified | Passed | Job revision 3, current commit, and retained revision-1 baselines identified |  |  |

## Revision 3 reopened internal-geometry audit

- Setup: both EB and Wolfpack were configured to the same preset in Classic, Compact, Horizontal order. Cache Storage was cleared and both storefronts were reloaded with cache bypass after each preset change.
- Pairwise conditions: `1440x900` DPR1 desktop and `390x844` DPR1 mobile/touch.
- Measurement scope: card, media, text, title, variant when present, price/action row, price, and action control rectangles; unselected, selected, then restored.
- EB result: all measured internal rectangles had `0px` state delta for all three presets at both viewports.
- Wolfpack result: outer card dimensions stayed fixed, but internal component rectangles shifted in every preset. Detailed deltas and remediation owners are in `visual-qa-report.md` and `remediation-list.md`.
- Console/network preflight: storefront document, shared assets, active Horizontal preset CSS, language settings, controls settings, products, and view requests returned HTTP 200. No app-owned exception was present; the existing theme-owned resource 404 remains separate.

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
| Geometry | Failed | Outer-card heights remain stable, but revision-3 internal rectangle measurements show state-dependent reflow in Classic, Compact, and Horizontal |  |
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

## Compact slice results

- Persisted/runtime preset: `COMPACT` with only `bundle-widget-full-page-compact.css` active after Cache Storage clear and ignore-cache reload.
- Live asset: request 21848 returned HTTP 200 and exposed the rebuilt frame, focus, and two-line title declarations.
- Responsive geometry: three columns at 1440x900 and 1280x800; two columns at 768x1024, 390x844, and 360x800. All widths had zero page-level horizontal overflow and equal row heights.
- Card geometry: 311.313px at 1440, 289.203px at 1280, 281.797px at 768, and 272px at 390/360. Titles reserve 44px desktop and 36px below the shared 800px container boundary.
- Interaction: hover produced zero geometry delta; selected and quantity 1-to-2 states stayed 272px high; 44px controls remained inside the card. Keyboard traversal reached the card root and rendered a solid 2px outline with 2px offset.
- Frozen Standard smoke: Standard retained three desktop columns and one mobile column, loaded only Standard preset CSS, and had no overflow. The fixture was restored to Compact and reverified.
- Console/network: no new app-owned errors or failed widget requests. The only 404 remained the theme-owned `/favicon.ico`.
- Lighthouse: desktop accessibility 88 and mobile accessibility 95; Best Practices 77, SEO 92, and Agentic Browsing 51 at both. The same frozen shared-owner accessibility waiver applies.
- Performance: desktop navigation trace measured LCP 5969ms and CLS 0.69, again dominated by delayed shared widget hydration. The same frozen shared-runtime waiver applies.
- Raw reports: `/private/tmp/fpb-classic-compact-horizontal-card-redesign-20260814/qa/lighthouse/compact-{desktop,mobile}/`.

## Horizontal slice and final regression

- Persisted/runtime preset: `HORIZONTAL` with only `bundle-widget-full-page-horizontal.css` active after Cache Storage clear and ignore-cache reload.
- Live asset recovery: the dev preview initially retained the preceding generated body. Touching the already-generated Horizontal asset triggered a new extension preview URL; the authoritative response then contained the frame and constrained-row declarations. No deploy or dev-server restart was performed.
- Responsive geometry: two columns at 1440x900 and 1280x800; exactly one column at 768x1024, 390x844, and 360x800. Root container 799px used one column; at 800/801px the content-driven catalog used one permitted column. All widths had zero page-level overflow.
- Card geometry: 154px with a 136px media/content row on wide desktop; 138px with a 120px row below the shared 800px container boundary. The existing 30/70 anatomy remained unchanged.
- Interaction: hover produced zero geometry delta; selected and quantity 1-to-2 states stayed 138px high; 44px controls remained contained. Keyboard traversal reached the card root and rendered a solid 2px outline with 2px offset.
- Final cross-template sweep: Classic retained 4 desktop / 2 mobile columns; Compact 3 / 2; frozen Standard 3 / 1; Horizontal 2 / 1. Every preset loaded only its own stylesheet and had zero horizontal overflow. The fixture was restored to Horizontal.
- Console/network: final trace navigation produced no app-owned console error or failed request. Earlier theme-owned favicon behavior remains outside the widget.
- Lighthouse: desktop accessibility 88 and mobile accessibility 95; Best Practices 77, SEO 92, and Agentic Browsing 51 at both. The same frozen shared-owner accessibility waiver applies.
- Performance: desktop navigation trace measured LCP 5784ms and CLS 0.69, dominated by shared widget load delay. The same frozen shared-runtime waiver applies.
- Raw reports: `/private/tmp/fpb-classic-compact-horizontal-card-redesign-20260814/qa/lighthouse/horizontal-{desktop,mobile}/`.

## Final approval status

Revision 3 supersedes the earlier outer-height-only geometry conclusion. Classic, Compact, and Horizontal fail the internal state-stability requirement and require preset-owned CSS remediation. The fixture is restored to Horizontal. No production code was changed and no deployment was attempted.
