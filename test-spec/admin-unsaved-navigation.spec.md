---
schema_version: 1
id: admin-unsaved-navigation
title: Admin Unsaved Navigation
type: test-spec
status: active
summary: Verifies that unsaved Admin navigation is blocked with contextual save bar feedback and no separate error flow.
last_audited: 2026-07-26
owners:
  - wolfpack
domains:
  - admin
systems:
  - bundle-configuration
source_paths:
  - app/lib/admin-unsaved-navigation.ts
related_docs: []
tags:
  - bfs
  - save-bar
keywords:
  - unsaved-navigation
  - contextual-save-bar
---

# Test Spec: Admin Unsaved Navigation

**Spec ID:** admin-unsaved-navigation  **Created:** 2026-07-26

## Purpose

Ensure bundle configuration pages block section or back navigation when changes
are unsaved and signal the existing Shopify contextual save bar.

## Test Cases

### blockUnsavedAdminNavigation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Unsaved changes | `true` | Returns `true` and irritates the save bar once | Navigation remains blocked |
| 2 | No unsaved changes | `false` | Returns `false` without save bar feedback | Navigation may continue |

## Acceptance Criteria

- [ ] Unsaved navigation is blocked.
- [ ] The contextual save bar irritation callback runs exactly once.
- [ ] Clean navigation does not trigger save bar feedback.
