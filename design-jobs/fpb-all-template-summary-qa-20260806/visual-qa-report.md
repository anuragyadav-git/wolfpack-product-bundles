---
schema_version: 1
id: storefront-design-director-visual-qa-template
title: Visual QA Report Template
type: design-job-template
status: approved
summary: Records final semantic and responsive visual QA for every FPB summary template.
last_audited: 2026-08-06
owners:
  - Aditya Awasthi
domains:
  - visual-testing
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-all-template-summary-qa-20260806/qa/diffs
related_docs:
  - design-jobs/fpb-all-template-summary-qa-20260806/browser-test-report.md
tags:
  - visual-qa
keywords:
  - fpb-summary
  - responsive
---

# Visual QA Report

Artifact job ID: fpb-all-template-summary-qa-20260806
Artifact revision: 4
Artifact status: approved

| Case | Dimensions | Threshold | Mismatch | Automated | Semantic |
|---|---:|---:|---:|---|---|
| Standard desktop | 1440x900 | 1.0 | 0.51776698 | Passed | Passed |
| Standard mobile | 390x844 | 1.0 | 0.58848888 | Passed | Passed |
| Classic desktop | 1440x900 | 1.0 | 0.74884722 | Passed | Passed |
| Classic mobile | 390x844 | 1.0 | 0.64167578 | Passed | Passed |
| Compact desktop | 1440x900 | 1.0 | 0.64857639 | Passed | Passed |
| Compact mobile | 390x844 | 1.0 | 0.64076133 | Passed | Passed |
| Horizontal desktop | 1440x900 | 1.0 | 0.63235648 | Passed | Passed |
| Horizontal mobile | 390x844 | 1.0 | 0.52811399 | Passed | Passed |

The automated threshold is a dimension and artifact-integrity check, not a pixel-identical golden assertion: target and current references intentionally contain different selection states. Acceptance comes from direct semantic inspection, computed geometry, responsive ownership, and interaction results.

## Semantic review

| Region | Result | Measured evidence |
|---|---|---|
| Desktop sidebar | Passed | One sidebar; stable header/list/footer ownership; no horizontal overflow |
| Mobile tray | Passed | One disclosure; 44px target; bounded 75dvh expansion; CTA remains visible |
| Selection list | Passed | Long lists scroll internally while header and actions stay fixed |
| BQO pricing | Passed | Box of 2 = 5%; Box of 4 = 15%; selected tier, total, slots, and CTA synchronize |
| Controls | Passed | Remove, Clear cancel/confirm, Back, Next, and cart states retain focus and ownership |
| Content stress | Passed | Long title/subtitle, locale/currency, slots, offers, gifts, and add-ons remain reachable |

## Remediation and approval

Three measured product defects were corrected and passed targeted retries. No masks were used. Raw screenshots and diff PNGs remain local and uncommitted under the job directories. Final visual QA is approved.
