---
schema_version: 1
id: specific-link-offer-admin
title: Specific Link Offer Admin Workflow Test Spec
type: test-spec
status: active
summary: Defines behavior coverage for safe Admin link status, Save Bar persistence, and generate or revoke controls.
last_audited: 2026-08-31
owners:
  - Wolfpack
domains:
  - offers
systems:
  - admin-configure
source_paths:
  - app/lib/specific-link-offer-admin.ts
  - app/routes/app/shared/SpecificLinkOfferSection.tsx
related_docs:
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - tdd
  - specific-link
keywords:
  - offer delivery
  - campaign link
---

# Test Spec: Specific Link Offer Admin Workflow

**Spec ID:** specific-link-offer-admin  **Created:** 2026-08-31

## Purpose

Verify that Admin receives no stored credential material, only enables a valid
link, and gives merchants generate, copy, and revoke controls through the
existing bundle visibility workflow.

## Test Cases

### SpecificLinkOfferAdminState

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | No link exists | No policy | Disabled and not generated | No token fields |
| 2 | Link is usable | Active condition | Active status with safe metadata | Digest is never returned |
| 3 | Link is unusable | Revoked or expired condition | Revoked or expired status | Runtime remains fail closed |
| 4 | Enable link delivery | Enabled form value plus active condition | Nested policy update | Rule version increments |
| 5 | Enable without usable link | Enabled form value plus missing, revoked, or expired condition | Validation issue | Bundle save is rejected |

### SpecificLinkOfferSection

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Generate first link | Not generated status | Generate callback runs | No direct route submission in component |
| 2 | Toggle delivery | Active link | Switch is available | Existing Save Bar owns persistence |
| 3 | Copy generated link | Current-session raw link | Copy callback receives raw link | Raw link is not reloadable |
| 4 | Revoke link | Active status | Revoke callback runs | Action is immediate |

### SpecificLinkOfferStorefront

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Link delivery is disabled | Public PPB snapshot | Render without an eligibility request | Shopify-hosted snapshot remains primary |
| 2 | Valid specific link | Required snapshot plus matching URL token | Eligibility request succeeds and widget renders | One opaque token only |
| 3 | Missing, invalid, or unavailable eligibility | Required snapshot without a valid decision | Widget stays hidden | Fail closed |
| 4 | Public discovery surfaces | Link-only bundle | Excluded from embed, page-builder, and upsell discovery | Direct generated link remains the entry point |

## Acceptance Criteria

- [ ] All listed test cases pass
- [ ] Changing link-only delivery refreshes an already-published Shopify product metafield even while the Wolfpack bundle is draft
- [ ] Loader DTOs contain no token or digest fields
- [ ] Both FPB and PPB route actions dispatch generate and revoke intents
- [ ] Enabling an unusable link fails closed
- [ ] Admin controls use Polaris web components
- [ ] PPB widget and SDK mode enforce the same app-proxy eligibility decision
