---
schema_version: 1
id: ppb-step-minimum-quantity
title: PPB Step Minimum Quantity
type: test-spec
status: active
summary: Verifies new PPB steps and save validation respect Shopify's minimum component quantity.
last_audited: 2026-08-10
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - product-page-bundle
source_paths:
  - app/lib/bundle-config/step-defaults.ts
  - app/hooks/useBundleSteps.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
related_docs: []
tags:
  - ppb
  - quantity
keywords:
  - minQuantity
  - component quantities
---

# Test Spec: PPB Step Minimum Quantity

**Spec ID:** ppb-step-minimum-quantity  **Created:** 2026-08-10

## Purpose

Prevent PPB saves from sending zero component quantities to Shopify metafields.

## Test Cases

### Step defaults and save validation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Create a new bundle step | Step number | Step has min 1 and max 10 | Shared FPB/PPB constructor |
| 2 | Save component-bearing PPB step below minimum | Step min missing with category products | HTTP 400 before persistence or metafield sync | Shopify rejects zero component quantity |

## Acceptance Criteria

- [ ] New steps include Shopify-valid quantity defaults.
- [ ] Invalid component-bearing steps are rejected before Prisma and metafield mutation.
- [ ] Focused tests pass.
