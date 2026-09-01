---
schema_version: 1
id: bogos-personalization-analytics-offer-operations
title: BOGOS Personalization, Analytics, and Offer Operations
type: competitor-analysis
status: current
summary: Documents installed-app and vendor evidence for BOGOS targeting, analytics, prioritization, scheduling, and bulk offer operations, with Shopify and Wolfpack implications.
last_audited: 2026-09-01
owners:
  - product
  - engineering
domains:
  - competitive-research
  - offers
  - analytics
systems:
  - bogos
  - wolfpack-admin
  - wolfpack-storefront
source_paths:
  - app/routes/app/app.attribution.tsx
  - app/routes/app/app.attribution/
  - app/components/analytics/
  - app/lib/analytics/
  - app/routes/api/api.attribution.tsx
  - app/routes/api/api.attribution.engagement.tsx
  - app/services/app-events.server.ts
  - prisma/schema.prisma
related_docs:
  - docs/competitor-analysis/21-bundlex-urgency-swatches-tier-badges.md
  - docs/competitor-analysis/22-bogos-bundlex-wolfpack-feasibility.md
  - internal docs/Operations/App Events Taxonomy.md
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - bogos
  - personalization
  - analytics
  - offer-operations
keywords:
  - specific-link
  - customer-location
  - purchase-history
  - customer-tags
  - priority
  - scheduling
  - import-export
---

# BOGOS personalization, analytics, and offer operations

## Executive finding

BOGOS has the stronger operational offer engine of the two competitors studied. Its most reusable ideas are a composable eligibility builder, an explicit conflict priority, scheduled lifecycle states, CSV-scale maintenance, and an offer-centric analytics surface. The installed free plan proved link, tag, location, market, scheduling, and analytics controls. Purchase-history targeting and priority editing were visibly present but plan-locked, so their detailed behavior is supported by BOGOS documentation rather than a live saved execution.

Wolfpack already has stronger bundle-funnel and campaign-attribution plumbing than BOGOS exposed in the empty account. The adopted implementation now adds normalized storefront priority, one-time and recurring schedules, country/link eligibility, and strict CSV operations around Wolfpack's existing bundle/config/runtime contracts rather than replacing Wolfpack Analytics with a clone of BOGOS's dashboard. Customer-tag and purchase-history targeting remain deferred behind the protected-data gate.

## Research method and confidence

Research ran on 2026-08-30 against `agent-5sfidg3m.myshopify.com` using direct Chrome DevTools. BOGOS was installed alone, kept on its free 30-lifetime-order plan, explored with an unsaved custom offer, discarded, and uninstalled. No paid trial was accepted and no BOGOS offer was published.

Evidence labels used below:

| Label | Meaning |
| --- | --- |
| **Installed proof** | Observed in the authenticated BOGOS Admin iframe on the Agent development store. |
| **Vendor proof** | Stated in BOGOS's current public listing or documentation, but not fully executed in the installed free tier. |
| **Shopify proof** | Supported by Shopify developer documentation. |
| **Inference** | Product or engineering conclusion derived from the evidence; not a competitor claim. |

The installation permission screen disclosed access to customer/device/activity information, owner and staff information, and customers, products, orders, discounts, analytics, Shopify Functions, and Online Store data. That permission footprint is consistent with order-history and customer-tag eligibility, but permission alone does not prove the feature's runtime semantics.

## Personalized offers

### Eligibility model

The installed custom-offer editor exposes subconditions beneath the primary offer rule. The free plan made the following selectors actionable:

| Condition | Installed Admin contract | Shopper/runtime implication | Confidence |
| --- | --- | --- | --- |
| Specific link | Destination choices include Home, Product, and Collection; BOGOS generates a full URL with `freegifts_code` and allows the link token to be customized. | Eligibility can be carried by a shareable URL rather than customer identity. | Installed proof; parameter behavior also documented by BOGOS. |
| Customer tags | Merchant supplies tags, can invert to “Exclude customers with these tags,” and can treat a logged-out visitor as a customer with no tags. | Positive matching requires a trustworthy customer identity; anonymous behavior must be explicit. | Installed proof for controls; vendor proof for login requirement. |
| Customer location | Merchant selects locations and can invert to exclude selected locations. | BOGOS documents IP-country evaluation; this is different from Shopify Market matching. | Installed proof for controls; vendor proof for IP-country semantics. |
| Markets | Separate selector from customer location. | Merchant-configured Shopify market context can be targeted independently from IP country. | Installed proof. |
| Purchase history | Visible but locked on the free plan. | BOGOS documents date range, total spend, last-order total, order count, and per-customer use limit; it requires login. | Vendor proof only for detailed behavior. |
| Subscription products | Selectable subcondition. | Eligibility can depend on subscription merchandise context. | Installed proof for presence only. |

BOGOS documents subconditions as an **AND** set. The installed editor summary reinforced that interpretation by describing access through the selected link, tags, and location together. Wolfpack should make this operator explicit in the Admin rather than relying on prose because a mistaken AND/OR interpretation changes who receives a promotion.

### Specific-link behavior

BOGOS uses a query parameter shaped as `freegifts_code=<token>`. Its documentation says to append with `&` when the destination already has a query string. The useful product idea is not the competitor's parameter name; it is a signed or unguessable campaign token that resolves to eligibility without exposing rule configuration.

For Wolfpack, the safe version should:

- accept a Wolfpack-owned parameter such as `wpb_offer`, never copy the competitor identifier;
- resolve the token server-side or against signed storefront configuration;
- keep query strings out of Shopify App Events and other low-volume operational telemetry;
- preserve the token through relevant navigation only when the offer contract requires it;
- define whether a token is reusable, expires, is campaign-scoped, and can be revoked;
- never treat knowledge of a predictable numeric offer ID as authorization.

This is feasible without protected customer data and is the best first personalization slice.

### Customer tags and purchase history

These are identity-dependent features. Shopify app-proxy requests include a signed `logged_in_customer_id` when the shopper is authenticated and an empty value when anonymous. Shopify cautions that the app must verify both the proxy signature and that the customer ID owns the requested data. App proxies strip cookies, so Wolfpack must not design a custom cookie-based identity fallback behind the proxy.

Customer and order access is protected customer data. Shopify requires public apps to request only the minimum data needed, obtain the appropriate Partner Dashboard approval, handle redacted fields/errors, and comply with data request/redaction webhooks. Order-history eligibility additionally needs `read_orders`; history beyond the standard order window may require `read_all_orders` approval.

Recommended Wolfpack boundary:

- store normalized rule predicates, not copied customer/order profiles;
- evaluate current tags/history on demand or through a privacy-reviewed derived eligibility cache;
- keep anonymous fallback behavior explicit per condition;
- never expose tag names, spend totals, order counts, or customer IDs in public bundle configuration;
- exclude all customer identifiers from Shopify App Events;
- make login-required conditions visible in Admin validation and storefront fallback states.

### Location and Markets

BOGOS separates IP-country targeting from Shopify Markets. Current Shopify
guidance changes the recommended Wolfpack implementation boundary:

- **Country targeting** uses `localization.country.iso_code`, Shopify's effective storefront country context. It needs no `read_markets` or protected-customer scope.
- **IP-country targeting** is rejected for the first implementation. It adds consent, accuracy, VPN, caching, and data-processing concerns while duplicating Shopify's localization surface.
- **Market IDs and handles are not persisted for buyer targeting.** Shopify now warns that nested markets make those identifiers unstable because deprecated single-market surfaces return only the most-specific match.

The first direct persistence contract therefore stores include/exclude mode plus
canonical uppercase ISO country codes. An include rule fails closed when the
country is unknown; an exclude rule remains eligible. Checkout enforcement
must independently use Shopify Function localization rather than trusting a
browser-supplied country or eligibility flag.

### Admin design lessons

BOGOS's strongest Admin pattern is progressive disclosure: primary offer mechanics first, then optional subconditions, then an always-visible summary of the combined rule. For Wolfpack's Polaris web-component surface, the analogous design should be:

1. `s-section` titled Eligibility with a master switch.
2. A condition list with type, include/exclude mode, concise value summary, and remove action.
3. `s-button` to add a condition through an `s-modal` or `s-popover` picker.
4. An explicit “All conditions must match” statement for the first release.
5. Inline `s-banner` validation for identity-required conditions, missing resources, or unsupported anonymous behavior.
6. A read-only storefront eligibility summary near Save, so scope mistakes are visible before publication.

Conditions should remain configured but inert when the master switch is off, matching Wolfpack's established disabled-configuration contract.

## BOGOS Analytics surface

### Installed empty-state contract

The authenticated Analytics page exposed:

- offer-type filter: Gift, Bundle, Upsell, Discount;
- date range defaulting to Last 7 days;
- KPI cards for Total sales, Average order value, and Orders;
- chart metric toggles;
- an orders table with search;
- an Export action, disabled because the account had no data.

Observed network requests included offer analytics, order filtering, and plan lookup endpoints. The account was empty and the app remained disabled, so this pass did **not** prove populated calculations, attribution rules, export columns, time-zone boundaries, refunds, currency handling, or deduplication.

BOGOS vendor material also claims impressions, clicks, conversions, and revenue, with some booster analytics limited to a recent window. Those claims are useful as a target vocabulary but were not populated in the installed account.

### Comparison with Wolfpack Analytics

| Capability | BOGOS observed/claimed | Wolfpack current owner | Assessment |
| --- | --- | --- | --- |
| Revenue, AOV, orders | Installed empty KPI surface. | `OrderAttribution`, `/app/attribution`, funnel aggregation. | Wolfpack already has these bundle-scoped measures. |
| Offer-type filtering | Gift/Bundle/Upsell/Discount filter. | Analytics is bundle-centric, not generalized offer-type-centric. | Add only after a canonical offer entity/taxonomy exists. |
| Impressions/clicks/conversions | Vendor claim; not populated live. | `BundleEngagement`, storefront beacons, funnel helpers. | Wolfpack has the better internal foundation but impressions remain conditional until the impression beacon is authoritative. |
| Funnel | Not visible in the empty BOGOS surface. | Engaged → Added to Cart → Checked Out → Revenue. | Retain Wolfpack's funnel. |
| Per-bundle performance | Not established in this pass. | Searchable/sortable Bundle Performance table with views, orders, value, conversions. | Retain and extend with offer dimensions. |
| Campaign attribution | Not established in this pass. | UTM capture, Top Campaigns, custom UTM attributes. | Retain Wolfpack's differentiated capability. |
| Date comparison | Not established in this pass. | Compare mode and prior-period calculations. | Retain. |
| Export | Visible but empty/disabled. | CSV export of selected window. | Existing Wolfpack capability; extend schema when offer dimensions land. |
| Historical repair | Not established. | Idempotent selected-window backfill from Shopify orders. | Strong Wolfpack differentiator. |

Wolfpack's current Analytics source of truth is split deliberately:

- `BundleEngagement` stores idempotent first-session interactions.
- `OrderAttribution` stores bundle/order revenue and UTM information.
- `BusinessEvent` stores privacy-safe operational and merchant-flow telemetry and can selectively deliver low-volume events to Shopify App Events.
- `BundleAnalytics` exists as a general event table, but the production attribution dashboard is driven mainly by engagement and order-attribution data.

ShopifyQL can provide store-level sales, order, campaign, and session aggregates, but it does not automatically know Wolfpack's offer decision, eligible population, shown tier, or selected tier. Those app-specific dimensions still require Wolfpack-owned events and durable order metadata. Shopify Web Pixels must respect customer privacy settings; pixels that declare required processing do not load until consent permits it.

### Recommended analytics extension

Add an offer-decision vocabulary without duplicating the entire dashboard:

| Event/fact | Required dimensions | Privacy rule |
| --- | --- | --- |
| `offer_eligible` | offer ID, bundle ID, rule version, eligibility reason codes, surface | No customer ID, tag value, country, URL query, or order totals in App Events. |
| `offer_rendered` | offer ID, presentation type, template, viewport bucket | Internal high-volume sink; consent-aware storefront publication. |
| `offer_selected` | offer ID, tier ID, variant-display mode | Internal sink. |
| `offer_added_to_cart` | offer ID, tier ID, quantity | Internal plus existing cart attribution. |
| `offer_checkout_completed` | offer ID, tier ID, order ID, revenue | Durable internal order attribution; never Shopify App Events at shopper volume. |
| `offer_rule_failed` | offer ID, rule version, safe error code | Low-volume operational sink can also go to Shopify App Events. |

The dashboard can then add Offer type, Offer, and Eligibility source filters while preserving the existing funnel, campaign, comparison, CSV, and backfill surfaces.

## Managing and scaling offers

### Offer lifecycle and list management

The installed All offers screen has All, Active, Deactivated, Scheduled, and Expired tabs plus search and filtering. “More actions” was disabled with no offers, so bulk action semantics were not proven. The status taxonomy is nevertheless valuable because it distinguishes merchant intent from current runtime eligibility.

Wolfpack currently has bundle statuses `draft`, `active`, `archived`, and `unlisted`. It should not overload those values with scheduling. Recommended model:

- keep lifecycle status as merchant intent;
- add schedule records that compute effective runtime state;
- derive `scheduled`, `currently active`, and `expired` views from lifecycle plus schedule;
- surface the next transition in the bundle list;
- never require a background job to make the storefront logically correct at the exact boundary—runtime must also check the schedule.

### Priority

The installed advanced configuration showed:

- Priority, default `1`, locked on the free plan;
- “Stop lower priority offers”; and
- explanatory text that offers with priority `2`, `3`, and onward stop when the shopper meets the current offer.

This establishes lower number as higher precedence. BOGOS also exposes whether a gift contributes toward other rules and whether offers work with other offers, which demonstrates that priority alone is not a complete conflict policy.

Wolfpack should use an integer priority with a deterministic tie breaker and an explicit combination policy:

1. Filter by lifecycle and schedule.
2. Filter by placement/product/bundle scope.
3. Evaluate eligibility predicates.
4. Sort by priority ascending, then stable ID or creation sequence.
5. Apply combination mode: exclusive, stack-compatible, or stop-lower-priority.
6. Return a decision trace with safe reason codes for preview/debugging.

Admin should support direct numeric entry and reorder controls, show collisions, and preview the winner for a selected context. A simple integer is easier to import/export and reason about than drag order alone.

### Basic and advanced scheduling

The installed free editor proved start/end date plus time pickers. BOGOS documentation describes recurring schedules with:

- daily, weekly, or monthly recurrence;
- daily active windows;
- stop never, on a date, or after a number of runs; and
- an optional countdown associated with the schedule.

Recurring scheduling was not executed in the free plan. The important engineering risks are time zone, daylight-saving transitions, overlapping windows, missed jobs, edits during an active window, and schedule interaction with merchant lifecycle state.

Recommended Wolfpack schedule contract:

- store IANA time zone explicitly, defaulting to the shop time zone;
- store UTC instants for one-shot schedules;
- store recurrence rule, local start/end times, and termination separately for recurring schedules;
- calculate `isEffectiveNow` in one pure shared resolver used by Admin preview, storefront API, sync, and jobs;
- use jobs to pre-publish/cache and reconcile, not as the only enforcement mechanism;
- record schedule transition events with idempotency keys;
- show next run and next stop in Admin.

The adopted runtime evaluates normalized weekly/monthly rules at request time with a maintained Temporal implementation, so correctness does not depend on queued transition jobs. Shopify's `shop.ianaTimezone` is the sole timezone authority. Monthly dates are skipped rather than clamped when a month does not contain the anchor day, and invalid stored rules fail closed. Jobs remain appropriate only for future cache warming or reconciliation when evidence shows they are needed.

### Import and export

BOGOS documentation describes CSV import/export, product references by SKU, collection references by handle, and support for hundreds of offers. This was not executed in the installed account, so exact columns, validation report, update semantics, and rollback behavior are unverified.

The feature is operationally valuable only if the contract is safe:

- stable offer external key for create-vs-update;
- schema version in every export;
- explicit mode: validate only, create only, update matching, or replace selected;
- SKU/handle resolution report before writes;
- row-level errors and warnings downloadable as CSV;
- atomicity boundary stated clearly;
- idempotent retries;
- preserved unknowns prohibited rather than hidden compatibility shims;
- export includes all fields required for a lossless round trip, excluding secrets and signed link tokens unless intentionally regenerated;
- import creates drafts by default, never silently publishes.

Shopify's GraphQL Admin API supports asynchronous bulk queries and mutations for large Shopify datasets. In API 2026-01 and later, Shopify documents up to five concurrent bulk operations of each relevant class per shop, JSONL input up to 100 MB, a 24-hour mutation completion limit, and a 10-day query completion limit. Those primitives help resolve products/collections at scale, but Wolfpack's own offer CSV parsing, validation, persistence, and progress reporting still belong in the app backend.

## Feature evidence sources

- [BOGOS Shopify App Store listing](https://apps.shopify.com/freegifts)
- [BOGOS subconditions guide](https://bogos-guideline.gitbook.io/user-guide/detailed-guide/detailed-doc/how-to-add-bogos-sub-conditions-to-bundle-upsell-discount)
- [BOGOS July 2026 feature wrap-up](https://bogos.io/bogos-feature-wrap-up-july-2026/)
- [BOGOS August 2025 update](https://bogos.io/bogos-august-update-2025/)
- [Shopify protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Shopify app-proxy authentication](https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies)
- [Shopify Markets](https://shopify.dev/docs/apps/build/markets)
- [Shopify bulk operations](https://shopify.dev/docs/api/usage/bulk-operations)
- [Shopify Web Pixel privacy](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy)
- [ShopifyQL schemas](https://shopify.dev/docs/api/shopifyql/2026-07/schemas)
- [Shopify discounts](https://shopify.dev/docs/apps/build/discounts)

## Verification gaps

- Purchase-history conditions were plan-locked; live query fields, customer matching, and storefront decisions were not executed.
- Priority persistence and conflict resolution were plan-locked and not executed with two competing offers.
- Recurring schedules and their countdown integration were documented but not executed.
- CSV import/export was documented but not executed; no sample export was obtained.
- BOGOS Analytics had no orders, so metric definitions, refunds, currencies, time zones, and CSV columns remain unverified.
- No claim in this document treats installed permissions or public marketing copy as proof of a populated runtime outcome.
