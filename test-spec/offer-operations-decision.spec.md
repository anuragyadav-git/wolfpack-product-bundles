---
schema_version: 1
id: offer-operations-decision
title: Offer Operations Decision
type: test-spec
status: active
summary: Verifies deterministic app-owned offer scheduling and storefront priority without duplicating Shopify discount combination ownership.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - offers
  - storefront
systems:
  - offer-policy
  - ppb-embed
  - fpb-upsells
source_paths:
  - app/lib/offer-policy-decision.ts
  - app/services/ppb-bundle-embed.server.ts
  - app/services/fpb-upsells.server.ts
  - prisma/schema.prisma
related_docs:
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
  - internal docs/Architecture/Database Schema.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - scheduling
  - priority
  - shopify-native
keywords:
  - startsAt
  - endsAt
  - stopLowerPriority
  - offer priority
---

# Test Spec: Offer Operations Decision

**Spec ID:** offer-operations-decision  **Created:** 2026-08-31

## Purpose

Ensure Wolfpack owns only the storefront offer visibility and ordering that
Shopify does not provide. Shopify discount nodes remain authoritative for
checkout discount dates and combination settings where those nodes exist.

## Test Cases

### OfferPolicyDecision

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | No schedule | Policy without start or end | Effective now | Always-on offer |
| 2 | Future start | Start is after current instant | Scheduled and ineligible | Runtime enforced without a job |
| 3 | Active window | Current instant falls within bounds | Effective now | Inclusive start, exclusive end |
| 4 | Expired window | End is at or before current instant | Expired and ineligible | No stale storefront render |
| 5 | Deterministic priority | Multiple effective offers | Lower priority number first, then stable ID | No creation-time ambiguity |
| 6 | Stop lower priority | Winning offer stops lower offers | Winner and any earlier compatible offers remain | Storefront selection only |
| 7 | Scheduled offer ordering | High-priority offer is not active yet | It is excluded before ordering | Schedule precedes priority |
| 8 | Decision marker | Policy has scheduling or specific-link delivery | Storefront snapshot requires a server decision | Static PPB config stays privacy-safe |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Prisma fields use direct typed columns with sensible defaults
- [x] Storefront scheduling is checked at request/runtime boundaries
- [x] PPB and FPB discovery use the same deterministic priority semantics
- [x] Checkout discount combination remains owned by Shopify discount APIs
- [ ] Desktop and 390x844 Chrome QA pass after the required tunnel restart
