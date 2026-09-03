---
schema_version: 1
id: fpb-product-slots-availability
title: FPB Product Slots Availability
type: test-spec
status: active
summary: Verifies that FPB Product Slots can be configured only when every enabled step uses quantity-based step rules.
last_audited: 2026-08-13
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/lib/fpb-product-slots-availability.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/BundleSettingsQuantity.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - fpb
  - product-slots
keywords:
  - quantity rules
  - product slots availability
---

# Test Spec: FPB Product Slots Availability

**Spec ID:** fpb-product-slots-availability **Created:** 2026-08-13

## Purpose

Prevent merchants from enabling Product Slots when slot capacity cannot be
derived from quantity-based step rules.

## Test Cases

### ProductSlotsAvailability

| #   | Scenario                                   | Input                           | Expected Output | Notes                                           |
| --- | ------------------------------------------ | ------------------------------- | --------------- | ----------------------------------------------- |
| 1   | Every enabled step has quantity step rules | Quantity rules for all step IDs | Available       | Supports one or two rules per step              |
| 2   | One step has an amount or weight rule      | Mixed step-rule types           | Unavailable     | Every configured rule must be quantity          |
| 3   | One enabled step has no step rules         | Missing rules for one step ID   | Unavailable     | Slot capacity is not derivable                  |
| 4   | Category-rule mode is configured           | Category contains conditions    | Unavailable     | Storefront slot capacity ignores category rules |
| 5   | No enabled steps exist                     | Empty or disabled step list     | Unavailable     | No slot capacity exists                         |

## Acceptance Criteria

- [x] Product Slots is available only for quantity-based step-rule bundles.
- [x] Incompatible rule configurations cannot persist Product Slots as enabled.
- [x] Product Slots and Slot Icon controls are disabled when unavailable.
