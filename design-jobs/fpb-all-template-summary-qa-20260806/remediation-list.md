---
schema_version: 1
id: storefront-design-director-remediation-template
title: Remediation List Template
type: design-job-template
status: approved
summary: Records the three measured FPB summary defects, their canonical fixes, and successful retests.
last_audited: 2026-08-06
owners:
  - Aditya Awasthi
domains:
  - quality-assurance
systems:
  - storefront-design-director
source_paths:
  - app/assets/widgets/full-page
related_docs:
  - design-jobs/fpb-all-template-summary-qa-20260806/browser-test-report.md
tags:
  - remediation
keywords:
  - horizontal-tray
  - bqo-tier
---

# Remediation List

Artifact job ID: fpb-all-template-summary-qa-20260806
Artifact revision: 4
Artifact status: approved

| ID | Gate | Region and state | Actual failure | Canonical owner and correction | Retest | Status |
|---|---|---|---|---|---|---|
| R-01 | Responsive/accessibility | Horizontal mobile, 320px | Full-width CTA intercepted disclosure hit target | Horizontal source CSS reserves responsive top space for the disclosure | 320px and 414px hard reloads; 44px topmost target | Passed |
| R-02 | Functional | BQO Box of 4 | CTA retained default Box of 2 copy while pricing used 15% | `getSidebarTierCtaContent` now validates and prefers the runtime selected rule | Red-to-green unit test and live Box of 4 proof | Passed |
| R-03 | Geometry/responsive | Rich expanded tray, 414px | Long copy, tiers, and four slots pushed CTA below viewport | Shared tray uses bounded content-driven rows and an internally scrollable selected list | 320px and 414px rich-state hard reloads | Passed |

## Approved waiver

| ID | Reason | Risk | Approver | Timestamp | Follow-up |
|---|---|---|---|---|---|
| W-01 | Connected MCP schema cannot emulate `prefers-reduced-motion` | Low; static media queries and immediate final states were inspected | Aditya Awasthi | 2026-08-06T01:30:00+05:30 | Re-run natively if the MCP capability becomes available |

## Retry history

R-01 and R-03 passed the mobile minimum-width and rich-state matrix after source CSS regeneration. R-02 passed the focused behavior suite and live tier-switch flow after commit `124517e6`. No open remediation remains.
