---
schema_version: 1
id: cart-transform-query-complexity
title: Cart Transform Query Complexity Test Spec
type: test-spec
status: active
summary: Defines the Shopify complexity budget and consolidated line-property contract for the Cart Transform input query.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - checkout
systems:
  - bundle-cart-transform-rs
source_paths:
  - extensions/bundle-cart-transform-rs/src/run.graphql
  - extensions/bundle-cart-transform-rs/src/merge.rs
  - app/assets/widgets/shared/engine/cart-submit.ts
related_docs:
  - internal docs/Architecture/Cart Transform Function.md
  - internal docs/Shopify Integration/Cart Transform API.md
tags:
  - tdd
  - shopify-function
keywords:
  - query-complexity
  - bundle-display-properties
  - offer-analytics
---

# Test Spec: Cart Transform Query Complexity
**Spec ID:** cart-transform-query-complexity  **Created:** 2026-07-08

## Purpose
Keep the Cart Transform input query below Shopify's complexity limit while preserving runtime-token merge behavior.

## Test Cases
### CartTransformQueryComplexity
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Query avoids redundant add-on grouping attribute | `run.graphql` | Does not select `_addon_offer_id` | Parent add-on group ID is derived from `_wolfpackProductBundle:OfferId` base |
| 2 | Runtime token fields remain selected | `run.graphql` | Selects `_wolfpack_bundle_runtime` and `runtime_token_secret` | Required trust boundary |
| 3 | Query avoids legacy component-parent merge metadata | `run.graphql` | Does not select `component_parents` | MERGE uses the signed runtime token |
| 4 | Offer analytics uses the existing input envelope | `run.graphql` and `_bundle_display_properties` | No `_wpb_*` input attributes; merged parent gets one `_wpb_offer_analytics` JSON property | Keeps the calculated complexity at 30 |

## Acceptance Criteria
- [x] All listed test cases pass
- [x] Shopify CLI accepts the Function query at complexity 30 or lower
