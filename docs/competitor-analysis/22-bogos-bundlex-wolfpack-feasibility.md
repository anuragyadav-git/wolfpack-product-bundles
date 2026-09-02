---
schema_version: 1
id: bogos-bundlex-wolfpack-feasibility
title: BOGOS and Bundlex Wolfpack Feasibility
type: feasibility-analysis
status: current
summary: Prioritizes the best BOGOS and Bundlex capabilities for Wolfpack and defines Admin, data, storefront, analytics, Shopify, testing, and rollout boundaries.
last_audited: 2026-09-01
owners:
  - product
  - engineering
domains:
  - product-strategy
  - architecture
  - competitive-research
systems:
  - wolfpack-admin
  - wolfpack-storefront
  - wolfpack-analytics
  - shopify-platform
source_paths:
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
  - app/routes/app/_shared/bundle-configure/
  - app/routes/app/app.attribution.tsx
  - app/routes/app/app.attribution/
  - app/components/analytics/
  - app/assets/widgets/
  - app/services/bundles/metafield-sync/
  - app/services/app-events.server.ts
  - prisma/schema.prisma
related_docs:
  - docs/competitor-analysis/20-bogos-personalization-analytics-offer-operations.md
  - docs/competitor-analysis/21-bundlex-urgency-swatches-tier-badges.md
  - internal docs/Architecture/Admin Configure Page.md
  - internal docs/Architecture/Widget Architecture.md
  - internal docs/Architecture/Database Schema.md
  - internal docs/Operations/App Events Taxonomy.md
tags:
  - feasibility
  - roadmap
  - offers
  - storefront
keywords:
  - adopt-adapt-defer-reject
  - implementation-plan
  - personalized-offers
  - urgency
  - swatches
  - analytics
---

# BOGOS and Bundlex — Wolfpack feasibility

## Recommendation

Adopt BOGOS's operational model and Bundlex's merchandising polish in small, independently verifiable slices. The highest-value sequence is:

1. **Tier badges** — high merchant value, low platform risk, existing pricing-rule owner.
2. **PPB swatch tooltip and selector modes** — high shopper value, latent category field, moderate accessibility/runtime work.
3. **Specific-link eligibility** — strongest low-privacy personalization entry point.
4. **Offer scheduling and deterministic priority** — unlocks safe campaign operations.
5. **Offer-aware Analytics dimensions** — extend the existing funnel instead of replacing it.
6. **Low-stock alert** — only after one authoritative component-inventory resolver exists.
7. **Sticky PPB add-to-cart** — valuable but theme/z-index/state-heavy.
8. **Countdown** — only after scheduling provides a truthful deadline.
9. **Customer tags, Markets, and order history** — phased behind protected-data review and authenticated storefront identity.
10. **Import/export** — after the offer schema stabilizes, otherwise CSV becomes a premature public API.

This ordering avoids coupling the first wins to protected customer data or a new scheduling platform.

Before each slice, apply a **Shopify-native ownership gate**: if Shopify already
owns the authoritative discount, inventory, customer-context, analytics, or
product-option contract, replace competing Wolfpack logic with that canonical
resource or API and make Shopify the end-to-end source of truth. Wolfpack may
retain only behavior Shopify does not provide, plus the smallest projection
needed to render it. Do not preserve an incorrect app-owned path alongside the
canonical path.

## Adopt, adapt, defer, reject

| Competitor capability | Decision | Why | Wolfpack owner |
| --- | --- | --- | --- |
| Per-tier badge copy and shapes | **Adopt** | Clear value hierarchy; small model/runtime surface. | Bundle pricing rules, Configure pricing UI, shared storefront offer card. |
| Color-swatch tooltip | **Adopt** | Improves variant comprehension without permanent vertical space. | `StepCategory`, PPB option renderer, later shared variant selector. |
| Broad visual presets/live preview | **Adapt** | Wolfpack already has a production-renderer preview; add semantic presets rather than clone raw controls. | Settings → Design runtime and template tokens. |
| Specific-link eligibility | **Adopt** | Useful personalization without customer data. | New eligibility service plus a random bearer token stored only as a digest. |
| Explicit priority and stop-lower policy | **Adopt** | Deterministic conflict resolution is required once multiple offers share scope. | New offer decision engine. |
| Start/end and recurring schedules | **Adapt** | Valuable, but must be timezone-safe and runtime-enforced. | Schedule model, resolver, jobs/reconciliation. |
| Offer import/export | **Defer** | High operational leverage after schema/versioning is stable. | Backend import pipeline and Admin jobs surface. |
| BOGOS-style KPI surface | **Adapt** | Keep Wolfpack funnel/campaign strengths; add offer filters and decisions. | `/app/attribution`, engagement and attribution models. |
| Customer tags | **Defer** | Feasible but requires protected-data approval and logged-in identity. | Eligibility service plus Admin customer access. |
| Purchase history | **Defer** | Highest privacy/data-access cost; free-tier behavior not live-proven. | Eligibility service plus order-derived facts. |
| IP location targeting | **Defer** | Accuracy/privacy complexity; Markets/effective country should come first. | Eligibility context resolver. |
| Markets targeting | **Adopt later** | Shopify-native regional contract and lower ambiguity than raw IP. | Eligibility context resolver. |
| Low-stock alert | **Adapt** | Must use component inventory and suppress misleading cases. | Shared inventory eligibility/resolution. |
| Sticky add-to-cart | **Adapt** | Strong conversion affordance, but reuse main CTA state and avoid theme conflicts. | PPB storefront controller and CSS. |
| Countdown | **Adapt** | Useful only when deadline is truthful and server-authoritative. | Schedule resolver plus shared urgency component. |
| Reset-on-visit false scarcity | **Reject** | Trust and compliance risk; does not represent a real deadline. | N/A. |
| Parent-product numeric inventory for bundles | **Reject** | Conflicts with Shopify component inventory ownership. | N/A. |
| Silent legacy/fallback config parsing | **Reject** | Violates Wolfpack's no-backward-compatibility policy. | N/A. |

## Proposed product architecture

### 1. Canonical offer layer

Wolfpack bundles are currently the merchant resource. Do not immediately introduce a second top-level offer type that duplicates every bundle. First add an optional offer policy attached one-to-one to a bundle or bundle pricing rule. Generalize only after at least two real owners need the same model.

Suggested new normalized records:

```text
OfferPolicy
  id
  shopId
  bundleId
  enabled
  priority
  combinationMode
  stopLowerPriority
  ruleVersion
  createdAt / updatedAt

OfferCondition
  id
  offerPolicyId
  type
  mode
  config
  position

OfferSchedule
  id
  offerPolicyId
  timezone
  startsAt / endsAt
  recurrenceRule
  dailyWindow
  termination
  enabled
```

Use direct typed columns for stable semantics and JSON only for type-specific condition configuration. Do not place eligibility rules into `Bundle.personalizationData`; that field currently owns FPB add-on/gifting data and would conflate unrelated domains.

Priority is an integer where lower means earlier. Combination mode should be an enum such as `exclusive`, `stack_compatible`, or `continue`; `stopLowerPriority` can be derived from or validated against it rather than allowed to contradict it.

Every saved rule set receives a monotonically increasing `ruleVersion`. Storefront analytics and decision traces record that version so later edits do not rewrite the meaning of historical results.

### 2. Eligibility decision engine

Implement a pure engine with an explicit context:

```text
resolveEligibleOffers(offers, context, now) ->
  winners
  rejected offers with safe reason codes
  next schedule transition
```

Context may contain:

- shop and placement;
- bundle/product/collection IDs;
- signed link token;
- effective Shopify Market and country;
- authenticated customer reference;
- normalized tag/order facts supplied by a protected server resolver; and
- sales channel/subscription context when supported.

The engine must not call Shopify. Fetching customer/order/market data belongs in adapters, making the engine deterministic and unit-testable. The storefront receives only the winning public offer configuration and safe reason metadata—not raw eligibility facts.

### 3. Runtime transport

Preserve current owners:

- FPB continues metafield cache first, app-proxy fallback second.
- PPB continues its storefront runtime snapshot/token flow.
- Shopify Functions continue to enforce discount outcomes at cart/checkout.

Eligibility changes require the server writer and widget parser to be updated together. A signed link token can be evaluated at proxy/runtime request time. Identity-dependent conditions cannot be safely decided from a static public metafield alone; they need an authenticated app-proxy decision or a short-lived signed eligibility result.

Never include customer tags, purchase totals, order counts, customer IDs, or raw link tokens in product/variant metafields or public DOM attributes.

### 4. Analytics model

Retain the existing data split:

- high-volume storefront decisions and interactions in internal analytics tables;
- completed order facts in `OrderAttribution` or a related normalized offer-attribution table;
- low-volume, privacy-safe merchant and operational events in `BusinessEvent`, optionally sent to Shopify App Events;
- browser `wpb:*` events for merchant-owned integrations.

Add stable `offerPolicyId`, `ruleVersion`, and optional `tierId` to internal engagement/order attribution. Avoid putting those fields into unstructured metadata if they become primary filters.

Do not send customer identity, tag names, geography, purchase history, full URLs, or query parameters to Shopify App Events. A safe decision event can say `eligibility_source=link` or `condition_count=3`; it cannot say which customer/tag/country matched.

## Admin UI design context

Wolfpack Admin uses Polaris web components and keeps FPB/PPB route ownership behind shared primitives. The new UI should follow that architecture.

### Eligibility and operations

Add a shared **Offer delivery** section with four subsections:

1. **Eligibility** — master switch, AND condition list, add/edit modal, authenticated-shopper warnings.
2. **Schedule** — always/one-time/recurring mode, timezone, next transition, active-now status.
3. **Priority and combination** — priority input, combination policy, collision preview.
4. **Campaign link** — generate/copy/revoke link token and choose destination.

Use `s-section`, `s-stack`, `s-switch`, `s-number-field`, `s-select`, `s-text-field`, `s-button`, `s-badge`, `s-banner`, `s-modal`, and `s-divider`. Keep configured values visible and inert when a master feature is off. Save remains route-owned through the existing SaveBar.

The summary at the bottom should read like a decision sentence, for example:

```text
Active Aug 30–Sep 7 in shop timezone; all 2 conditions must match;
priority 10; exclusive; next transition Sep 7 at 23:59.
```

This is more useful than exposing only raw controls.

### Storefront merchandising

Add a PPB **Merchandising** subsection near variant and pricing presentation:

- Variant selector mode;
- Color mapping and tooltip;
- Tier badge copy/shape/tone;
- Low-stock alert;
- Countdown presentation;
- Sticky add-to-cart.

Settings → Design should own global defaults/presets. Configure owns bundle-specific overrides. The production renderer preview must consume the same runtime contract as storefront assets.

### Offer list and scaling

When schedules/priorities exist, enhance the bundle list with derived filters:

- Active now;
- Scheduled;
- Expired;
- Deactivated/draft;
- Priority conflicts;
- Import needs review.

Show next start/end and priority in compact secondary text. Bulk actions should operate on explicit selections and show a confirmation summary. Import/export belongs in a dedicated operations surface with job progress, downloadable row errors, and no automatic publication.

## Storefront UI and accessibility contracts

### Shared visual hierarchy

Recommended offer card order:

1. selection control and tier title;
2. discount label/subtitle;
3. variant selectors;
4. price/compare price;
5. low-stock message when truthful;
6. tier badge attached without covering controls;
7. one primary add-to-cart action outside or below the tier group.

Countdown sits above/below the offer group and sticky ATC is a secondary viewport affordance. Neither should compete with the actual offer cards for primary hierarchy.

### Responsive contract

| Feature | Desktop | Mobile `390×844` |
| --- | --- | --- |
| Swatch tooltip | Hover and focus tooltip; edge-aware placement. | No hover dependency; persistent selected option label. |
| Tier badge | Edge-attached or inline; no card overlap. | Prefer pill/folded/rounded banner; long copy wraps safely. |
| Countdown | Full or compact; stable digit widths. | Compact by default; no per-second screen-reader announcements. |
| Low stock | Inline under selected option/tier. | Same semantic location; no fixed overlay. |
| Sticky ATC | Optional floating/fixed after main CTA leaves viewport. | Safe-area aware, one-row default, must not cover selectors or drawers. |

All controls require keyboard operation, visible focus, 44px touch targets where practical, non-color selected states, and screen-reader names that combine tier title with price/discount meaningfully.

## Shopify platform constraints

### Customer and order data

Customer tags and purchase history require protected customer data review for a public app. Request only required scopes and fields, handle redaction/errors, and keep compliance webhooks operational. Development-store access does not remove production approval requirements.

App proxy `logged_in_customer_id` is empty for anonymous visitors. Verify the request signature and ownership before using it. Cookies are stripped by app proxies, so they are not an identity bridge.

### Discounts

Shopify supports automatic and code discounts. Discount Functions can implement real-time custom logic such as volume thresholds. Eligibility UI does not itself guarantee checkout enforcement: every discount result must be represented in a Shopify-supported discount or Cart Transform contract and tested for combinations.

Shopify code discounts expose native `DiscountShareableUrl` values, and cart
permalinks can apply discount codes. Use those URLs when a campaign link's job
is to apply a Shopify discount. They do not authorize or hide a bundle before
cart, so an app-owned opaque random token remains justified only for the
distinct **storefront visibility** requirement.

Shopify discount nodes own `startsAt`, `endsAt`, customer/segment/Market
contexts, activation status, and combination rules. Wolfpack may mirror those
values to decide whether to render a bundle, but must not create a second
discount scheduler or checkout priority system. The Discount Function remains
the final price-enforcement owner.

### Native ownership matrix

| Capability | Shopify owner to use first | Wolfpack-only gap |
| --- | --- | --- |
| Shareable discount campaign | `DiscountShareableUrl` or cart permalink with `discount` | Signed/opaque link only when the bundle itself must be hidden before cart. |
| Discount start/end | Discount node `startsAt` / `endsAt` | Mirror the same instants for truthful storefront visibility and countdown. No transition job is required for correctness. |
| Customer, segment, and Market eligibility | Discount `context`; Discount Function cart buyer identity | Pre-cart visibility only when Shopify does not expose the required authenticated context. |
| Discount combinations and result selection | Discount node combination rules and Discount Function candidate selection | Visual ordering of competing storefront offers only. |
| Product color swatches | Shopify product-option linked metafields/metaobjects and option values | Tooltip/presentation around the canonical Shopify option value; app mapping only when explicitly merchant-authored. |
| Component stock | Shopify variant inventory policy and contextual quantity/availability | Aggregate the selected bundle components and suppress claims when the source is unknown or non-binding. |
| Store/order analytics | ShopifyQL and Shopify Analytics where available; Web Pixels for standard customer events | Private bundle decision/tier dimensions not exposed by Shopify. The app's current `2026-07` surface must not depend on `2026-10` early-access Analytics features. |
| Bundle CSV operations | None for Wolfpack-owned bundle policy records | Versioned validation/import/export remains app-owned; Shopify bulk operations are only adapters for Shopify resource lookup. |

### Inventory

Shopify `available` inventory is the sellable quantity. Wolfpack must use component variants and the same inventory context as cart/checkout. Suppress low-stock claims for untracked, continue-selling, unknown, or stale cases.

### Analytics and privacy

Web Pixels should declare and respect required processing categories. ShopifyQL provides aggregated store metrics but not Wolfpack's private offer-decision dimensions. Use Shopify Analytics for reconciliation/context and Wolfpack events for eligibility/tier attribution.

### Bulk operations

Shopify bulk operations can resolve large product/collection/customer/order sets asynchronously. Admin UI extensions cannot directly run bulk operations; the app backend must orchestrate them. Wolfpack's CSV pipeline remains responsible for schema validation, idempotency, drafts, and reporting.

## Individual implementation slices

Each slice below is intentionally independently shippable and should become its own implementation plan when prioritized.

### Slice A — Tier badges

**Scope:** per-pricing-rule badge copy, enabled state, three initial shapes, semantic colors, live production preview, PPB and compatible FPB templates.

**Data:** new typed pricing-rule presentation fields or normalized rule display object; no legacy fallback.

**Tests first:** rule validation/serialization, variable interpolation, invalid variable rejection, locale projection, runtime projection. Do not unit-test CSS/classes/placement.

**Browser QA:** all supported templates, long copy, zero/large savings, 1280×800+, 390×844, 200% zoom, keyboard and contrast.

**Effort/risk:** Small–medium / low–medium.

### Slice B — PPB selector modes and swatch tooltip

**Scope:** replace ambiguous swatch boolean with canonical selector mode, consume Shopify-linked product-option swatch data when available, tooltip on hover/focus, mobile selected label. A merchant-authored mapping is optional presentation data, not a replacement for Shopify's product option contract.

**Data:** direct Prisma columns or category contract fields with defaults; bump widget version when deployed.

**Tests first:** selector-mode persistence, runtime mapping, color resolver, unavailable state, selected variant mutation, accessible labels through rendered behavior.

**Browser QA:** keyboard focus tooltip, edge clipping, touch-sized controls, mobile no-hover path, long option values, missing color mapping, product modal/drawer interactions.

**Effort/risk:** Medium / medium.

### Slice C — Specific-link eligibility

**Scope:** one storefront-visibility condition type, generated/revocable opaque token, destination builder, eligibility summary, internal decision event. Do not use this token to duplicate a Shopify discount code; use Shopify's shareable discount URL when applying a code is the requirement.

**Data:** `OfferPolicy`, `OfferCondition`, and one token digest; never persist the raw token or add a redundant identifier/signature layer.

**Tests first:** signing/verification/expiry/revocation, existing query strings, wrong shop/offer, malformed token, runtime winner, no-token fallback.

**Browser QA:** direct link, navigation persistence contract, expired/revoked link, anonymous desktop/mobile, copy button and destination selection.

**Effort/risk:** Medium / medium.

### Slice D — Priority and one-shot scheduling

**Scope:** visual offer priority, exclusive/continue display policy, and a storefront mirror of the Shopify discount node's start/end instants in shop timezone. Derived status/list filters and next transition are computed from those instants; no app job is required for correctness.

**Data:** direct policy and schedule records; expand job types only when a real executor owns them.

**Tests first:** tie breaking, overlapping offers, boundary instants, DST, deactivated bundle, Shopify discount-reference mismatch, and runtime evaluation after a missed browser/server interval.

**Browser QA:** collision warnings, upcoming/current/expired states, edit while active, desktop/mobile summary.

**Effort/risk:** Large / high.

### Slice E — Offer-aware Analytics

**Scope:** offer/tier/rule-version dimensions in engagement and order attribution; offer filter; CSV fields; decision-to-revenue funnel.

**Platform boundary:** retain current internal event/attribution owners for the
`2026-07` app. Re-evaluate Shopify's `2026-10` Analytics/App Events and embedded
ShopifyQL components only after the store/app has access and the surface is no
longer an early-access dependency.

**Data:** direct indexed dimensions for primary filters; backfill policy explicitly states what cannot be reconstructed.

**Tests first:** idempotency, bundle-only vs offer rows, privacy sanitization, date boundaries, comparison periods, CSV escaping/columns, refunds/currency policy.

**Browser QA:** empty, partial, dense, filters, search/sort, comparison, export, Summary vs Advanced entitlement surfaces.

**Effort/risk:** Medium–large / medium–high.

### Slice F — Low-stock alert

**Scope:** shared component availability resolver, threshold/message, selected-tier display, suppress misleading states.

**Tests first:** tracked/untracked, deny/continue, zero, threshold boundaries, multi-component minimum, per-tier quantity, stale failure, optional/mix-and-match cases.

**Browser QA:** live inventory fixture at above/at/below/zero, variant change, desktop/mobile, cart race failure messaging.

**Effort/risk:** Medium–large / high.

### Slice G — Sticky PPB add-to-cart

**Scope:** floating first, per-device switches, scroll-to-offer and direct-add modes, shared CTA state.

**Tests first:** visibility state machine and submission behavior, duplicate prevention, invalid-selection focus, fallback action. No CSS/placement unit tests.

**Browser QA:** Horizon plus supported themes/page builders, header/cart drawer/chat/cookie collision, keyboard, safe area, 1280×800+, 390×844.

**Effort/risk:** Medium / high visual-integration risk.

### Slice H — Countdown

**Scope:** schedule-derived deadline, compact/full display, above/below, expiry behavior, reduced motion.

**Tests first:** instant math, timezone/DST, visibility resume, expiry once, invalid deadline, locale labels, no per-second analytics.

**Browser QA:** long duration/days, under one minute, expiry transition, background tab, clock jump, desktop/mobile, reduced motion.

**Effort/risk:** Medium / medium–high.

### Slice I — Identity personalization

**Scope:** Shopify-selected ISO country context and discount customer-segment contexts first. Do not persist market IDs or handles: Shopify now documents those single-market identifiers as unstable when nested markets change the most-specific match. Prefer
Discount Function buyer-identity fields (including tag predicates) for
checkout enforcement so raw customer records never enter Wolfpack. Customer
tags or purchase history for **pre-cart visibility** remain deferred until the
protected-data and authenticated-identity gate is explicitly approved.

**Tests first:** authenticated/anonymous, redacted API response, missing scope, include/exclude, unknown market/country, tag changes, order-window boundaries, cache invalidation.

**Browser QA:** logged-in/out and market switching; never expose private rule facts in DOM/network payloads.

**Effort/risk:** Large / very high privacy and platform risk.

### Slice J — Offer import/export and recurring schedules — implemented

**Delivered scope:** strict version 2 CSV round trip for existing bundle policies, validate-only and atomic apply flows, optimistic rule-version checks, post-write storefront sync reporting, and timezone-safe weekly/monthly recurrence. The importer does not create or publish bundles, does not accept campaign secrets, and rejects recurrence timezones that differ from Shopify's current shop timezone.

**Tests:** CSV injection, encoding, duplicate bundle IDs, strict headers and row limits, stale versions, link prerequisites, recurrence/DST/month-end/run-count termination, and FPB/PPB persistence.

**Remaining browser QA:** hard-reload FPB/PPB schedule editing and persistence on desktop/mobile, then validate/apply a small version 2 CSV through the authenticated Offer operations surface.

**Constraint:** storefront eligibility is request-time enforced. Shopify checkout discount dates remain Shopify-owned; the current single shop-wide automatic app-discount node cannot represent independent per-bundle calendars.

## Cross-cutting acceptance gates

Every implementation plan derived from this research should require:

- Red → Green → Refactor with a `test-spec/{module}.spec.md` file.
- Impact analysis through Graphify before code changes.
- Polaris web components for Admin UI.
- No unit tests that inspect CSS, class names, or element placement.
- Storefront source build/minification and widget version bump when applicable.
- Direct Chrome DevTools verification after cache clear and hard reload.
- Desktop `1280×800` or larger plus mobile `390×844`.
- Server/config persistence proof, runtime-consumption proof, and rendered interaction proof.
- Privacy review for any customer/order/geography data.
- No deployment without the user's manual deploy action.

## Research cleanup record

The Agent-store baseline started with six installed apps. BOGOS was installed, investigated without publishing an offer, discarded, and uninstalled. Bundlex was then installed; one Quantity Breaks offer was scoped only to Copper Light, activated for a render attempt, deactivated, and deleted. The Bundlex app embed was disabled and saved before uninstall. The installed-app list returned to the original six apps.

After cache clearing and a hard reload of Copper Light, Chrome showed:

- no BOGOS, `freegifts`, or Bundlex resource URLs;
- no competitor script URLs; and
- no competitor offer text in the page body.

No products, variants, inventory, customers, or orders were created or deleted for this research.

## Sources

- [BOGOS Shopify App Store listing](https://apps.shopify.com/freegifts)
- [BOGOS subconditions guide](https://bogos-guideline.gitbook.io/user-guide/detailed-guide/detailed-doc/how-to-add-bogos-sub-conditions-to-bundle-upsell-discount)
- [Bundlex Shopify App Store listing](https://apps.shopify.com/bundlex)
- [Bundlex interactive demo](https://bundlex.io/demo/)
- [Bundlex variant option display](https://bundlex.io/help/customization/variant-option-display/)
- [Bundlex countdown timer](https://bundlex.io/help/customization/countdown-timer/)
- [Bundlex low-stock alert](https://bundlex.io/help/customization/low-stock-alert/)
- [Bundlex sticky add-to-cart](https://bundlex.io/help/customization/sticky-add-to-cart/)
- [Shopify protected customer data](https://shopify.dev/docs/apps/launch/protected-customer-data)
- [Shopify app-proxy authentication](https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies)
- [Shopify Markets](https://shopify.dev/docs/apps/build/markets)
- [Shopify bulk operations](https://shopify.dev/docs/api/usage/bulk-operations)
- [Shopify discounts](https://shopify.dev/docs/apps/build/discounts)
- [Shopify discount shareable URL](https://shopify.dev/docs/api/admin-graphql/2026-10/objects/DiscountShareableUrl)
- [Shopify cart permalinks](https://shopify.dev/docs/apps/build/checkout/create-cart-permalinks)
- [Shopify metafield-linked product options](https://shopify.dev/docs/apps/build/product-merchandising/products-and-collections/metafield-linked)
- [Shopify Analytics for apps](https://shopify.dev/docs/apps/build/analytics)
- [Shopify Web Pixel privacy](https://shopify.dev/docs/api/web-pixels-api/pixel-privacy)
- [ShopifyQL schema reference](https://shopify.dev/docs/api/shopifyql/2026-07/schemas)
