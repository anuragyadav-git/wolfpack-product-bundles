---
schema_version: 1
id: offer-policy-csv
title: Offer Policy CSV Operations
type: test-spec
status: active
summary: Defines the versioned CSV export, validation, and safe apply contract for existing bundle offer policies.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - offers
systems:
  - offer-policy
source_paths:
  - app/lib/offer-policy-csv.ts
  - app/services/offer-policy-csv.server.ts
  - app/routes/app/app.offer-operations.tsx
related_docs:
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - csv
  - import-export
keywords:
  - validate-only
  - offer operations
---

# Test Spec: Offer Policy CSV Operations

**Spec ID:** offer-policy-csv  **Created:** 2026-09-01

## Purpose

Provide a bounded, versioned CSV round trip for existing Wolfpack bundles. The
operation changes offer policy only: it never creates or publishes bundles and
never exports or imports campaign tokens or token digests.

## Test Cases

### OfferPolicyCsv

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Versioned export | Existing bundles with and without policies | Stable columns and schema version 1 | Missing policies export canonical defaults and rule version 0 |
| 2 | Spreadsheet formula defense | Bundle name beginning with `=`, `+`, `-`, or `@` | Exported display cell is prefixed with an apostrophe | No writable policy value accepts formula syntax |
| 3 | Quoted CSV | Name containing comma, quote, and newline | Parser returns one intact row | Use a maintained CSV parser/stringifier |
| 4 | Valid policy row | Typed booleans, ISO dates, country codes, priority | Normalized policy update | Country codes are unique, uppercase, and sorted |
| 5 | Invalid schema | Missing, reordered, or unsupported columns/version | Row/file validation error | CSV schema is an explicit public contract |
| 6 | Duplicate bundle key | Same bundle ID appears twice | Both duplicate rows are rejected | Prevent ambiguous last-write-wins behavior |
| 7 | Unknown or cross-shop bundle | Bundle ID is not in authenticated shop | Row is rejected | Never resolve by name or handle |
| 8 | Invalid policy values | Bad boolean, priority, date range, country mode/code | Field-specific row errors | Apply performs no writes while validation errors exist |
| 9 | Missing campaign credential | Row enables specific-link delivery without an existing active link | Row is rejected | Tokens are managed only by the campaign-link action |
| 10 | Stale rule version | CSV version differs from current policy | Conflict unless values already match | Identical retry is idempotent |
| 11 | Validate only | Valid CSV uploaded for validation | Preview returned with zero writes/syncs | Merchant reviews before apply |
| 12 | Apply | Previously valid CSV | Policies update atomically and changed bundles sync | Bundle status remains unchanged |
| 13 | Sync failure | Policy writes succeed but Shopify sync fails | Applied rows and sync errors are reported | Do not claim storefront completion |
| 14 | Size and row bounds | More than 500 rows or more than 1 MiB | File-level rejection | Keeps the synchronous Admin operation bounded |
| 15 | Embedded export authentication | Export action inside Shopify Admin iframe | Standard authenticated fetch downloads the CSV | Direct iframe link navigation must not redirect to `/auth/login` |

## Acceptance Criteria

- [ ] All listed test cases pass
- [ ] CSV export contains no raw token, token digest, or publication mutation
- [ ] Validation must succeed before apply writes any row
- [ ] Existing bundles are addressed only by authenticated-shop bundle ID
- [ ] The Admin surface uses Polaris web components and offers validate before apply
- [ ] Focused lint, related tests, and SIT Chrome QA pass
