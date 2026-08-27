---
schema_version: 1
id: settings-native-toast-and-save-feedback
title: "Test Spec: Settings Native Toast and Save Feedback"
type: test-spec
status: active
summary: Verifies concise Shopify success toasts, contextual error banners, and reliable Settings save snapshots.
last_audited: 2026-08-27
owners:
  - engineering
domains:
  - admin
systems:
  - settings
  - app-bridge
source_paths:
  - app/routes/app/app.settings/
related_docs:
  - internal docs/Architecture/State Management.md
tags:
  - tdd
  - settings
keywords:
  - native-toast
  - contextual-banner
  - save-feedback
---

# Test Spec: Settings Native Toast and Save Feedback
**Spec ID:** settings-native-toast-and-save-feedback  **Created:** 2026-08-27

## Purpose

Verify that Settings saves use Shopify App Bridge feedback and reconcile the exact submitted snapshot.

## Test Cases

### SettingsSaveFeedback

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Successful save | Successful action response | One native success toast | Applies to Design, Language, and Controls |
| 2 | Failed save | Failed action response with message | One contextual critical banner | Preserve server message |
| 3 | Missing response | No action response | No toast | Prevent stale feedback |
| 4 | Language snapshot | Mutable language state | Detached snapshot submitted and later confirmed | Avoid post-submit mutation |
| 5 | Partial persistence | Language or Controls write succeeds but runtime sync fails | Saved snapshot is confirmed and a contextual banner reports the sync failure | Do not mislabel persisted data as discarded |

## Acceptance Criteria

- [x] Successful Settings saves use `shopify.toast.show`.
- [x] The custom Settings toast is not rendered.
- [x] Success and failure feedback are emitted once per response through the appropriate surface.
- [x] Language persistence confirms the submitted snapshot.
- [x] Partial-success responses distinguish persistence from runtime synchronization.
