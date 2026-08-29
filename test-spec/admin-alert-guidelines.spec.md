---
schema_version: 1
id: admin-alert-guidelines
title: Admin Alert Guidelines Test Spec
type: test-spec
status: active
summary: Verifies transient error toasts and persistent contextual alerts across Wolfpack Admin surfaces.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
systems:
  - admin-ui
source_paths:
  - app/components/AdminTaskAlertBanner.tsx
  - app/lib/admin-alert-feedback.ts
  - app/store/slices/configureRouteStateSlice.ts
related_docs:
  - internal docs/Shopify Integration/Polaris Web Components Reference.md
tags:
  - tdd
  - alerts
  - polaris
keywords:
  - banner
  - inline-error
  - task-toast
---

# Test Spec: Admin Alert Guidelines

**Spec ID:** admin-alert-guidelines  **Created:** 2026-08-27

## Purpose

Keep Admin feedback proportional to how long a condition remains relevant: retryable operation failures can use transient error toasts, while unresolved blockers remain inline or in contextual banners.

## Test Cases

### AdminTaskAlert

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid task failure | ID, heading, and merchant-safe message | Normalized critical-alert model | No fallback copy |
| 2 | Missing alert copy | Blank heading or message | `null` | Do not fabricate merchant copy |
| 3 | Render task failure | Alert model and dismiss callback | Dismissible critical `s-banner` with heading and message | Polaris owns semantics |
| 4 | Recoverable failure | Alert model with action | Banner exposes the supplied recovery action | Path forward |

### ConfigureFeedback

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Transient configure action fails | Picker, sync invocation, discard, preview launch, export, or backfill | Concise App Bridge error toast | A fresh attempt starts cleanly |
| 2 | Persistent configure operation fails | Save, unsaved preview, missing product, placement, app configuration, or renderer failure | Contextual operation alert is stored | Remains until resolved or dismissed |
| 3 | Retry or success | Existing operation alert | Alert clears | Later failures can reappear |
| 4 | Rule limit reached | Two existing rules | Inline warning beside the control | No toast |
| 5 | Last-step delete is unavailable | One remaining step | Delete control is disabled | Prevent the invalid action instead of reporting an error |
| 6 | Shared configure response fails | Captured request intent | Save failure uses a banner; other operation failures use a toast | Do not classify every shared-fetcher error as persistent |

### RouteFeedback

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Settings save succeeds | Successful response | Concise App Bridge success toast | Task confirmation |
| 2 | Settings save fails | Failed response | Returned contextual alert message | No error toast |
| 3 | Informational content | Static guidance or loading state | Ordinary Polaris content or dismissible banner | Never a persistent info banner |

## Acceptance Criteria

- [x] Transient, retryable operation failures use concise App Bridge error toasts.
- [x] Successful task completion uses concise App Bridge success toasts.
- [x] Task errors persist contextually until dismissed, retried, or resolved.
- [x] Every `s-banner` supplies a supported `heading` and `tone`.
- [x] Non-critical informational banners are dismissible or ordinary content.
- [x] Tests assert behavior and semantics, never CSS, class names, or placement.
- [x] Retained banners have Polaris block spacing from adjacent content.
