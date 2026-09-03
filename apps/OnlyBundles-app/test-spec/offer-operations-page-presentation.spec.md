---
schema_version: 1
id: offer-operations-page-presentation
title: Offer Operations Page Presentation
type: test-spec
status: active
summary: Verifies dismissible informational guidance and documents the native page gutter requirement for Offer operations.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - admin
systems:
  - offer-operations
source_paths:
  - app/routes/app/app.offer-operations.tsx
  - tests/unit/routes/app-offer-operations.test.ts
related_docs:
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - tdd
  - admin
  - banner
keywords:
  - offer-operations
  - screen-gutter
  - dismissible
---

# Test Spec: Offer Operations Page Presentation

**Spec ID:** offer-operations-page-presentation  **Created:** 2026-09-01

## Purpose

Keep the standalone Offer operations page inset from the screen edges and allow
merchants to dismiss its informational CSV import guidance.

## Test Cases

### OfferOperationsRoute

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Import safety guidance renders | Initial page render | Information banner exposes the native dismiss action | Behavior test |
| 2 | Page renders at desktop and mobile widths | Authenticated Offer operations page | Content has symmetric screen gutters and no horizontal overflow | Direct Chrome visual QA; no styling unit test |

## Acceptance Criteria

- [x] The import safety information banner uses native Polaris dismissal.
- [x] The existing page content box owns symmetric inline gutters.
- [x] Desktop layout and native banner dismissal are verified directly in Chrome.
- [ ] Mobile layout is verified directly in Chrome when window resizing is available.
