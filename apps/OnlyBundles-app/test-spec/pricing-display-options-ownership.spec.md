---
schema_version: 1
id: pricing-display-options-ownership
title: Pricing Display Options Ownership Test Spec
type: test-spec
status: active
summary: Verifies that pricing display options cross Admin, persistence, localization, and storefront boundaries through one direct owner.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - pricing
systems:
  - bundle-configure
  - storefront-runtime
source_paths:
  - app/lib/pricing-display-options.ts
  - app/assets/widgets/shared/localized-bundle-config.ts
  - app/hooks/useBundlePricing.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
  - internal docs/Features/Pricing Pipeline.md
tags:
  - tdd
  - pricing
keywords:
  - display options
  - canonical owner
---

# Test Spec: Pricing Display Options Ownership

**Spec ID:** pricing-display-options-ownership  **Created:** 2026-09-10

## Purpose

Remove the remaining `messages.displayOptions` compatibility envelope so
`BundlePricing.displayOptions` is the only Admin, persistence, localization,
and storefront owner.

## Test Cases

### Direct Display Options

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Normalize saved options | Direct `displayOptions` and pricing rules | Quantity and progress settings use the direct field | No message envelope |
| 2 | Stale nested copy is present | Direct options plus conflicting `messages.displayOptions` | Direct options win and the nested copy is ignored | No compatibility read |
| 3 | Serialize normalized options | Normalized quantity and progress settings | Return the direct display-options value | Do not return message fields |
| 4 | Localize quantity-option copy | Direct localized option map | Project the requested locale into direct `pricing.displayOptions` | Pricing messages stay text-only |
| 5 | Only stale nested copy exists | `messages.displayOptions` without direct options | Use current defaults and do not project the stale copy | Sync Bundle is the upgrade path |

## Acceptance Criteria

- [x] Normalization accepts direct display options and ignores the retired nested copy.
- [x] Serialization returns the direct display-options contract without a messages envelope.
- [x] FPB and PPB save paths persist only `BundlePricing.displayOptions`.
- [x] Storefront localization reads only `pricing.displayOptions`.
- [x] Focused tests, full unit tests, typecheck, ESLint, Knip, Graphify, and build checks pass.
