---
schema_version: 1
id: integrations-page-parity
title: Integrations Page Parity Test Spec
type: test-spec
status: active
summary: Verifies the immediately rendered supported-integration catalog and unsent Crisp request draft.
last_audited: 2026-08-30
owners:
  - Wolfpack Product Bundles
domains:
  - integrations
systems:
  - admin-integrations
source_paths:
  - app/lib/admin-configuration-surfaces.ts
  - app/lib/support-chat.client.ts
  - app/routes/app/app.integrations.tsx
  - app/routes/app/app.integrations/IntegrationsRouteShell.tsx
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

Keep the merchant guidance hub focused on the three integrations that need
dedicated setup guidance. Shopify Checkout and Theme Cart Drawer remain owned
by Settings rather than appearing as duplicate catalog entries.

## Test Cases

### IntegrationsData

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Compact inventory | `INTEGRATION_CATEGORIES` | Judge.me, GoKwik, and Shopflo only | Native checkout options stay in Settings |
| 2 | Stable order | All categories | Reviews followed by Checkout | One catalog traversal |
| 3 | Supportability | Every card | Supported or Guided setup | Card presence never implies connection |
| 4 | Setup actions | Every card | WPB-owned safe destination | No competitor guide URL |

### IntegrationsRoute

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Initial route paint | Route mount | Integration catalog renders immediately | No artificial readiness interval |
| 2 | Compact route | Ready | Three cards, statuses, and setup actions appear | Uses Polaris web components first |
| 3 | Request Integration | Explicit click | Opens Crisp, then prefills an unsent request after the chat-open lifecycle event | Merchant must press Send; the draft must not race widget initialization |
| 4 | Responsive traversal | Desktop and mobile | One predictable card order | Visual proof via direct DevTools |

## Acceptance Criteria

- [x] Judge.me, GoKwik, and Shopflo are the only catalog cards.
- [x] Shopify Checkout and Theme Cart Drawer are absent from the source inventory.
- [x] Request Integration opens Crisp with an unsent prefilled message.
- [x] The integration catalog does not wait for an artificial loading interval.
- [x] Focused behavior tests pass.
- [x] Desktop and mobile Chrome proof is recorded.
