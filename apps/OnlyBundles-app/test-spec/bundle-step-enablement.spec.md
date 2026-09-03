---
schema_version: 1
id: bundle-step-enablement
title: Bundle Step Enablement Test Spec
type: test-spec
status: active
summary: Verifies the invariant that the first bundle step remains enabled while later steps may be disabled.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - bundle-configure
source_paths:
  - app/lib/bundle-config/step-enablement.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
  - steps
keywords:
  - step enablement
  - disabled step
---

# Test Spec: Bundle Step Enablement

**Spec ID:** bundle-step-enablement  **Created:** 2026-08-13

## Purpose

Keep Step 1 enabled at the authoritative save boundary while allowing later
steps to be excluded from the storefront through their persisted enabled state.

## Test Cases

### Step Enablement Policy

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Step 1 submitted disabled | index `0`, enabled `false` | `true` | Step 1 cannot be disabled |
| 2 | Later step submitted disabled | index greater than `0`, enabled `false` | `false` | Storefront will exclude it |
| 3 | Later step enabled or unspecified | index greater than `0`, enabled `true` or omitted | `true` | Matches the direct-column default |

## Acceptance Criteria

- [x] Step 1 always persists as enabled.
- [x] A later step can persist as disabled.
- [x] An omitted enabled value remains enabled.
