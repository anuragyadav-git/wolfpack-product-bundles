---
schema_version: 1
id: storefront-design-director-visual-qa-template
title: Visual QA Report Template
type: design-job-template
status: active
summary: Records baseline comparisons, masks, thresholds, semantic findings, and region-level differences.
last_audited: 2026-08-03
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
Artifact revision: 1
Artifact status: complete

| Case | Baseline | Actual | Mask | Dimensions | Threshold | Mismatch | Bounds | Automated | Semantic |
|---|---|---|---|---|---|---|---|---|---|
| Classic desktop | Classic pre-change baseline | `classic-live-desktop.png` | None | 1440x900 | Informational redesign diff | 0.18430478 | x38 y96 w1333 h712 | Expected mismatch | ACCEPTED: approved CL-A redesign; live geometry and behavior passed |
| Classic mobile | Classic pre-change baseline | `classic-live-mobile-dpr3.png` | None | 1170x2532 | Informational redesign diff | 0.4573858 | x0 y0 w1170 h2112 | Expected mismatch | ACCEPTED: approved CL-A redesign; two-column mobile geometry passed |
| Compact desktop | Approved REF-WPB/REF-EB Compact cohort | Direct Chrome live capture | None | 1440x900 | Semantic contract | Not persisted by Chrome host | N/A | Host-limited | ACCEPTED: approved CO-A frame, title reserve, and integrated action are live |
| Compact mobile | Approved REF-WPB/REF-EB Compact cohort | Direct Chrome live capture | None | 390x844 | Semantic contract | Not persisted by Chrome host | N/A | Host-limited | ACCEPTED: approved two-column Compact geometry and contained action are live |

## Semantic review

| Region | Reference | Actual | Difference | Severity | Measured evidence | Proposed owner | Required fix |
|---|---|---|---|---|---|---|---|
| Desktop card grid | Approved CL-A direction | Four equal tracks with framed image-first cards | Intentional visual change from baseline | ACCEPTED | 916.75px grid; four 220.188px tracks; 12px gap; equal 363.016px cards | Classic preset CSS | None |
| Mobile card grid | Approved CL-A direction | Two equal tracks with compact icon CTA | Intentional visual change from baseline | ACCEPTED | 390px: 171.594px tracks and 274px cards; 360px: 157.19px tracks and 274px cards | Classic preset CSS | None |
| Stateful geometry | Stable card shell | No outer-height change on hover, selection, or quantity update | None | ACCEPTED | Zero measured height delta; 44px controls remained contained | Classic preset CSS | None |
| Keyboard focus | Visible non-clipped focus | Two-pixel solid outline with two-pixel offset | None | ACCEPTED | `:focus-visible` computed active at desktop and mobile widths | Classic preset CSS | None |
| Compact desktop card grid | Approved CO-A direction | Three equal framed image-first cards | Intentional grouping improvement | ACCEPTED | 797.172px grid; three ~257.72px tracks; 12px gap; equal 311.313px cards | Compact preset CSS | None |
| Compact responsive grid | Approved CO-A direction | Two columns below the shared 800px container boundary | Prior shared cascade produced one column in desktop-width emulation and was corrected | ACCEPTED | 768: ~347.76px tracks; 390: 166.312px; 360: ~151.91px; zero overflow | Compact preset CSS | None |
| Compact stateful geometry | Stable card shell | No outer-height change on hover, selection, or quantity update | None | ACCEPTED | 272px mobile card before/after; 44px controls contained; visible 2px focus outline | Compact preset CSS | None |

Severity: BLOCKER, HIGH, MEDIUM, LOW, or ACCEPTED. ACCEPTED requires an intentional approved deviation.

## Remediation, approved masks, and baseline approval

No masks were used. Automated mismatch is expected because the approved work intentionally redesigns the cards. Semantic review passed against the approved CL-A contract; the pre-change images remain historical baselines, not replacement baselines for the unfinished three-template job.
