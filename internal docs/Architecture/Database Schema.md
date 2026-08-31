---
schema_version: 1
id: database-schema
title: Database Schema
type: architecture
status: authoritative
summary: Documents the canonical Prisma models, enums, ownership boundaries, and migration rules for Wolfpack persistence.
last_audited: 2026-08-30
owners:
  - engineering
domains:
  - architecture
  - persistence
systems:
  - prisma
  - postgresql
source_paths:
  - prisma/schema.prisma
  - prisma/migrations/
related_docs:
  - internal docs/Architecture/System Overview.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
tags:
  - database
  - schema
keywords:
  - prisma
  - offer-policy
  - offer-condition
---

# Database Schema

Authoritative summary derived from `prisma/schema.prisma`. The `APPLICATION_ARCHITECTURE.md` in `docs/` is significantly outdated — this note supersedes it for schema questions.

---

## Key Models

### Bundle

Core model. Key fields beyond basics:
- `status`: `BundleStatus` enum — `active`, `inactive`, `draft`, **`unlisted`** (not in old doc)
- `fullPageLayout`: `FullPageLayout` enum — `CLASSIC`, `EDITORIAL`, `GRID`
- `promoBannerBgImage`: promotional banner image URL
- Promo banner crop data is not part of the schema. The pruned `promoBannerBgImageCrop` column was removed; banners render with the configured image and standard cover/center behavior.
- `tierConfig`: JSON — tiered pricing configuration
- `showStepTimeline`: Boolean — step progress indicator
- `inventorySyncedAt`: DateTime — debounce for inventory sync (skip if < 60s ago)

### BundleStep

Per-step configuration. Links to `Bundle`.

### Product

Product variant selections per step.

### DesignSettings

**Not documented in APPLICATION_ARCHITECTURE.md.** Stores per-bundle design/theme settings. Replaces the old JSON blob approach.

### OrderAttribution

**Not documented in APPLICATION_ARCHITECTURE.md.** Tracks order → bundle attribution for analytics.
Includes standard UTM columns (`utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`) plus `customUtmAttributes` JSON for merchant-configured URL parameters captured by the Web Pixel.

### Shop

Tracks installed-shop metadata and app-level settings. `customUtmParameters` JSON stores the merchant-configured allowlist of extra URL parameter names the UTM Web Pixel should capture.

### BundleAnalytics

**Not documented in APPLICATION_ARCHITECTURE.md.** Aggregated analytics data per bundle.

### DiscountSettings

Discount configuration linked to `Bundle`. Fields: `discountMethod`, `discountValue`, `discountType`.

### OfferPolicy and OfferCondition

`OfferPolicy` is the optional one-to-one operational eligibility owner for a
bundle. It starts disabled, records a monotonically increasing `ruleVersion`,
and owns normalized `OfferCondition` rows. The initial condition type is
`specific_link`.

A specific-link condition stores one SHA-256 token digest, never the raw
campaign token. The generated Admin response is the only surface that returns
the random bearer token. Optional `expiresAt` and `revokedAt` instants make
expiry and revocation server-enforceable. A compound unique constraint on
`(offerPolicyId, type)` permits one specific-link condition per policy in the
initial contract. Bundle deletion cascades through the policy and conditions.

### Session

Shopify session storage (standard Remix adapter pattern).

---

## Enums

### BundleStatus
```
active | inactive | draft | unlisted
```
`unlisted` = bundle exists but is not shown in merchant list (used for archived/template bundles).

### FullPageLayout
```
CLASSIC | EDITORIAL | GRID
```
Controls FPB widget layout rendering mode.

---

## Prisma Location

- Schema: `prisma/schema.prisma`
- Dev DB env: `prisma/.env` (not project root — contains SIT credentials)
- Dev DB file: `prisma/dev.db` (SQLite, gitignored)

---

## Notes

- New settings fields should be added as **direct Prisma columns** with sensible defaults, never as JSON blob sub-fields
- The "Sync Bundle" feature lets merchants re-sync to pick up new defaults — no backwards-compat shims needed
- See `CLAUDE.md` → "No Backwards Compatibility Rule" for enforcement details
