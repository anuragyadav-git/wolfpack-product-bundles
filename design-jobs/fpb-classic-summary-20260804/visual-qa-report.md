---
schema_version: 1
id: storefront-design-director-visual-qa-template
title: Visual QA Report Template
type: design-job-template
status: draft
summary: Records the executed no-mask visual comparisons and semantic classification for the FPB Classic summary redesign.
last_audited: 2026-08-04
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

Artifact job ID: fpb-classic-summary-20260804
Artifact revision: 1
Artifact status: draft

| Case | Baseline | Actual | Mask | Dimensions | Threshold | Mismatch | Bounds | Automated | Semantic |
|---|---|---|---|---|---|---|---|---|---|
| desktop-1440-primary-partial | target desktop inspiration | desktop primary actual | none | 1440x900 | 0.01 | 0.747625 | full comparison | failed | unwaived; target store, theme, cards, currency, and approved component redesign differ |
| mobile-390-partial-collapsed | current mobile reference | mobile collapsed actual | none | 390x844 | 0.01 | 0.04835642 | x5 y55 w381 h789 | failed | unwaived; redesigned tray and dynamic storefront regions differ |

## Semantic review

| Region | Reference | Actual | Difference | Severity | Measured evidence | Proposed owner | Required fix |
|---|---|---|---|---|---|---|---|
| Desktop summary footer | Inspiration | Calm Review Panel | Total and CTA no longer collide; footer reflows | ACCEPTED | 21.6px action gap at 1440 | Classic CSS | none |
| Mobile disclosure | Current baseline | Updated tray | Collapsed details no longer receive focus or accessibility traversal | ACCEPTED | inert and aria-hidden live evidence | mobile summary behavior | none |
| Whole desktop viewport | Different target store | Agent storefront | Out-of-scope theme and card differences dominate | HIGH | 74.76% mismatch | approval or waiver | classify; do not alter product cards |
| Whole mobile viewport | Earlier Agent capture | Updated Agent storefront | Intended tray redesign and dynamic regions differ | MEDIUM | 4.84% mismatch | approval or waiver | approve a new baseline only after remaining gates pass |

Severity: BLOCKER, HIGH, MEDIUM, LOW, or ACCEPTED. ACCEPTED requires an intentional approved deviation.

## Remediation, approved masks, and baseline approval

No masks were used. Both automated comparisons remain failed. A new baseline must not be approved until remaining required browser cases pass and the intentional differences receive explicit approval.
