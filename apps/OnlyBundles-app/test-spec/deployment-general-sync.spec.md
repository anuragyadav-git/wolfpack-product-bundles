---
schema_version: 1
id: deployment-general-sync-test-spec
title: "Test Spec: Deployment General Sync"
type: test-spec
status: active
summary: Behavior coverage for the flag-controlled deployment general sync.
last_audited: 2026-07-31
owners:
  - engineering
domains:
  - operations
systems:
  - deployment-general-sync
source_paths:
  - tests/unit/services/deployment-general-sync.test.ts
related_docs:
  - internal docs/Operations/Deployment General Sync.md
tags:
  - testing
keywords:
  - WPB_DEPLOYMENT_GENERAL_SYNC
---

# Test Spec: Deployment General Sync
**Spec ID:** deployment-general-sync  **Created:** 2026-07-31

## Purpose
Replay the normal persisted-bundle storefront sync after deployment so installed shops receive current metafield definitions, bundle metafield values, add-on setup, and registered metaobject values.

## Test Cases
### DeploymentGeneralSync
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Disabled deployment sync | Flag absent or false | No database or Shopify calls | Default deployment remains mutation-free |
| 2 | Enabled deployment sync | Flag true with installed shops and saved bundles | Definitions and save-equivalent sync run for every bundle | Uses persisted database rows |
| 3 | FPB add-ons enabled | Saved FPB personalization data enables add-ons | Add-on discount setup runs once for the shop | Mirrors FPB save follow-up |
| 4 | Registered metaobject replay | Saved bundle row | Metaobject replay hook runs for every valid bundle | Current implementation reports zero writes |
| 5 | Bundle sync failure | One replay throws | Failure is recorded and other bundles continue | Command exits non-zero from summary |
| 6 | Unsupported bundle type | Unknown saved bundle type | Bundle failure is recorded | No Shopify sync call |
| 7 | Single flag contract | Flag true or false | Parser returns only `enabled` | No auxiliary deployment sync variables |

## Acceptance Criteria
- [ ] All listed test cases pass
- [ ] Deployment scripts run the sync after Shopify deploy
- [ ] `false` or an absent flag performs no scans or mutations
- [ ] `WPB_DEPLOYMENT_GENERAL_SYNC` is the only deployment sync environment flag
