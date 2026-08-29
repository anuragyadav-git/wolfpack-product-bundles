---
schema_version: 1
id: existing-merchant-subscription-migration
title: Existing Merchant Single-Cutover Policy
type: cutover-policy
status: approved
summary: Defines an atomic managed-pricing cutover with immediate Free-plan enforcement and no legacy migration support.
last_audited: 2026-08-29
owners:
  - product
  - engineering
domains:
  - subscriptions
systems:
  - subscriptions
  - storefront
source_paths:
  - app/services/subscriptions/free-plan-bundle-policy.server.ts
  - app/inngest/functions.ts
related_docs:
  - internal docs/Subscriptions/11-rollout-and-rollback-runbook.md
tags:
  - cutover
  - enforcement
keywords:
  - immediate
  - data preservation
---

# Existing Merchant Single-Cutover Policy

## Decision

There is no legacy billing read, compatibility shim, paid-access override, migration command, migration cohort, or transition grace period. At cutover, Shopify App Pricing becomes the only billing authority for every installed shop.

## Immediate enforcement

- Releasing the subscription code enables subscription UI, managed-plan navigation, and server enforcement together.
- A verified Growth item grants Growth; a verified absence of a paid item grants Free.
- Existing shops verified as Free are subject to the same limits as new Free shops immediately.
- The Free policy retains the most recently published compatible bundle. Other public bundles become Draft and are removed from public storefront state.
- A public bundle that itself requires Growth is not retained.
- Hourly reconciliation reapplies the policy and retries storefront synchronization that did not complete.

## Data preservation

Enforcement changes publication state only. It does not delete bundles, product selections, discounts, Design settings, templates, copy, translations, or analytics.

## Operational boundary

The cutover requires the managed Free plan and one Growth plan with monthly/yearly billing to be configured with handles `free` and `growth`. The application derives the app GID and hosted-pricing handle from Shopify Admin. Enforcement has no runtime bypass and begins with the released code.
