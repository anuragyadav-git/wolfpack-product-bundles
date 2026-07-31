---
schema_version: 1
id: deployment-general-sync
title: Deployment General Sync
type: operations
status: active
summary: Post-deploy replay of persisted bundle storefront and custom-data synchronization behind one true or false flag.
last_audited: 2026-07-31
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
related_docs:
  - Shopify Integration/Metafields.md
tags:
  - deployment
  - synchronization
keywords:
  - WPB_DEPLOYMENT_GENERAL_SYNC
  - metaobject
---

# Deployment General Sync

The deployment commands run `npm run deployment:general-sync` after Shopify
deploy so version-controlled metafield and metaobject definitions are installed
before saved values are replayed. The command is a no-op unless:

```bash
WPB_DEPLOYMENT_GENERAL_SYNC=true
```

When enabled, it:

1. Lists installed shops and their saved FPB and PPB bundle rows.
2. Acquires each shop's compliant offline Admin client.
3. Ensures the current variant metafield definitions.
4. Calls `syncBundleStorefrontNow(... reason: "sync_bundle")`, which reloads
   each complete bundle graph from Prisma, activates the Cart Transform, and
   writes standard and app-owned product/variant metafield values.
5. Calls the registered persisted metaobject replay hook for each bundle.
6. Ensures the automatic add-on discount once for every shop with an enabled
   saved FPB add-on configuration.

The current repository has no app metaobject definitions or persisted
metaobject value writer, so the explicit metaobject hook reports zero writes.
When such a contract is added, implement it there using `metaobjectUpsert`.

Any shop or bundle failure makes the command exit non-zero. This is the only
deployment sync workflow and `WPB_DEPLOYMENT_GENERAL_SYNC` is its only flag.

Update the general-sync script, service, and tests only when the Prisma schema
or metafield/metaobject definition or value contract changes.
