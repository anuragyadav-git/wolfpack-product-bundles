---
schema_version: 1
id: settings-save-bar-lifecycle
title: Settings Save Bar Lifecycle Test Spec
type: test-spec
status: active
summary: Verifies that Settings registers App Bridge Save Bar commands only while its mounted save bar has been opened.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - admin
systems:
  - settings
  - app-bridge
source_paths:
  - app/routes/app/app.settings/SettingsFeedback.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - regression
keywords:
  - save bar
  - lifecycle
  - settings
---

# Test Spec: Settings Save Bar Lifecycle

**Spec ID:** settings-save-bar-lifecycle  **Created:** 2026-08-30

## Purpose

Prevent clean Settings workspace mounts and unmounts from asking App Bridge to
hide a Save Bar that has never been registered or has already left the DOM.

## Test Cases

### SettingsContextualSaveBar

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Clean workspace mounts | `isOpen=false` | No App Bridge show or hide command | Avoid missing-ID rejection |
| 2 | Workspace becomes dirty | `false` to `true` | Show command runs once | Existing behavior |
| 3 | Dirty changes are cleared | `true` to `false` | Hide command runs once | Element is still mounted |
| 4 | Clean workspace unmounts | Mounted `isOpen=false` | No cleanup hide command | Custom element owns removal |

## Acceptance Criteria

- [x] Settings workspace switching emits no missing Save Bar error.
- [x] Focused tests, typecheck, ESLint, build, and Chrome SIT verification pass.
