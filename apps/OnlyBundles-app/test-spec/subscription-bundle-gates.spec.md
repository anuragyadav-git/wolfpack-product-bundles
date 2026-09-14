---
schema_version: 1
id: subscription-bundle-gates
title: "Test Spec: Subscription Bundle Gates"
type: test-spec
status: active
summary: Server behavior for Free public-bundle, step, template, billing-verification, and bounded publication transaction enforcement.
last_audited: 2026-09-11
owners:
  - wolfpack-engineering
domains:
  - subscriptions
systems:
  - bundle-configure
  - storefront-sync
source_paths:
  - app/services/subscriptions/bundle-entitlement-gate.server.ts
related_docs:
  - internal docs/Subscriptions/02-feature-entitlement-audit.md
tags:
  - tdd
  - publishing
keywords:
  - transactional gate
  - public bundle limit
---

# Test Spec: Subscription Bundle Gates

**Spec ID:** subscription-bundle-gates  **Created:** 2026-08-28

## Purpose

Specify the authoritative decision made before a bundle becomes or remains public.

## Test Cases

### BundlePublicationGate

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Draft save | Unknown or Free plan with Growth features | Allowed | Drafts do not sync publicly |
| 2 | First Free bundle | Compatible candidate and zero other public bundles | Allowed | Complete Free outcome |
| 3 | Second Free bundle | One other public bundle | Limit error | Active and Unlisted share the limit |
| 4 | Free step excess | Three enabled FPB or PPB steps | Limit error | Applies to both builders |
| 5 | Free premium template | Premium template candidate | Entitlement error | Draft preview remains available |
| 6 | Free advanced Design | Candidate uses advanced Design | Entitlement error | Basic brand and type remain Free |
| 7 | Unknown billing | Public transition | Billing-unverified error | Existing public state is not auto-demoted |
| 8 | Growth publication | Any approved candidate | Allowed | Monthly and annual share access |
| 9 | Save an already-public bundle | Existing publication timestamp | Original timestamp is preserved and the large relational write runs outside the publication transaction | The save does not increase public usage, so it does not need to hold the Shop publication lock |
| 10 | Save a public bundle with relational configuration | Shop lock, quota check, and nested bundle update | Interactive transaction receives a bounded 30-second timeout | Keeps the atomic publication gate while accommodating the canonical nested write on a cold remote database |

## Acceptance Criteria

- [x] All listed tests pass.
- [ ] Draft operations remain available.
- [ ] Public limit errors are typed and include safe usage metadata.
- [ ] The same gate can be called from routes, jobs, and storefront sync.
