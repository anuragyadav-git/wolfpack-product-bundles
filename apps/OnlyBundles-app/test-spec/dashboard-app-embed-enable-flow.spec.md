---
schema_version: 1
id: dashboard-app-embed-enable-flow-test-spec
title: "Test Spec: Dashboard App Embed Enable Flow"
type: test-spec
status: active
summary: Behavior coverage for the dashboard instructional app embed enablement flow.
last_audited: 2026-08-21
owners:
  - engineering
domains:
  - admin
systems:
  - app-bridge
  - theme-app-extension
source_paths:
  - app/routes/app/app.dashboard/dashboard-app-embed-enable-flow.ts
  - app/routes/app/app.dashboard/AppEmbedEnableModal.tsx
  - app/routes/app/app.dashboard/DashboardPage.tsx
  - tests/unit/routes/dashboard-app-embed-enable-flow.test.ts
related_docs:
  - internal docs/Shopify Integration/Theme App Extensions.md
  - internal docs/Operations/Admin Performance.md
tags:
  - testing
  - dashboard
keywords:
  - app embed
  - theme editor
  - return detection
---

# Test Spec: Dashboard App Embed Enable Flow
**Spec ID:** dashboard-app-embed-enable-flow  **Created:** 2026-08-21

## Purpose
Ensure the dashboard teaches merchants how to enable the Wolfpack app embed and reports success only after Shopify App Bridge confirms the published-theme extension is active.

## Test Cases
### EnableFlowState
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Banner enable action | Open event | Idle modal opens without marking the Theme Editor as visited | Theme Editor is opened only by the modal CTA |
| 2 | Theme Editor launched | Editor-opened event | Modal enters detecting state and records merchant visit | Status remains unresolved |
| 3 | Active extension detected | App Bridge returns active app embed | Success state and enabled status | Only confirmed active changes the banner |
| 4 | Inactive extension detected | App Bridge returns inactive app embed | Failure state and disabled status | Offers retry and support |
| 5 | App Bridge rejects | Check throws | Failure state and disabled status | Never produces optimistic success |
| 6 | Modal closes after editor visit | Visited unresolved flow | One final check is required | Closing before a visit does not check |

### ReturnDetection
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 7 | Focus and visibility fire together | Armed return coordinator receives both events | One App Bridge request | Synchronous disarm deduplicates events |
| 8 | Retry | Coordinator is re-armed | One new check may run on the next return | Previous result does not block retry |

### ModalSemantics
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 9 | Idle state | Idle view model | Explanation, guide media, Open Theme Editor, and Cancel | No navigation on modal open |
| 10 | Detecting state | Detecting view model | Spinner and Checking your theme message | Actions are withheld during check |
| 11 | Success state | Success view model | Confirmation and Done | Completion closes and restores focus |
| 12 | Failure state | Failure view model | Warning, retry, and support actions | Support uses the existing chat action |
| 13 | Standard motion | Guide media config | WebM then MP4, autoplay, muted, loop, inline, metadata preload | Media mounts only with the open modal |
| 14 | Reduced motion | Guide media config | Autoplay disabled and controls enabled | Accessible label remains present |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Existing dashboard banner dismissal, route readiness, and status summary tests pass
