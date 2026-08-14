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
Artifact revision: 3
Artifact status: complete

| ID | Gate | Region and state | Expected | Actual | Measured delta | Severity | Canonical owner | Correction | Retest cases | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REM-CL-HIERARCHY-01 | Semantic and geometry | Classic desktop card body | EB hierarchy: media, full-width title/variant, full-width price/action | Default Wolfpack title and price/action share a row; selected state reflows into stacked rows | Title width `+115.92px`; action-row y `+52px`; price y `+56.5px` | BLOCKER | Classic preset raw CSS | Give body and descendants invariant row ownership; keep title/variant above price/action in both states | 1440, 1280, 768, 390, 360; default, selected, quantity, restored | Open |
| REM-CL-MOBILE-02 | Geometry | Classic mobile price/action row | EB preserves price and action bounds | Selected state hides price and expands action across the row | Price width `104.59px -> 0px`; action x `-104.59px`, width `+109.59px` | BLOCKER | Classic preset raw CSS | Reserve a constant price region and constant action region for both controls | 390 and 360; default, selected, quantity, restored | Open |
| REM-CO-STATE-01 | Geometry | Compact desktop/mobile price/action row | EB keeps price and control allocations constant | Quantity controls consume an additional 68px and push the split left | Price width `-68px`; action x `-68px`, width `+68px` at 1440 and 390 | HIGH | Compact preset raw CSS | Use invariant price/action tracks sized for the quantity control in every state | All five widths; sale price and selected quantity | Open |
| REM-HO-STATE-01 | Semantic and geometry | Horizontal right-side content tracks | EB keeps title above price/action with identical bounds | Selected state recenters/reflows title and action rows | Desktop title y `+10px`, action-row y `-24px`, price y `-19px`; mobile title y `+10px`, action-row y `-8.95px` | BLOCKER | Horizontal preset raw CSS | Define invariant title/variant and price/action rows; remove state-dependent centering | All five widths; default, selected, quantity, restored | Open |
| REM-HO-ACTION-02 | Geometry | Horizontal action allocation | EB action bounds do not change | Quantity state shifts action left and expands it | Desktop/mobile action x `-68px`, width `+68px` | BLOCKER | Horizontal preset raw CSS | Reserve the quantity-control width in the unselected state without changing interaction markup | All five widths; add, remove, quantity 1-to-2 | Open |

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
