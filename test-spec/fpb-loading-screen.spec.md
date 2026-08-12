---
schema_version: 1
id: fpb-loading-screen
title: FPB Loading Screen
type: test-spec
status: active
summary: Verifies that FPB transient loading states use one store-level customizable loading screen instead of skeletons.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
  - storefront
systems:
  - settings-design
  - fpb-widget
source_paths:
  - app/lib/settings-design-contract.ts
  - app/lib/settings-design-runtime.ts
  - app/routes/root/wpb.$bundleId.tsx
  - app/assets/widgets/full-page/bootstrap-skeleton.ts
  - app/assets/widgets/full-page/methods/product-grid-methods.ts
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - fpb
  - loading
keywords:
  - loading screen
  - spinner
  - gif
---

# Test Spec: FPB Loading Screen

**Spec ID:** fpb-loading-screen  **Created:** 2026-08-13

## Purpose

Ensure Settings Design owns the FPB loading appearance and every transient FPB loading state uses the same spinner-or-GIF screen without card or sidebar skeletons.

## Test Cases

### SettingsDesignLoadingContract

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Default loading design | No saved loading values | White background and default spinner | Store-level default |
| 2 | Customized loading design | HTTPS GIF URL and CSS color | Runtime stores both values | No schema migration |
| 3 | Unsafe loading GIF | Non-HTTPS URL | Payload is rejected | Storefront-safe media |

### FPBLoadingRuntime

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Proxy first paint | Saved loading screen settings | Marker contains one loading screen and no skeleton cards | Server-rendered before hydration |
| 2 | Product grid load | Any FPB preset | Product grid is empty and loading overlay is shown | No template exception |
| 3 | Hydration completes | Transferred loading screen | Loading screen is removed and busy state clears | Atomic handoff |

## Acceptance Criteria

- [x] Settings Design validates and persists the loading GIF and background.
- [x] FPB first paint contains no loading skeleton markup.
- [x] Every FPB preset uses the loading overlay while products load.
- [x] The default spinner and uploaded GIF paths are both covered.
