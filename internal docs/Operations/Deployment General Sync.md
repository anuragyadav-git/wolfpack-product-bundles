---
schema_version: 1
id: deployment-general-sync
title: Deployment General Sync
type: operations
status: active
summary: Post-deploy replay of the current persisted bundle storefront contract behind one true or false flag.
last_audited: 2026-09-14
owners:
  - engineering
domains:
  - operations
systems:
  - deployment-general-sync
source_paths:
  - scripts/deployment-general-sync.ts
  - app/services/deployment-general-sync.server.ts
  - app/services/bundles/storefront-sync.server.ts
  - app/services/addon-discount-function-service.server.ts
  - app/services/ppb-storefront-runtime.server.ts
related_docs:
  - Shopify Integration/Metafields.md
  - Architecture/Storefront Outage Resilience.md
tags:
  - deployment
  - synchronization
keywords:
  - WPB_DEPLOYMENT_GENERAL_SYNC
  - bundle sync
---

# Deployment General Sync

The deployment commands run `npm run deployment:general-sync` after Shopify
deploy so current metafield definitions are installed before saved bundle values
are replayed. The command is a no-op unless:

```bash
WPB_DEPLOYMENT_GENERAL_SYNC=true
```

When enabled, it:

1. Lists installed shops and their saved FPB and PPB bundle rows.
2. Acquires each shop's compliant offline Admin client.
3. Ensures the current variant metafield definitions.
4. Ensures the shop-level PPB Storefront token, environment-correct app-proxy
   root, controls/language runtime, and generated Design CSS metafields.
5. Checks saved variant references with Admin GraphQL `nodes`, in batches of
   at most 250 IDs, then removes confirmed missing or malformed references
   through the existing persistence contract. Storefront availability is not
   evidence that a variant has been deleted. Access errors, incomplete responses,
   unexpected node identities, and persistence failures stop that bundle's sync.
6. Calls `syncBundleStorefrontNow(... reason: "sync_bundle")` after remediation.
   It reloads the complete bundle graph from Prisma, activates the Cart Transform,
   and writes current app-owned product/variant metafield values. Publishing
   before remediation would leave Shopify using the stale composition.
7. Ensures the automatic add-on discount once for every shop with an enabled
   saved FPB add-on configuration.
8. Ensures the role-tagged subscription initial-order automatic discount once
   for every shop with an enabled saved FPB or PPB subscription configuration.
   This node uses `recurringCycleLimit=1`.
9. Ensures the separate recurring subscription discount for shops with at least
   one enabled recurring bundle configuration. This node uses
   `recurringCycleLimit=0`, and the Function accepts it only when the signed
   bundle selection also authorizes recurring bundle pricing.

Any shop or bundle failure makes the command exit non-zero. This is the only
deployment sync workflow and `WPB_DEPLOYMENT_GENERAL_SYNC` is its only flag.

Update the general-sync script, service, and tests only when the Prisma schema
or metafield definition or value contract changes. Do not add placeholder
metaobject or compatibility hooks without a persisted contract and a caller.

Variant existence uses Shopify’s [Admin nodes query](https://shopify.dev/docs/api/admin-graphql/latest/queries/nodes), through the shop’s existing authenticated Admin client.

## Coordinated authorization cutover

The canonical parent writer now reconciles Shopify-owned scheduled automatic
discounts before publishing the current `{revision, pricingMode}` policy record
for either bundle type. `scheduled_initial` owns the first billing cycle;
`scheduled_recurring` owns recurring subscription cycles when configured. Shopify
owns dates, combinations and automatic-discount capacity. No discount IDs are
mirrored into new database columns, and native API/readback failures fail sync.

Deploy the matching Functions and server writer together, then use normal Bundle
Sync or this existing general-sync workflow. The new Function requires
`componentQuantities` inside `price_adjustment` and current authorization records;
it does not read legacy values as a fallback. Public component quantities and
large display pricing remain separate published metafields. An unsynchronized
existing bundle can lose authorization until sync succeeds. Newly onboarded stores
use this same canonical writer; capacity, access and invalid configuration failures
must surface instead of marking the bundle synchronized.
