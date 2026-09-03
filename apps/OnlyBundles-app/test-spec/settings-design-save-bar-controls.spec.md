---
schema_version: 1
id: settings-design-save-bar-controls
title: Settings Design Save Bar and Controls
type: test-spec
status: active
summary: Verifies the Settings Design contextual Save Bar lifecycle and persisted partial-success behavior.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - admin
systems:
  - design-settings
source_paths:
  - app/routes/app/app.settings/SettingsFeedback.tsx
  - app/routes/app/app.settings/SettingsRoute.tsx
  - app/routes/app/app.settings.tsx
related_docs:
  - internal docs/EB Settings Design Reference.md
tags:
  - settings-design
  - save-bar
keywords:
  - ui-save-bar
  - persisted
---

# Test Spec: Settings Design Save Bar and Controls

**Spec ID:** settings-design-save-bar-controls  **Created:** 2026-08-28

## Purpose

Confirm that the programmatic App Bridge Save Bar protects Design changes during persistence and that a committed Design snapshot is acknowledged when downstream storefront synchronization fails.

## Test Cases

### SettingsDesignSaveBarControls

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Design save is in flight | Dirty Design state with `isSaving=true` | Save and Discard are disabled | Prevents duplicate submission and discard/save races |
| 2 | Merchant discards Design edits | Open contextual Save Bar | Confirmed values are restored and the Save Bar hides | Matches the programmatic App Bridge Save Bar contract; leave confirmation is reserved for navigation |
| 3 | Runtime sync fails after Design persistence | Both Design rows commit; PPB runtime sync rejects | Response reports `persisted=true`, `runtimeSynced=false`, and returns the saved snapshot | Keeps dirty state aligned with committed data while surfacing the sync error |
| 4 | Complete configurable-control runtime audit | Change each configurable Design field from its default | Every field changes the normalized persisted storefront runtime | One exhaustive behavior test covers all controls without CSS or placement assertions |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Existing Settings Design focused tests remain green
- [x] Direct Chrome DevTools QA confirms dirty, discard, save, persistence, and navigation behavior
