---
schema_version: 1
id: configure-deferred-overlays-hydration
title: Configure Deferred Overlays Hydration Test Spec
type: test-spec
status: active
summary: Verifies that deferred FPB and PPB overlay updates cannot interrupt Admin Suspense hydration.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/routes/app/_shared/bundle-configure/deferred-configure-overlays.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/ConfigureBundleFlow.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
  - internal docs/Operations/Admin Performance.md
tags:
  - tdd
  - regression
keywords:
  - hydration
  - suspense
  - overlays
---

# Test Spec: Configure Deferred Overlays Hydration

**Spec ID:** configure-deferred-overlays-hydration  **Created:** 2026-08-30

## Purpose

Prevent the lazy configure overlay tree from forcing client rendering when its
idle callback fires before the surrounding Suspense boundary finishes hydration.

## Test Cases

### Deferred Configure Overlay Reveal

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Idle overlay reveal runs during hydration | Visibility update callback | React schedules the update as a transition and invokes the callback once | Shared by FPB and PPB configure routes |

## Acceptance Criteria

- [x] FPB and PPB use the shared transition-owned reveal behavior.
- [x] Focused tests, typecheck, ESLint, production build, and Chrome SIT verification pass.
