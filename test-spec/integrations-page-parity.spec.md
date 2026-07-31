---
schema_version: 1
id: integrations-page-parity
title: Integrations Page Parity Test Spec
type: test-spec
status: active
summary: Verifies the complete ten-card integration inventory, support statuses, and safe setup actions.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - integrations
systems:
  - admin-integrations
source_paths:
  - app/lib/admin-configuration-surfaces.ts
  - app/routes/app/app.integrations.tsx
related_docs:
  - internal docs/EB Integrations Reference.md
  - docs/competitor-analysis/checkout-integrations-additional-configurations-parity-plan.md
tags:
  - admin
  - integrations
keywords:
  - integration-inventory
  - support-status
  - setup-actions
---

# Test Spec: Integrations Page Parity

**Spec ID:** integrations-page-parity  **Created:** 2026-06-04

## Purpose

Keep the merchant guidance hub aligned with the complete ten-card integration
inventory while distinguishing runtime support from guided, assisted, and
planned setup.

## Test Cases

### IntegrationsData

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Complete inventory | `INTEGRATION_CATEGORIES` | Five categories and ten cards | Uses live Admin evidence |
| 2 | Stable order | All categories | Pre-orders, Subscriptions, Reviews, Page Builders, Checkout | Optimized for the source layout |
| 3 | Supportability | Every card | Supported, Guided setup, Assisted setup, or Planned | Card presence never implies connection |
| 4 | Setup actions | Every card | WPB-owned safe destination | No competitor guide URL |
| 5 | Assisted setup | Zapiet | Assisted setup status and action | No chat notification until merchant clicks |

### IntegrationsRoute

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Complete route | Render | All categories, cards, statuses, and setup actions appear | Uses Polaris-compatible semantics |
| 2 | Request Integration | Explicit click | Opens WPB-owned contact destination | No automatic vendor intent |
| 3 | External-link safety | Setup and request actions | New browsing context with `noreferrer` | No session leakage |
| 4 | Responsive traversal | Desktop and mobile | One predictable card order | Visual proof via direct DevTools |

## Acceptance Criteria

- [x] Five categories and ten cards are present.
- [x] Every card has an accurate visible support status.
- [x] Every setup action uses a WPB-owned destination.
- [x] Focused behavior tests pass.
- [x] Desktop and mobile Chrome proof is recorded.
