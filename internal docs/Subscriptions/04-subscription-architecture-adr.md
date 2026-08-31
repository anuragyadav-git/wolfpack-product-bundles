---
schema_version: 1
id: subscription-architecture-adr
title: Subscription Architecture ADR
type: adr
status: accepted
summary: Defines managed Shopify App Pricing, centralized entitlements, immediate Free-plan policy application, and no-data-loss enforcement.
last_audited: 2026-09-01
owners:
  - engineering
domains:
  - subscriptions
systems:
  - billing
  - admin
  - storefront
source_paths:
  - app/lib/subscriptions/entitlements.ts
  - app/services/subscriptions/
  - prisma/schema.prisma
related_docs:
  - internal docs/Architecture/Storefront Outage Resilience.md
  - internal docs/Architecture/Storefront Draft Preview Authorization.md
tags:
  - architecture
  - adr
keywords:
  - entitlement resolver
  - Shopify App Pricing
---

# Subscription Architecture ADR

## Decision

Use Shopify App Pricing for a permanent Free plan and one Growth plan with monthly and annual intervals. Resolve access through one server-owned entitlement service. Monthly and annual map to identical capabilities and limits.

## Components

1. Partner API provider verifies managed pricing through `activeSubscription`.
2. Prisma stores managed provider snapshots for bounded caching and auditability.
3. The resolver maps the code-owned `free` and `growth` plan handles into stable plan and entitlement types.
4. Bundle requirement detection identifies step, template, and advanced-Design needs.
5. Public bundle limits and publication are asserted transactionally under a Shop row lock.
   The interactive transaction contains only database work and uses a 10-second
   per-transaction timeout because the final bundle update is an atomic Prisma
   nested write across bundle configuration relations. Do not move Shopify or
   other network calls inside this transaction, and do not apply this timeout
   globally.
6. All route, service, job, sync, and analytics mutations call the same assertions.
7. Typed failures map to localized Shopify-native alerts.
8. `BusinessEvent` records safe subscription and gate telemetry.

## Source-of-truth precedence

Only verified managed Growth grants Growth. A verified absence of a managed paid contract grants Free. Unknown provider state never becomes Free. A recent verified Growth snapshot can grant a maximum 24-hour provider-outage grace.

## Storefront boundary

Billing is never queried from storefront or checkout requests. Only an authorized public-state transition writes public configuration. Draft preview is token-bound and must not replace the last public snapshot. Unknown billing does not remove already authorized storefront state.

## Data preservation

When Shopify verifies Free, the Free-plan bundle policy applies immediately. The most recently published compatible public bundle is retained and every other public bundle becomes Draft; if none is compatible, all become Draft. Storefront synchronization is retried by hourly reconciliation. Config, products, Design, templates, copy, and analytics remain stored.

## Rejected alternatives

- Client-only locks: bypassable and inconsistent across APIs/jobs.
- Price/name comparisons: unstable and divergent across intervals. Stable handles are defined when the Partner Dashboard plans are created.
- One local subscription row as billing truth: stale during Shopify-side changes.
- Archive or deletion: violates merchant data preservation.
- Legacy-provider reads, overrides, and migration grace: conflict with the approved single-cutover policy.
- Live billing checks in widgets/checkout: introduces latency and outage coupling.
