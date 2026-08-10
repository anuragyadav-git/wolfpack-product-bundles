---
schema_version: 1
id: dashboard-preview-action
title: "Test Spec: Dashboard Preview Action"
type: test-spec
status: active
summary: Verifies fresh signed FPB preview generation and direct PPB product preview navigation.
last_audited: 2026-08-11
owners:
  - engineering
domains:
  - admin
systems:
  - dashboard
source_paths:
  - app/lib/dashboard-preview-action.ts
  - app/routes/app/app.dashboard/DashboardPage.tsx
related_docs:
  - internal docs/Architecture/FPB Host Evaluation.md
tags:
  - tdd
  - preview
keywords:
  - create_fpb_preview
  - signed preview
---

# Test Spec: Dashboard Preview Action

**Spec ID:** dashboard-preview-action  **Created:** 2026-05-29

## Purpose

Map dashboard bundle state to either a fresh signed FPB preview request or the PPB parent-product URL.

## Test Cases

| # | Scenario | Input | Expected Output |
|---|---|---|---|
| 1 | Preview any FPB | Valid FPB bundle ID | `{ kind: "create_fpb_preview" }` |
| 2 | Preview PPB with product handle | Product handle and shop | Product storefront URL |
| 3 | Preview PPB without product handle | Missing handle | Merchant error message |
| 4 | FPB with app embed state | Enabled or disabled | Signed preview action remains independent of Page data |

## Acceptance Criteria

- [x] FPB never requires a Shopify Page handle.
- [x] Every FPB preview click requests a fresh signed URL.
- [x] PPB preview behavior remains product-hosted.
