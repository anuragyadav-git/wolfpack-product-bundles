---
schema_version: 1
id: storefront-design-director-browser-report-template
title: Browser Test Report Template
type: design-job-template
status: approved
summary: Records the completed Chrome QA matrix for all FPB summary templates and configurable state families.
last_audited: 2026-08-06
owners:
  - Aditya Awasthi
domains:
  - browser-qa
systems:
  - storefront-design-director
source_paths:
  - design-jobs/fpb-all-template-summary-qa-20260806/qa
related_docs:
  - design-jobs/fpb-all-template-summary-qa-20260806/browser-test-plan.yaml
tags:
  - qa
keywords:
  - chrome
  - fpb-summary
---

# Browser Test Report

Artifact job ID: fpb-all-template-summary-qa-20260806
Artifact revision: 4
Artifact status: approved

## Preflight and conditions

Direct Chrome DevTools MCP used the connected default Chrome 150 profile, the authenticated Agent storefront, branch `feature/26.05-UI-changes`, and remediation commit `124517e6`. Cache Storage was cleared where available and every implementation check used an ignore-cache hard reload. The dev server and tunnel were not restarted.

All 16 mandatory checks in `preflight.json` passed. Storefront-only screenshots were written without browser chrome. Viewports covered 320x720, 360x800, 390x844, 414x896, 768x1024, 1024x768, 1280x800, 1440x900, and 1536x960, plus measured 319/320, 600, 767/768/769, and 1023/1024/1025 ownership boundaries.

## Gate summary

| Gate | Status | Evidence |
|---|---|---|
| Functional | Passed | Nine result files; 73 focused tests passed |
| Visual | Passed | Live semantic review plus eight comparison summaries |
| Geometry | Passed | Zero horizontal overflow; visible and reachable actions |
| Responsive | Passed | Tray below 1024px component width; sidebar at 1024px and above |
| Console | Passed | No component violations; ambient Shopify/theme findings allowlisted |
| Network | Passed | Widget assets and bundle data returned successfully |
| Accessibility | Passed | Named controls, focus recovery, 44px targets, Lighthouse component score 1.0 |
| Performance | Passed | CLS 0.00; no summary-induced shift |
| Non-regression | Passed | Standard, Classic, Compact, and Horizontal direct coverage |

## Case results

| Case | Viewport | State | Result | Attempts |
|---|---|---|---|---:|
| qa-empty-slots-mobile-320 | 320x720 | Empty and slots | Passed | 2 |
| qa-selection-flow-mobile-360 | 360x800 | Partial, exact, overflow, remove, Clear | Passed | 1 |
| qa-disclosure-responsive-mobile-390 | 390x844 | Collapsed and expanded tray | Passed | 1 |
| qa-quantity-pricing-mobile-414 | 414x896 | BQO tiers, discounts, totals | Passed | 2 |
| qa-offers-copy-tablet-768 | 768x1024 | Offers, add-ons, gifts, copy | Passed | 1 |
| qa-loading-recovery-desktop-1024 | 1024x768 | Loading and hydration | Passed | 1 |
| qa-controls-submit-desktop-1280 | 1280x800 | Navigation, clear, submit | Passed | 1 |
| qa-content-stress-desktop-1440 | 1440x900 | Long copy, currency, locale, long list | Passed | 1 |
| qa-reduced-motion-regression-desktop-1536 | 1536x960 | Reduced-motion regression | Passed with waiver | 1 |

## Findings and retries

- Horizontal at 320px initially let the cart CTA intercept the disclosure hit target. Responsive top padding corrected it; 320px and 414px retests passed.
- Selecting Box of 4 initially left CTA copy on the default Box of 2 tier. Runtime selected-rule precedence was corrected with a red-to-green behavior test; the 15% tier, total, slots, and CTA now synchronize.
- A rich expanded 414px tray initially pushed the CTA below the viewport. The shared tray now uses a bounded content-driven grid with an internally scrollable list; the CTA remains visible at 320px and 414px.
- Native `prefers-reduced-motion` emulation was unavailable in the connected MCP schema. The user-approved waiver relies on static media-query inspection plus immediate final-state interaction proof.

## Console, network, accessibility, and performance

The only console/network findings were page-level Shopify/theme 404, telemetry 503, and preload warnings. Component assets and data succeeded. Desktop and mobile Lighthouse snapshots found no FPB component accessibility issue; the page-level score was 0.89 due to one theme field-label issue. The performance trace recorded LCP 5547ms, TTFB 17ms, render delay 5531ms, and CLS 0.00. LCP remains a separate page-level concern; the summary remediation introduced no layout shift.

The automated comparison threshold was intentionally broad because target and current captures represent different content states. Those comparisons validate dimensions and artifact plumbing only. Live semantics, computed geometry, interaction behavior, and the state matrix control acceptance.

## Final approval status

Approved. `qa/browser-artifact-summary.json` reports `overall_status: approved`, all nine gates passed, and no missing evidence.
