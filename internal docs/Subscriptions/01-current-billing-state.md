---
schema_version: 1
id: current-billing-state
title: Current Billing State
type: audit
status: active
summary: Documents Shopify App Pricing as the only billing authority and records the app-owned billing surfaces removed at cutover.
last_audited: 2026-08-28
owners:
  - engineering
domains:
  - subscriptions
systems:
  - billing
  - shopify-partner-api
source_paths:
  - app/services/subscriptions/
related_docs:
  - internal docs/Subscriptions/04-subscription-architecture-adr.md
  - internal docs/Subscriptions/shopify-platform-research-log.md
tags:
  - billing
  - managed-pricing
keywords:
  - activeSubscription
---

# Current Billing State

## Current authority

- Shopify Partner API `activeSubscription(appId, shopId)` is canonical for new App Pricing contracts.
- A managed `null` response classifies the shop as Free.
- App Pricing return parameters are hints; the application verifies the contract before granting Growth.
- App Pricing lifecycle is reconciled through Partner API rather than managed-pricing webhooks.

## Removed surfaces

The cutover removes Admin Billing API charge creation/cancellation, charge confirmation, local charge status routes, billing callbacks, subscription purchase webhooks, manual paid-plan grants, migration scripts, compatibility providers, entitlement overrides, and remediation records. No runtime path reads or writes those contracts.

## Failure policy

- Persistent snapshots are fresh for 15 minutes.
- High-impact actions refresh stale state.
- A last verified active Growth contract receives up to 24 hours of outage grace.
- After grace, billing is Unknown: new premium mutations are blocked, but existing public storefront state and merchant data are not destroyed or rewritten.
- Free is returned after the managed provider verifies no paid contract.
