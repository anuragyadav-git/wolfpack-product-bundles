# Test Spec: Specific-Link Offer Schema
**Spec ID:** specific-link-offer-schema  **Created:** 2026-08-30

## Purpose

Define the normalized persistence boundary for bundle-owned offer policies and
revocable, expiring specific-link eligibility conditions without storing raw
campaign tokens.

## Test Cases

### SpecificLinkOfferSchema

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Bundle offer ownership | Bundle schema | Optional one-to-one `OfferPolicy` relation | Bundle remains the merchant resource |
| 2 | New offer policy | No explicit values | Disabled policy with rule version 1 | No offer is exposed by migration alone |
| 3 | Specific-link condition | Token hash | One required digest plus optional expiry and revocation instants | Raw token and redundant public identifier are never persisted |
| 4 | Duplicate condition type | Same policy and `specific_link` type | Database uniqueness constraint rejects it | One active link condition per policy |
| 5 | Bundle deletion | Bundle with policy and condition | Cascading removal of policy and condition | No orphan eligibility records |

## Acceptance Criteria

- [x] Prisma schema and migrations define the normalized records and constraints
- [x] `npx prisma validate` succeeds
- [x] `npx prisma generate` succeeds
- [x] No raw campaign-token column or JSON eligibility blob is introduced
