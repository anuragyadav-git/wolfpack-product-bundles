---
schema_version: 1
id: fpb-all-template-summary-remediation
title: FPB All-Template Summary Remediation List
type: qa-remediation-list
status: complete
summary: Records measured all-template summary QA failures, canonical owners, corrections, and rerun scope.
last_audited: 2026-08-06
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
Artifact status: complete

| ID | Gate | Region and state | Expected | Actual | Measured delta | Severity | Canonical owner | Correction | Retest cases | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REM-001 | Responsive / geometry | Shared summary ownership at viewport 1024px, measured widget 1013px | `data-fpb-summary-mode="tray"` displays the tray and hides the desktop panel | Runtime reported `tray`, but viewport media rules hid the tray and displayed the desktop panel | Ownership disagreed across one critical boundary: tray `display:none`, panel `display:flex` | HIGH | `app/assets/widgets/full-page-css/shared/mobile-summary-footer.css` | Removed viewport ownership from shared mode selectors; measured runtime mode now owns visibility | `qa-disclosure-responsive-mobile-390`; all nine viewports; four-preset smoke | Resolved |
| REM-002 | Accessibility | Compact desktop summary text and price contrast | Component text meets WCAG AA against the white summary surface | Subtitle/count were 3.54:1 and total was 3.78:1 | Three component-owned Lighthouse failures | HIGH | `app/assets/widgets/full-page-css/templates/side-footer-compact.css` | Derive darker contrast-safe Compact summary inks from merchant colors | Desktop Lighthouse rerun | Resolved |
| REM-003 | Accessibility / interaction | Clear confirmation keyboard flow | Tab remains contained; cancel restores trigger; confirm restores persistent summary control | Confirm left focus on the document body and Tab did not wrap | One stale-focus path and one missing modal loop | HIGH | `app/assets/widgets/full-page/methods/clear-cart-confirmation-methods.js` | Added focus origin, Tab wrap, cancel restoration, and deferred post-rerender disclosure focus | Focused unit tests and live 390px Chrome flow | Resolved |

## Infrastructure blockers and product failures

- REM-001 is a product failure, not an infrastructure blocker. Chrome, route, fixture, and evidence capture remain available.
- INFRA-001 resolved after the user restored the supplied SIT process. The canonical app-proxy route, widget assets, settings routes, and view mutation returned successfully on rerun.

## Approved waivers

| ID | Reason | Risk | Approver | Timestamp | Follow-up |
|---|---|---|---|---|---|

## Retry history

| Case | Attempt | Failure class | Evidence | Fast checks | Full matrix | Result |
|---|---|---|---|---|---|---|
| qa-disclosure-responsive-mobile-390 | 1 | Product responsive ownership | `qa/results/qa-disclosure-responsive-mobile-390.result.json` | 1024 viewport / 1013 container | Pending | Failed |
| qa-disclosure-responsive-mobile-390 | 2 | Infrastructure: supplied SIT process unavailable | Canonical storefront document request returned HTTP 500; process audit found no dev/tunnel process | Standard, Classic, Horizontal passed at 1024/1013 before outage | Compact and full matrix pending | Blocked |
| qa-disclosure-responsive-mobile-390 | 3 | Product remediation rerun | `qa/browser-artifact-summary.json` | Compact passed 1024/1013; dialog focus and contrast remediated | Nine viewports and final Chrome gates passed | Passed |
