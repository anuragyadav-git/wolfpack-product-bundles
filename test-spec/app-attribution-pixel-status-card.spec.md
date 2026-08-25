---
schema_version: 1
id: app-attribution-pixel-status-card
title: Attribution Pixel Status Banner
type: test-spec
status: active
summary: Verifies the native attribution pixel status banner renders safely, keeps warnings persistent, and allows session dismissal only after success.
last_audited: 2026-08-25
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
  - session dismissal
---

# Test Spec: Attribution Pixel Status Banner

**Spec ID:** app-attribution-pixel-status-card  **Created:** 2026-08-23

## Purpose
Ensure the attribution pixel status banner can render on the Remix server without accessing client-only Shopify App Bridge APIs, keeps the warning visible, and allows only the success state to stay dismissed for the current session.

## Test Cases
### PixelStatusCard
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Server renders the inactive pixel banner | `pixelActive: false`, a stored dismissal key, and an App Bridge proxy that throws on property access | Native warning banner renders and is not dismissible | Effects do not execute during SSR; unresolved setup cannot be hidden |
| 2 | Server renders the active pixel banner | `pixelActive: true` | Native success banner renders as dismissible | Only the resolved state exposes dismissal |
| 3 | Merchant dismissed the successful banner in this tab | `pixelActive: true` and session dismissal key exists | Banner renders nothing | Reuses the shared session helper |

## Acceptance Criteria
- [x] Server rendering does not dereference `shopify.toast`.
- [x] Warning state remains visible and cannot be dismissed.
- [x] Session dismissal hides only the success banner for the current tab.
- [x] The focused unit tests pass.
