---
schema_version: 1
id: storefront-design-director-remediation-template
title: Remediation List Template
type: design-job-template
status: active
summary: Converts measured QA failures into bounded canonical-owner corrections and retest scope.
last_audited: 2026-09-03
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
Artifact revision: 4
Artifact status: complete

| ID | Gate | Region and state | Expected | Actual | Measured delta | Severity | Canonical owner | Correction | Retest cases | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REM-ST-R4-01 | Geometry | Standard price/action row | Wolfpack contract keeps price and action bounds invariant | Before remediation, tracks changed from `203.25px 35px` to `126.25px 112px` at desktop and `144.109px 35px` to `91.109px 88px` at the narrow host width | Price/action allocation shifted `77px` desktop and `53px` narrow | BLOCKER | Standard preset raw CSS | Reserve the responsive quantity width in both states and align the compact Add button to the track end | 1280 and narrow real-window pass | Verified: zero delta at 1280x800 and 500x844 |
| REM-CL-HIERARCHY-01 | Semantic and geometry | Classic desktop card body | Wolfpack contract keeps media, title/variant, and price/action rows stable | Prior revision reflowed selected state | Title width `+115.92px`; action-row y `+52px`; price y `+56.5px` | BLOCKER | Classic preset raw CSS | Existing hierarchy correction retained | 1280 and narrow real-window pass | Verified: every measured region remained at `0px` delta |
| REM-CL-MOBILE-02 | Geometry | Classic mobile price/action row | Price and action bounds remain stable | `auto-fit` allowed intrinsic action width to change the track count | Price width `104.59px -> 0px`; action x `-104.59px`, width `+109.59px` | BLOCKER | Classic preset raw CSS | Replace the state-dependent split with explicit price and action tracks | 1280 and narrow real-window pass | Verified: zero delta at 1280x800 and 500x844 |
| REM-CL-PRICE-03 | Geometry | Classic responsive product grid | Reserve the quantity track without wrapping ordinary prices | Four 193.69px cards left only 58.69px for `$829.00`, which wrapped onto two lines | Card track `193.69px`; price track `58.69px` | HIGH | Shared responsive grid and Classic mobile raw CSS | Use an intrinsic `13rem` card minimum with `auto-fit`; preserve fixed price/action tracks inside each card | 1280 and narrow real-window pass | Verified: desktop uses three 262.25px tracks with a 127.25px price track; 500px uses two ~219.11px tracks with no overflow |
| REM-CO-STATE-01 | Geometry | Compact desktop/mobile price/action row | Price and control allocations remain constant | Quantity controls consumed an additional 68px and pushed the split left | Price width `-68px`; action x `-68px`, width `+68px` at 1440 and 390 | HIGH | Compact preset raw CSS | Replace `auto-fit` with explicit price and action tracks | 1280 and narrow real-window pass | Verified: zero delta at 1280x800 and 500x844, including sale price |
| REM-HO-STATE-01 | Semantic and geometry | Horizontal right-side content tracks | Title and price/action rows retain identical bounds | Prior revision had state-dependent movement | Desktop title y `+10px`, action-row y `-24px`, price y `-19px`; mobile title y `+10px`, action-row y `-8.95px` | BLOCKER | Horizontal preset raw CSS | Current source defines the content wrapper as the same grid in every state | 1280 and narrow real-window pass | Verified: every measured region remained at `0px` delta; no revision-4 code change required |
| REM-HO-ACTION-02 | Geometry | Horizontal action allocation | Action bounds do not change | Prior revision shifted and expanded quantity state | Desktop/mobile action x `-68px`, width `+68px` | BLOCKER | Horizontal preset raw CSS | Current source reserves `--horizontal-action-track` in every state | 1280 and narrow real-window pass | Verified: action bounds remained at `0px` delta; no revision-4 code change required |

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
