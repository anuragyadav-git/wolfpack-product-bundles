---
schema_version: 1
id: admin-select-template-hydration-fix
title: Admin Select Template and Hydration Fix Test Spec
type: test-spec
status: active
summary: Verifies the Admin document hydrates without a mutable font resource.
last_audited: 2026-08-25
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
  - remix-root
source_paths:
  - app/root.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - regression
keywords:
  - select template
  - projected modal
  - hydration
---

# Test Spec: Admin Select Template and Hydration Fix

**Spec ID:** admin-select-template-hydration-fix  **Created:** 2026-08-24

## Purpose

Prevent the mutable font-link state that caused document-level hydration recovery.

## Test Cases

### Admin Document Hydration

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Root document renders its font resource | Server-rendered Admin document | Font stylesheet has no load-time media mutation | Prevents pre-hydration DOM drift |

## Acceptance Criteria

- [x] Admin navigation no longer emits the root font-link hydration mismatch.
- [x] Focused tests, typecheck, ESLint, and direct Chrome QA pass.
