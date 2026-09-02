---
schema_version: 1
id: storefront-design-director-visual-qa-template
title: Visual QA Report Template
type: design-job-template
status: active
summary: Records baseline comparisons, masks, thresholds, semantic findings, and region-level differences.
last_audited: 2026-09-03
owners:
  - Aditya Awasthi
domains:
  - visual-testing
systems:
  - storefront-design-director
source_paths:
  - .agents/skills/storefront-design-director/assets/templates/visual-qa-report.md
related_docs:
  - .agents/skills/storefront-design-director/references/visual-comparison-rubric.md
tags:
  - template
keywords:
  - visual-diff
  - baseline
---

# Visual QA Report

Artifact job ID: fpb-classic-compact-horizontal-card-redesign-20260814
Artifact revision: 4
Artifact status: complete

## Revision 4 SIT verification

The authorized `Ownership Verify FPB 2026-08-27` SIT fixture was populated with one reusable step and six priced products, carried through all four FPB presets, and restored to Standard. Every pass used a Cache Storage clear plus an ignore-cache reload against the `/apps/product-bundles-sit/` route. The served styles came from the Shopify development extension and the runtime reported widget version `18.7.0`.

| Preset | Desktop 1280x800 | Narrow actual 500x844 | Price and action transition | Overflow | Result |
|---|---|---|---|---|---|
| Standard | Three 262.25px cards; price 126.25px; action 112px | Two ~203.11px cards; price 91.11px; action 88px | Card, media, title, row, price, and action all `0px` delta | `0px` | PASS |
| Classic | Three 262.25px cards; price 127.25px; action 112px | Two ~219.11px cards; price 84.11px; action 112px | Card, media, title, row, price, and action all `0px` delta | `0px` | PASS |
| Compact | Three 227px cards; price 92px; action 112px | Two ~219.11px cards; price 81.11px; action 112px | Card, media, title, row, price, and action all `0px` delta | `0px` | PASS |
| Horizontal | Two ~374.38px cards; price 123.88px; action 112px | One 450.23px card; price 176.97px; action 112px | Card, media, title, row, price, and action all `0px` delta | `0px` | PASS |

The requested real 390x844 window remains unavailable because this Chrome host enforces a 500px minimum. In-session desktop and narrow screenshots were reviewed, but durable screenshot-file persistence is unavailable. Required preset CSS and SIT data requests returned 200; console inspection retained one non-widget 404 already attributable to the theme favicon.

| Case | Baseline | Actual | Mask | Dimensions | Threshold | Mismatch | Bounds | Automated | Semantic |
|---|---|---|---|---|---|---|---|---|---|
| Classic desktop | Classic pre-change baseline | `classic-live-desktop.png` | None | 1440x900 | Informational redesign diff | 0.18430478 | x38 y96 w1333 h712 | Expected mismatch | ACCEPTED: approved CL-A redesign; live geometry and behavior passed |
| Classic mobile | Classic pre-change baseline | `classic-live-mobile-dpr3.png` | None | 1170x2532 | Informational redesign diff | 0.4573858 | x0 y0 w1170 h2112 | Expected mismatch | ACCEPTED: approved CL-A redesign; two-column mobile geometry passed |
| Compact desktop | Approved REF-WPB/REF-EB Compact cohort | Direct Chrome live capture | None | 1440x900 | Semantic contract | Not persisted by Chrome host | N/A | Host-limited | ACCEPTED: approved CO-A frame, title reserve, and integrated action are live |
| Compact mobile | Approved REF-WPB/REF-EB Compact cohort | Direct Chrome live capture | None | 390x844 | Semantic contract | Not persisted by Chrome host | N/A | Host-limited | ACCEPTED: approved two-column Compact geometry and contained action are live |
| Horizontal desktop | Approved REF-WPB/REF-EB Horizontal cohort | Direct Chrome live capture | None | 1440x900 | Semantic contract | Not persisted by Chrome host | N/A | Host-limited | ACCEPTED: approved two-column framed row-card treatment is live |
| Horizontal mobile | Approved REF-WPB/REF-EB Horizontal cohort | Direct Chrome live capture | None | 390x844 | Semantic contract | Not persisted by Chrome host | N/A | Host-limited | ACCEPTED: approved one-column 30/70 row-card treatment is live |

## Revision 3 reopened product-card composition audit

The earlier pass proved stable outer-card dimensions, but it did not prove stable internal component bounds. The reopened audit measured media, text, title, price/action row, price, and action-control rectangles before selection, after selection, and after removal. EB retained identical rectangles in every tested preset and viewport. Wolfpack returned to its initial geometry after removal, but shifted internal regions while selected.

| Preset | Viewport | EB hierarchy and state delta | Wolfpack hierarchy and state delta | Result |
|---|---|---|---|---|
| Classic | 1440x900 | Media, full-width title, then full-width price/action; every region `0px` delta | Default title and price/action split into side-by-side columns; selected state changes media height `+10.5px`, title y `+10.5px`, title width `+115.92px`, action-row y `+52px`, and action x `-68px` with width `+68px` | BLOCKER |
| Classic | 390x844 | Media, title, price/action; every region `0px` delta | Hierarchy is vertically correct, but selected state collapses price width from `104.59px` to `0px` and moves action x `-104.59px` while expanding it `+109.59px` | BLOCKER |
| Compact | 1440x900 | Media, full-width title, then price/action; every region `0px` delta | Vertical hierarchy matches, but selected price width changes `-68px`; action moves x `-68px` and expands `+68px` | HIGH |
| Compact | 390x844 | Same hierarchy; every region `0px` delta | Selected price width changes `-68px`; action moves x `-68px` and expands `+68px` | HIGH |
| Horizontal | 1440x900 | Media left; title above price/action on the right; every region `0px` delta | Selected title moves y `+10px`; action row moves y `-24px`; price moves y `-19px`; action moves x `-68px`, y `-14px`, and expands `+68px` | BLOCKER |
| Horizontal | 390x844 | Same row-card hierarchy; every region `0px` delta | Selected title moves y `+10px`; action row moves y `-8.95px`; price moves y `-4.47px`; action moves x `-68px` and expands `+68px` | BLOCKER |

## Semantic review

| Region | Reference | Actual | Difference | Severity | Measured evidence | Proposed owner | Required fix |
|---|---|---|---|---|---|---|---|
| Desktop card grid | Approved CL-A direction | Four equal tracks with framed image-first cards | Intentional visual change from baseline | ACCEPTED | 916.75px grid; four 220.188px tracks; 12px gap; equal 363.016px cards | Classic preset CSS | None |
| Mobile card grid | Approved CL-A direction | Two equal tracks with compact icon CTA | Intentional visual change from baseline | ACCEPTED | 390px: 171.594px tracks and 274px cards; 360px: 157.19px tracks and 274px cards | Classic preset CSS | None |
| Stateful geometry | Stable outer shell and stable internal tracks | Outer height stays fixed, but selected state reflows media, title, price, and action | Internal reflow was missed by the revision-1 outer-height-only check | BLOCKER | See revision-3 table; EB internal deltas are zero | Classic preset CSS | Reserve identical title and price/action tracks for add and quantity states |
| Keyboard focus | Visible non-clipped focus | Two-pixel solid outline with two-pixel offset | None | ACCEPTED | `:focus-visible` computed active at desktop and mobile widths | Classic preset CSS | None |
| Compact desktop card grid | Approved CO-A direction | Three equal framed image-first cards | Intentional grouping improvement | ACCEPTED | 797.172px grid; three ~257.72px tracks; 12px gap; equal 311.313px cards | Compact preset CSS | None |
| Compact responsive grid | Approved CO-A direction | Two columns below the shared 800px container boundary | Prior shared cascade produced one column in desktop-width emulation and was corrected | ACCEPTED | 768: ~347.76px tracks; 390: 166.312px; 360: ~151.91px; zero overflow | Compact preset CSS | None |
| Compact stateful geometry | Stable shell and stable price/action tracks | Shell remains fixed; price and control widths and x positions change by 68px | Internal horizontal layout shift | HIGH | Desktop and mobile rectangle deltas recorded above | Compact preset CSS | Keep price and action allocations identical across add and quantity states |
| Horizontal desktop grid | Approved HO-A direction | Two equal framed row cards | Intentional grouping and density improvement | ACCEPTED | Two ~424.297px tracks; equal 154px cards; 136px media/content row | Horizontal preset CSS | None |
| Horizontal responsive grid | Approved HO-A direction | One column below the shared 800px shell boundary | Corrected prior two-column 768px behavior | ACCEPTED | Root 799px: one column; 768/390/360: one column and 138px cards; zero overflow | Horizontal preset CSS | None |
| Horizontal stateful geometry | Stable bounded row and stable right-side tracks | Shell remains fixed; title and action tracks move vertically and the control moves horizontally | Internal two-axis layout shift | BLOCKER | Desktop and mobile rectangle deltas recorded above | Horizontal preset CSS | Fix right-side rows and reserve a constant action column |

Severity: BLOCKER, HIGH, MEDIUM, LOW, or ACCEPTED. ACCEPTED requires an intentional approved deviation.

## Remediation, approved masks, and baseline approval

No masks were used. Revision 3 fails semantic geometry QA. Remediation must remain in the three preset-owned raw CSS files, preserve the existing DOM and behavior, and produce `0px` delta for every measured internal region across unselected, selected, quantity, and restored states.
