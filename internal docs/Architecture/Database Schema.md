---
schema_version: 1
id: database-schema
title: Database Schema
type: architecture
status: authoritative
summary: Documents the canonical Prisma models, removed legacy residue, ownership boundaries, and forward-only migration rules.
last_audited: 2026-09-14
owners:
  - engineering
domains:
  - architecture
  - persistence
systems:
  - prisma
  - postgresql
source_paths:
  - apps/OnlyBundles-app/prisma/schema.prisma
  - apps/OnlyBundles-app/prisma/migrations/
  - prisma.config.ts
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

Authoritative summary derived from `apps/OnlyBundles-app/prisma/schema.prisma`.
The `APPLICATION_ARCHITECTURE.md` in `docs/` is significantly outdated — this
note supersedes it for schema questions.

---

## Key Models

### Bundle

Core model. Key fields beyond basics:
- `status`: `BundleStatus` enum — `draft`, `active`, `archived`, `unlisted`
- `bundleDesignTemplate` and `bundleDesignPresetId`: nullable canonical design
  identifiers for FPB and PPB templates; the schema has no separate
  `FullPageLayout` field or enum
- `promoBannerBgImage`: promotional banner image URL
- Promo banner crop data is not part of the schema. The pruned `promoBannerBgImageCrop` column was removed; banners render with the configured image and standard cover/center behavior.
- `tierConfig`: JSON — tiered pricing configuration
- `showStepTimeline`: Boolean — step progress indicator
- `inventorySyncedAt`: DateTime — debounce for inventory sync (skip if < 60s ago)
- Countdown presentation is stored directly on `Bundle` through
  `countdownEnabled`, `countdownLayout`, `countdownPosition`,
  `countdownTitle`, `countdownExpiryAction`, and
  `countdownExpiredMessage`. These fields do not own a deadline.

The Shopify Page-era columns `shopifyPageId`, `shopifyPreviewPageId`,
`shopifyPageHandle`, and `shopifyPreviewPageHandle` have no schema owner. The
forward-only `20260906090000_remove_legacy_shopify_page_fields` migration drops
them and the obsolete handle index. Bundle deletion and status changes no
longer run Shopify Page cleanup branches; FPB public documents are signed
app-proxy URLs.

### BundleStep

Per-step configuration. Links to `Bundle`.

### Product

Product variant selections per step.

### DesignSettings

**Not documented in APPLICATION_ARCHITECTURE.md.** Stores per-bundle design/theme settings. Replaces the old JSON blob approach.

### OrderAttribution

**Not documented in APPLICATION_ARCHITECTURE.md.** Tracks order → bundle attribution for analytics.
Includes standard UTM columns (`utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`) plus `customUtmAttributes` JSON for merchant-configured URL parameters captured by the Web Pixel.

Offer-aware analytics adds nullable `offerPolicyId`, `offerRuleVersion`,
`offerTierId`, and `offerEligibilitySource` columns to `OrderAttribution` and
`BundleEngagement`. These are historical scalar dimensions rather than foreign
keys, so deleting or replacing an offer policy does not rewrite completed
analytics. Both models index `(shopId, offerPolicyId, createdAt)` for the
offer-filtered dashboard and CSV paths. Bundle-only rows keep all four values
null.

`revenue` stores Shopify's whole-order value. `bundleRevenue` stores the
discounted value of the specific bundle represented by that row. Keeping the
two values separate is required because one Shopify order can contain multiple
bundles: order revenue and order count are deduplicated by `orderId`, while
bundle revenue and unique bundle purchases are deduplicated by
`(orderId, bundleId)`. New checkout rows use the Web Pixel checkout line value;
the manual Analytics backfill refreshes it from Admin GraphQL
`LineItem.discountedTotalSet(withCodeDiscounts: true)` when a verified runtime
bundle token identifies the line. Lines without authoritative bundle identity
remain at zero rather than guessing allocation.

`orderId` is always the canonical Shopify Order GID. Web Pixel ingestion rejects
missing and numeric-only IDs, and Admin GraphQL backfill writes its returned GID
directly. There is no numeric-to-GID compatibility read or `unknown` order key.

### Shop

Tracks installed-shop metadata and app-level settings. `customUtmParameters` JSON stores the merchant-configured allowlist of extra URL parameter names the UTM Web Pixel should capture.

### BundleAnalytics

**Not documented in APPLICATION_ARCHITECTURE.md.** Aggregated analytics data per bundle.

### DiscountSettings

Discount configuration linked to `Bundle`. Fields: `discountMethod`, `discountValue`, `discountType`.

### OfferPolicy and OfferCondition

`OfferPolicy` is the optional one-to-one owner for app-managed storefront offer
selection. It records a monotonically increasing `ruleVersion`, owns normalized
`OfferCondition` rows, and stores direct operational fields:

- `specificLinkRequired`: whether storefront delivery requires the generated
  opaque link token
- `priority`: deterministic ascending selection order; the default is `100`
- `stopLowerPriority`: when true, eligible lower-priority discovery results are
  omitted after this offer
- `scheduleMode`: exactly one of `always`, `one_time`, or `recurring`
- `startsAt` / `endsAt`: optional UTC instants for storefront visibility;
  `startsAt` is inclusive and `endsAt` is exclusive in `one_time` mode
- `recurrenceFrequency`: `weekly` or `monthly`
- `recurrenceTimezone`: the IANA shop timezone used to interpret the local
  calendar rule
- `recurrenceAnchorDate`: the local start date, which also owns the weekday or
  day-of-month cadence
- `recurrenceWindowStartMinute` / `recurrenceWindowEndMinute`: start-inclusive
  and end-exclusive local minutes within each run
- `recurrenceTermination`: `never`, `on_date`, or `after_runs`, with the
  matching typed value in `recurrenceEndsOn` or `recurrenceRunCount`

The migration explicitly assigns `one_time` to existing policies that already
have a start or end instant. Runtime code must use `scheduleMode`; it must not
infer mode from populated legacy fields. Recurrence is represented by typed
columns rather than an RRULE/JSON blob or an unbounded series of queued jobs.

These fields govern Wolfpack offer delivery. Shopify automatic app discounts
remain the canonical owner of checkout discount `startsAt`, `endsAt`, and
combination settings whenever one discount node maps to that offer. Wolfpack's
current add-on Discount Function activation is shop-wide, so its single node
cannot represent independent per-bundle calendars. Do not claim that node
enforces an individual bundle schedule.

When countdown presentation is enabled, `OfferPolicy.endsAt` is its sole
server-authoritative deadline. Wolfpack does not persist a second countdown end
instant, visitor-relative duration, shopper-midnight schedule, or transition
job. A bundle without a valid future `endsAt` cannot display an active
countdown.

The initial normalized condition type is `specific_link`.

A specific-link condition stores one SHA-256 token digest, never the raw
campaign token. The generated Admin response is the only surface that returns
the random bearer token. Optional `expiresAt` and `revokedAt` instants make
expiry and revocation server-enforceable. A compound unique constraint on
`(offerPolicyId, type)` permits one specific-link condition per policy in the
initial contract. Bundle deletion cascades through the policy and conditions.

The shared SIT database currently reports that the already-applied
`20260828090000_growth_subscription_architecture` migration differs from its
checked-in file because the live `Subscription` columns already exist. Do not
run `prisma migrate reset` against SIT. New schema changes must remain additive,
use a new forward migration, and be applied with `prisma migrate deploy` until
that historical drift is reconciled separately.

### Session

Shopify session storage (standard Remix adapter pattern).

Legacy non-expiring offline rows are not a supported runtime source. Admin API
callers use Shopify's authenticated session helpers and expiring offline token
metadata; the removed one-time cutover helper is not a fallback path.

---

## Enums

### BundleStatus
```
draft | active | archived | unlisted
```
`unlisted` keeps the bundle product out of Shopify discovery while preserving
the bundle for configuration and preview. `archived` is a distinct terminal
application status; it is not an `inactive` alias.

---

## Prisma Location

- Schema: `apps/OnlyBundles-app/prisma/schema.prisma`
- Database provider: PostgreSQL in every environment
- Connection variables: `DATABASE_URL` and `DIRECT_URL`
- Root Prisma commands resolve the app-owned schema through
  `prisma.config.ts`. When `apps/OnlyBundles-app/.env` exists, that config loads
  it with Node's environment-file loader; already-supplied process variables
  remain authoritative.

---

## Notes

- New settings fields should be added as **direct Prisma columns** with sensible defaults, never as JSON blob sub-fields
- The "Sync Bundle" feature lets merchants re-sync to pick up new defaults — no backwards-compat shims needed
- See `AGENTS.md` → "No Backwards Compatibility Rule" for enforcement details
- Before releasing a destructive residue migration, repeat zero-count checks in
  every target environment for legacy offline sessions, Page-field bundles,
  numeric order IDs, PPB legacy embed rows, and steps with JSON products but no
  `StepProduct`. The membership query must inspect both `BundleStep.products`
  and every related `StepCategory.products`; checking only the step JSON misses
  products selected through the current FPB and PPB category editors.
- On 2026-09-09 the configured database was reverified with the corrected
  step-and-category membership query. It had no legacy Page columns and returned
  zero legacy offline sessions, numeric order IDs, and PPB legacy embed rows.
  A signed PPB preview exposed category JSON products without a canonical
  `StepProduct` row; the corrected global query found an additional FPB draft
  with the same shape. Both Agent-store fixtures were repaired through their
  normal Admin save flows after the save boundary was corrected. The full
  step-and-category query returned zero offenders for the configured database.
  That result is not evidence for another release environment.
- On 2026-09-14 the release-environment session gate was run read-only against
  both configured databases. SIT had one offline session and zero legacy
  offline sessions. Production had 162 offline sessions, of which 57 lacked
  `expires`, `refreshToken`, and `refreshTokenExpires`; all 57 belonged to
  currently installed shops. Do not delete those rows or uninstall those apps.
  Shopify's app-template migration cycles a perpetual token when that merchant
  next opens the app after `expiringOfflineAccessTokens` is deployed. Stores
  that do not reopen require Shopify's documented offline-token exchange. That
  exchange is irreversible and must persist the returned access token, refresh
  token, and expiry metadata before marking the store complete, so it remains
  a separately approved production operation rather than a deploy-time
  fallback. The production zero-count release gate therefore remains open.
