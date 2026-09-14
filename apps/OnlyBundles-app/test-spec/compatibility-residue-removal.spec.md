---
schema_version: 1
id: compatibility-residue-removal
title: Compatibility Residue Removal Test Spec
type: test-spec
status: active
summary: Defines canonical-only behavior after verified legacy data and mutation paths are retired.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - shopify-integration
systems:
  - storefront-widget
  - analytics
  - admin-api
source_paths:
  - app/services/bundles/bundle-parent-product.server.ts
  - app/services/analytics/order-backfill.server.ts
  - app/lib/ppb-bundle-embed.ts
  - app/services/ppb-static-authorization.server.ts
  - app/lib/pricing-rule-parser.ts
  - app/lib/bundle-formatter.server.ts
  - app/lib/bundle-config/category-runtime.ts
  - app/services/bundles/metafield-sync/utils/price-adjustment.ts
  - app/services/bundles/metafield-sync/operations/bundle-product.server.ts
  - app/services/fpb-upsells.server.ts
  - app/services/ppb-bundle-embed.server.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/handlers/shared.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/runtime-config.server.ts
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/handlers/save-bundle.server.ts
  - app/routes/app/app.dashboard/route.tsx
  - app/routes/app/app.dashboard/handlers/handlers.server.ts
  - app/routes/app/app.attribution/AttributionDashboard.tsx
  - app/routes/app/app.attribution/loader.server.ts
  - app/routes/app/app.billing.tsx
  - app/routes/app/app.billing_.plans.tsx
  - app/assets/widgets/shared/specific-link-offer-eligibility.ts
related_docs:
  - internal docs/Architecture/Bundle Field Ownership.md
  - internal docs/Architecture/Database Schema.md
tags:
  - tdd
  - cleanup
keywords:
  - canonical order id
  - parent product tags
  - legacy compatibility
---

# Test Spec: Compatibility Residue Removal

**Spec ID:** compatibility-residue-removal  **Created:** 2026-09-06

## Purpose

Remove ongoing compatibility work after the configured database reports no legacy rows that require it.

## Test Cases

### Canonical Contracts

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Parent product sync | Existing or new Shopify parent product | Add only current Only Bundles tags | No recurring legacy tag removal |
| 2 | Backfill dedup | Canonical Shopify Order GID | Query and update the exact GID | No numeric dual read |
| 3 | PPB save | Current text overrides | Persist the current keys unchanged | No legacy scrub pass |
| 4 | PPB runtime identity | Static authorization or storefront eligibility receives only `bundleId` | Reject or fail closed | Canonical public bundle identity is `id` |
| 5 | Widget installation service | Dashboard and PPB placement flows import the service owner | Existing placement, preview, and deletion behavior remains unchanged | Remove the compatibility re-export barrel |
| 6 | Canonical pricing operator | Flat pricing rule uses `gte`, `gt`, `lte`, `lt`, or `eq` | Parser and derived storefront/Function payloads preserve the exact operator | Missing defaults to `gte` |
| 7 | Retired pricing aliases | Rule contains nested `condition`/`discount`, `value`, `price`, or `fixedBundlePrice` aliases | Aliases are rejected or ignored; they never override canonical fields | Sync Bundle is the upgrade path |
| 8 | Fixed bundle price | Canonical rule stores target price in `discountValue` | Runtime payload uses `discountValue` only | No duplicate `fixedBundlePrice` field |
| 9 | Step product serialization | A step or category has stale JSON `products` without a matching `StepProduct` relation | Save-time, Sync Bundle, signed app-proxy, checkout-offer, runtime-token, and subscription serializers omit stale JSON entries | `StepProduct` is the only persisted step-level product membership owner |
| 10 | Analytics funnel identity | Attribution input lacks a canonical Shopify Order GID | The row is ignored instead of receiving an invented order key | Persisted `orderId` is the only order identity owner |
| 11 | PPB runtime product input | Canonical `bundle_ui_config` products plus stale persistence/competitor aliases | Only runtime `products` and `categories` authorize or identify lines | Signing and selection consume one explicit runtime contract |
| 12 | PPB policy inputs | Public subscription config and persisted offer country policy | Both are encoded into the signed bundle policy | Explicit feature inputs replace persistence/runtime shape guessing |
| 13 | Category membership save | A current FPB or PPB step selects a product through one or more categories | Save writes one deduplicated canonical `StepProduct` row for the selected product while preserving category grouping data | Strict readers continue to ignore persistence JSON |
| 14 | Admin component and analytics imports | Billing and Analytics routes consume their feature owners | Consumers import the exact component, helper, or type owner | Pure compatibility re-export barrels are removed |
| 15 | Shopify Page residue migration | Existing schema contains the four retired Page columns and handle index | Forward migration drops the index and all four columns | Dashboard deletion performs no Shopify Page mutation |
| 16 | Storefront upsell membership | Persisted FPB or PPB step contains only retired `categories` or category `collectionsSelectedData` aliases | Upsell and embed selection ignore the aliases while canonical `StepCategory[].collections` remains eligible | `StepCategory` is the sole category-relation owner |
| 17 | Storefront sync configuration identity | Current FPB or PPB persisted bundle | The live sync builder emits canonical `id` with no `bundleId` alias or generated response timestamp | Shopify writer derives `$app.bundle_ui_config` from this single identity |

## Acceptance Criteria

- [x] Parent synchronization no longer sends `tagsRemove` for legacy brand tags.
- [x] Analytics backfill reads and updates only canonical order GIDs.
- [x] PPB configure state does not scrub retired text keys during load or save.
- [x] The unused offline-token cutover helper and its stale tests are removed.
- [x] Widget installation consumers import the owning service module directly.
- [x] Pricing serializers consume only flat canonical rules and preserve canonical operators.
- [x] Fixed bundle price has one owner: `discountValue`.
- [x] Save-time, Sync Bundle, app-proxy, checkout-offer, runtime-token, and subscription serialization ignore legacy step-level JSON products.
- [x] PPB static authorization and selection consume only the canonical runtime product shape and explicit policy inputs.
- [x] Current FPB and PPB category selections are materialized as deduplicated canonical `StepProduct` relations during save.
- [x] Analytics helpers do not invent order identities for malformed rows.
- [x] Billing and Analytics consumers use direct owner imports; their pure re-export barrels are removed.
- [x] The Prisma schema and dashboard deletion flow have no Shopify Page-field owner or cleanup branch.
- [x] FPB upsell and PPB embed selectors ignore retired persisted category aliases.
- [x] Focused tests, typecheck, ESLint, widget builds, and diff checks pass.
- [x] Live FPB and PPB storefront-sync builders emit only canonical `id` and
  no response timestamp; dead Page redirect and superseded save-time builders
  are removed.
