---
schema_version: 1
id: error-page-redesign
title: Error Page Redesign Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for the Only Bundles branded Admin error page and its recovery actions.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin-ui
systems:
  - remix-error-boundaries
source_paths:
  - app/components/ErrorPage.tsx
  - app/root.tsx
related_docs:
  - internal docs/Architecture/Only Bundles Brand and Compatibility Boundary.md
tags:
  - tdd
  - error-state
keywords:
  - Only Bundles
  - error page
---

# Test Spec: Error Page Redesign

**Spec ID:** error-page-redesign  **Created:** 2026-08-31

## Purpose

Verify that the shared Remix error page presents the Only Bundles identity while
preserving status-specific guidance, dashboard recovery, and Crisp support.

## Test Cases

### ErrorPage

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Server error | JavaScript `Error` | Shows the 500 guidance and canonical Only Bundles logo without exposing technical details or the thrown message | Merchant-facing recovery only |
| 2 | Missing page | Route response with status 404 | Shows the 404 guidance without technical details | No styling assertions |
| 3 | Return to dashboard | Activate the dashboard action | Navigates to `/app/dashboard` with history replacement | Preserves embedded navigation behavior |
| 4 | Contact support | Activate the support action | Opens the existing Crisp support flow | No alternate support destination |
| 5 | Native splash composition | Any supported error | Renders the content and both existing actions with Polaris web components only | Visual padding and action spacing are verified in Chrome |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Primary action uses the current Polaris `s-button` brand-fill contract
- [x] No test asserts CSS, class names, or element placement
- [x] Desktop Chrome verification passes
- [x] Mobile Chrome verification passes at the smallest available real Chrome window
