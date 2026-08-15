---
schema_version: 1
id: progress-tier-defaults
title: "Test Spec: Progress Tier Defaults"
type: test-spec
status: active
summary: Verifies Step-Based Progress Bar tier defaults and rule-driven regeneration.
last_audited: 2026-08-13
owners:
  - Wolfpack Product Bundles
domains:
  - pricing
systems:
  - bundle-configure
source_paths:
  - app/lib/pricing-progress-tier-defaults.ts
  - app/hooks/useBundlePricing.ts
related_docs:
  - internal docs/EB Implementation Reference.md
tags:
  - tdd
  - progress-bar
keywords:
  - tier text
  - discount rule
---

# Test Spec: Progress Tier Defaults

**Spec ID:** progress-tier-defaults  **Created:** 2026-08-13

## Purpose

Generate FPB and PPB Step-Based Progress Bar tier copy from the active pricing rules without normalizing saved merchant copy.

## Test Cases

### Tier template generation

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Quantity percentage | Quantity 2, 5% | `2 Pack` / `Save 5%` | EB format |
| 2 | Amount percentage | Amount 5000 cents, 5% | `Spend $50` / `Save 5%` | Shop currency |
| 3 | Quantity fixed amount | Quantity 2, 500 cents | `2 Pack` / `Save $5` | Cents converted once |
| 4 | Amount fixed amount | Amount 5000 cents, 550 cents | `Spend $50` / `Save $5.5` | Compact decimals |
| 5 | Fixed bundle price | Quantity 2, 5000 cents | `2 Pack` / `Save $50` | EB format |
| 6 | Buy X, Get Y percentage | Buy 2, get 1, 100% | `Add 3` / `1 Product(s) @ 100% off` | EB format |
| 7 | Buy X, Get Y fixed amount | Buy 2, get 1, 500 cents | `Add 3` / `1 Product(s) @ $5 off` | EB format |

### Tier state transitions

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Existing saved text | Custom or blank saved entry | Entry is unchanged on load | No normalization |
| 2 | Missing rule entry | Configured rule without tier entry | Default entry is added | Other entries retained |
| 3 | Condition edit | Changed condition type/value | Tier Text regenerates only | Custom subtext retained |
| 4 | Discount edit | Changed discount value | Tier Subtext regenerates only | Custom title retained |
| 5 | Buy/Get edit | Changed Buy X, Get Y quantities | Dependent fields regenerate | Existing locales follow affected fields |
| 6 | Rule removal | Removed pricing rule | Base and localized tier entries are deleted | Unrelated rules retained |

### Shop configuration loader

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Shopify query succeeds | Shop currency | Currency code returned | Required pricing source |
| 2 | Shopify query fails | Rejected Admin GraphQL request | Error propagates | No fabricated currency fallback |
| 3 | Locale query denied | Missing optional locale scope | Empty locale list returned | Configure route remains available |

## Acceptance Criteria

- [ ] All discount methods produce the verified defaults.
- [ ] Rule edits regenerate only dependent tier fields.
- [ ] FPB and PPB use the same shared tier state.
- [ ] Shop currency comes from Shopify Admin GraphQL.
