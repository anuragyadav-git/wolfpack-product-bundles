---
schema_version: 1
id: ppb-step-minimum-quantity
title: PPB Step Minimum Quantity
type: test-spec
status: active
summary: Verifies optional PPB steps remain optional while Shopify component metadata uses valid positive quantities.
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

Keep merchant step-selection semantics separate from Shopify's fixed component metadata constraints.

## Test Cases

### Step defaults and save validation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Create a new bundle step | Step number | Step has min 0 and max 10 | Step is optional by default |
| 2 | Save an optional PPB category step | Step min 0 with category products | Save succeeds and persists min 0 | Merchant does not force a selection |
| 3 | Serialize an optional step to the bundle parent | Step min 0 with component candidates | `component_quantities` contains 1 and runtime config contains step min 0 | Shopify and storefront contracts remain separate |
| 4 | Serialize an optional step to component metadata | Step min 0 with component candidates | `component_parents` contains quantity 1 | Parent and component metadata agree |

## Acceptance Criteria

- [x] New steps are optional by default.
- [x] Optional step minima persist without being promoted.
- [x] Shopify component metadata contains only positive quantities.
- [x] Runtime UI config preserves optional step minima.
- [x] Focused tests pass.
