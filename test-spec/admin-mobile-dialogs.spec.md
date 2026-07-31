---
schema_version: 1
id: admin-mobile-dialogs
title: Admin Mobile Dialogs Test Spec
type: test-spec
status: active
summary: Verifies the accessible native dialog contract shared by app-owned Admin modal workflows.
last_audited: 2026-07-30
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/components/bundle-configure/LocalAppModal.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - dialog
keywords:
  - mobile-sheet
  - focus-restoration
---

# Test Spec: Admin Mobile Dialogs

**Spec ID:** admin-mobile-dialogs  **Created:** 2026-07-30

## Purpose

Keep app-owned configure workflows accessible while their phone presentation changes to a full-width bottom sheet.

## Test Cases

### LocalAppModal

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Modal opens | Title, content, and actions | Native modal dialog with labelled content | Escape and focus behavior remain runtime concerns |

## Acceptance Criteria

- [x] The shared modal uses native dialog semantics.
- [x] Focused unit tests pass.
- [ ] Phone and desktop presentation is verified in Chrome.
