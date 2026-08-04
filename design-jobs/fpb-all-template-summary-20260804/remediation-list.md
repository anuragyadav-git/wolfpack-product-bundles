---
schema_version: 1
id: fpb-all-template-summary-remediation
title: FPB All-Template Summary Remediation List
type: qa-remediation-list
status: active
summary: Records measured all-template summary QA failures, canonical owners, corrections, and rerun scope.
last_audited: 2026-08-05
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page-css/shared/mobile-summary-footer.css
  - design-jobs/fpb-all-template-summary-20260804/qa/results/qa-disclosure-responsive-mobile-390.result.json
related_docs:
  - design-jobs/fpb-all-template-summary-20260804/visual-qa-report.md
tags:
  - template
keywords:
  - remediation
  - measured-delta
---

# Remediation List

Artifact job ID: fpb-all-template-summary-20260804
Artifact revision: 2
Artifact status: active

| ID | Gate | Region and state | Expected | Actual | Measured delta | Severity | Canonical owner | Correction | Retest cases | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REM-001 | Responsive / geometry | Shared summary ownership at viewport 1024px, measured widget 1013px | `data-fpb-summary-mode="tray"` displays the tray and hides the desktop panel | Runtime reported `tray`, but viewport media rules hid the tray and displayed the desktop panel | Ownership disagreed across one critical boundary: tray `display:none`, panel `display:flex` | HIGH | `app/assets/widgets/full-page-css/shared/mobile-summary-footer.css` | Remove viewport ownership from the shared mode selectors so the measured runtime mode is authoritative; retain preset presentation and reduced-motion behavior | `qa-disclosure-responsive-mobile-390`; all nine viewports; four-preset 390/1440 smoke | In progress |

## Infrastructure blockers and product failures

- REM-001 is a product failure, not an infrastructure blocker. Chrome, route, fixture, and evidence capture remain available.

## Approved waivers

| ID | Reason | Risk | Approver | Timestamp | Follow-up |
|---|---|---|---|---|---|

## Retry history

| Case | Attempt | Failure class | Evidence | Fast checks | Full matrix | Result |
|---|---|---|---|---|---|---|
| qa-disclosure-responsive-mobile-390 | 1 | Product responsive ownership | `qa/results/qa-disclosure-responsive-mobile-390.result.json` | 1024 viewport / 1013 container | Pending | Failed |
