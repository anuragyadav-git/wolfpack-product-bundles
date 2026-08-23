---
schema_version: 1
id: app-attribution-pixel-status-card
title: Attribution Pixel Status Card
type: test-spec
status: active
summary: Verifies the attribution pixel status card does not access client-only App Bridge APIs during server rendering.
last_audited: 2026-08-23
owners:
  - engineering
domains:
  - attribution
systems:
  - admin-app
source_paths:
  - app/routes/app/app.attribution/PixelStatusCard.tsx
related_docs:
  - internal docs/Operations/Admin Performance.md
tags:
  - ssr
  - app-bridge
keywords:
  - PixelStatusCard
  - useAppBridge
---

# Test Spec: Attribution Pixel Status Card

**Spec ID:** app-attribution-pixel-status-card  **Created:** 2026-08-23

## Purpose
Ensure the attribution pixel status card can render on the Remix server without accessing client-only Shopify App Bridge APIs.

## Test Cases
### PixelStatusCard
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Server renders the inactive pixel card | `pixelActive: false` and an App Bridge proxy that throws on property access | Rendering completes and includes the pixel status heading | Effects do not execute during SSR |

## Acceptance Criteria
- [x] Server rendering does not dereference `shopify.toast`.
- [x] The focused unit test passes.
