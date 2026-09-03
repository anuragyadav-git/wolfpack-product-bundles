---
schema_version: 1
id: webhook-api-version
title: Webhook API Version
type: test-spec
status: active
summary: Verifies that production and SIT serialize their configured Shopify webhooks with API version 2026-07.
last_audited: 2026-08-24
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - webhook-configuration
source_paths:
  - shopify.app.toml
  - shopify.app.wolfpack-product-bundles-sit.toml
related_docs:
  - internal docs/Shopify Integration/Webhooks.md
tags:
  - webhooks
keywords:
  - api-version
---

# Test Spec: Webhook API Version

**Spec ID:** webhook-api-version  **Created:** 2026-08-24

## Purpose

Keep the production and SIT app-specific webhook payload contracts on Shopify API version `2026-07` while preserving the existing operational subscription set.

## Test Cases

### ShopifyWebhookSubscriptions

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Production webhook version | `shopify.app.toml` | `[webhooks].api_version` is `2026-07` | Does not inspect presentation or file placement. |
| 2 | SIT webhook version | `shopify.app.wolfpack-product-bundles-sit.toml` | `[webhooks].api_version` is `2026-07` | Keeps environments aligned. |
| 3 | Operational topics remain scoped | Both app configurations | Required topics remain and retired broad topics remain absent | Protects delivery volume and handler routing. |

## Acceptance Criteria

- [x] Both app configurations use webhook API version `2026-07`.
- [x] Existing operational webhook-topic tests pass.
- [x] Shopify's live configuration validator accepts both files.
