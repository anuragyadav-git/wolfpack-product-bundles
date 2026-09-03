---
schema_version: 1
id: error-page-redesign
title: Error Page Redesign Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for the Only Bundles branded Admin error page and its recovery actions.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - admin-ui
systems:
  - remix-error-boundaries
source_paths:
  - app/components/ErrorPage.tsx
  - app/components/ErrorPage.css
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
| 1 | Server error | JavaScript `Error` | Shows the 500 guidance, canonical Only Bundles logo, and technical details | Details remain collapsed by default |
| 2 | Missing page | Route response with status 404 | Shows the 404 guidance without technical details | No styling assertions |
| 3 | Return to dashboard | Activate the dashboard action | Navigates to `/app/dashboard` with history replacement | Preserves embedded navigation behavior |
| 4 | Contact support | Activate the support action | Opens the existing Crisp support flow | No alternate support destination |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Primary action uses the current Polaris `s-button` brand-fill contract
- [x] No test asserts CSS, class names, or element placement
- [x] Desktop Chrome verification passes
- [ ] Mobile Chrome verification is blocked because `resize_page` remained at 1280x800
