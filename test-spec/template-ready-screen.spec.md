---
schema_version: 1
id: template-ready-screen
title: Template Ready Screen Test Spec
type: test-spec
status: active
summary: Behavioral coverage for the shared FPB and PPB post-template preview screen.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/bundle-configure/TemplateReadyScreen.tsx
  - app/lib/template-ready-step.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - template-selection
  - parity
keywords:
  - view-your-bundle
  - preview-bundle
---

# Test Spec: Template Ready Screen

**Spec ID:** template-ready-screen **Created:** 2026-07-30

## Purpose

Preserve the shared post-template preview behavior while FPB and PPB match the live EB completion screen.

## Test Cases

### TemplateReadyScreen

| #   | Scenario        | Input              | Expected Output                                                | Notes                               |
| --- | --------------- | ------------------ | -------------------------------------------------------------- | ----------------------------------- |
| 1   | Ready state     | Preview is idle    | Completion heading, supporting copy, and preview action render | Shared by FPB and PPB               |
| 2   | Preview loading | Preview is running | Preview action is loading and disabled                         | Prevents duplicate preview requests |

### resolveTemplateReadyStep

| #   | Scenario           | Input   | Expected Output        | Notes                                 |
| --- | ------------------ | ------- | ---------------------- | ------------------------------------- |
| 1   | App embed enabled  | `true`  | `confirm`              | Shows completion without save latency |
| 2   | App embed disabled | `false` | `enableThemeExtension` | Preserves the preview setup gate      |

### shouldProcessTemplateResponse

| #   | Scenario                                             | Input                                             | Expected Output | Notes                      |
| --- | ---------------------------------------------------- | ------------------------------------------------- | --------------- | -------------------------- |
| 1   | Optimistic screen renders before the request starts  | Idle fetcher, pending request, submission not started | `false`     | Prevents a false save error |
| 2   | Request completes                                    | Idle fetcher, pending request, submission started | `true`          | Handles the real response  |
| 3   | Request is active                                    | Submitting fetcher, pending request                | `false`         | Keeps Preview loading      |
| 4   | No request exists                                    | Idle fetcher, no pending request                   | `false`         | Ignores unrelated state    |

## Acceptance Criteria

- [x] All listed behavioral tests pass.
- [x] FPB and PPB use the same completion-screen component.
- [x] Visual parity is verified in Chrome rather than through CSS assertions.
