---
schema_version: 1
id: deployment-general-sync
title: Deployment General Sync
type: operations
status: active
summary: Post-deploy replay of the current persisted bundle storefront contract behind one true or false flag.
last_audited: 2026-08-14
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
related_docs:
  - Shopify Integration/Metafields.md
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
4. Calls `syncBundleStorefrontNow(... reason: "sync_bundle")`, which reloads
   each complete bundle graph from Prisma, activates the Cart Transform, and
   writes the current app-owned product/variant metafield values.
5. Remediates invalid saved variant references through the current persistence contract.
6. Ensures the automatic add-on discount once for every shop with an enabled
   saved FPB add-on configuration.
7. Ensures the role-tagged subscription initial-order automatic discount once
   for every shop with an enabled saved FPB or PPB subscription configuration.
   This node uses `recurringCycleLimit=1`.
8. Ensures the separate recurring subscription discount for shops with at least
   one enabled recurring bundle configuration. This node uses
   `recurringCycleLimit=0`, and the Function accepts it only when the signed
   bundle selection also authorizes recurring bundle pricing.

Any shop or bundle failure makes the command exit non-zero. This is the only
deployment sync workflow and `WPB_DEPLOYMENT_GENERAL_SYNC` is its only flag.

Update the general-sync script, service, and tests only when the Prisma schema
or metafield definition or value contract changes. Do not add placeholder
metaobject or compatibility hooks without a persisted contract and a caller.
