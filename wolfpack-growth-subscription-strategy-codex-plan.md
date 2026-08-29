---
schema_version: 1
id: wolfpack-growth-subscription-strategy-codex-plan
title: Wolfpack Growth Subscription Strategy - Original Planning Brief
type: historical-plan
status: superseded
summary: Preserves the original subscription planning brief whose rollout, migration, trial, and bypass assumptions were superseded during implementation.
last_audited: 2026-08-29
owners:
  - product
  - engineering
domains:
  - subscriptions
systems:
  - shopify-app-pricing
source_paths:
  - app/lib/subscriptions/
  - app/services/subscriptions/
related_docs:
  - internal docs/Subscriptions/04-subscription-architecture-adr.md
  - internal docs/Subscriptions/11-rollout-and-rollback-runbook.md
tags:
  - historical
  - superseded
keywords:
  - original brief
  - subscription plan
---

> Historical planning input only. The implemented contract in `internal docs/Subscriptions/` supersedes this brief: there is no legacy migration support, no phased rollout, no emergency bypass, enforcement starts immediately at the single cutover, and both Growth billing intervals use Shopify's account-level 14-day trial.

# Wolfpack Product Bundles
# Free + Growth Subscription Strategy and Codex Implementation Plan

**Document type:** Product strategy, technical implementation plan, rollout plan, and Shopify App Pricing setup runbook
**Prepared for:** Codex planning and implementation
**Version:** 1.0
**Date:** 2026-08-27
**Scope:** Subscription strategy only
**Out of scope:** Reddit marketing, general acquisition strategy, paid advertising, social content, and unrelated storefront redesign work

---

## 1. Mission

Introduce a sustainable freemium subscription model for Wolfpack Product Bundles without weakening the usefulness of the Free experience or unexpectedly breaking existing merchants.

Wolfpack will have:

- A permanent **Free** tier.
- One paid subscription plan named **Growth**.
- Two billing choices for Growth:
  - Monthly.
  - Annual.
- The same Growth entitlements for monthly and annual subscribers.
- No semi-annual plan.
- No bundle-order cap.
- No bundle-revenue cap.
- No percentage-based “success tax.”
- No client-side-only feature restrictions.
- No deletion of merchant bundle data after downgrade.
- No gating of security, accessibility, correctness, performance, or basic compatibility.

The implementation must let a Free merchant create, publish, and sell through a real bundle. Growth must unlock advanced merchandising, customization, optimization, and scale.

---

## 2. Default decisions Codex may use

These defaults make the project executable without repeatedly pausing for product decisions. They are hypotheses, not immutable requirements. Codex must validate them during the repository audit and pricing decision phase.

| Decision | Default |
|---|---|
| Free price | $0 |
| Growth monthly hypothesis | **$19.99 USD/month** |
| Growth annual hypothesis | **$199 USD/year** |
| Annual discount | Approximately two months free; about 17% |
| Free trial | **None at launch** |
| Free active-bundle limit | **1 active bundle per shop** |
| Free draft-bundle limit | No artificial limit unless repository evidence shows material cost or abuse |
| Free FPB step limit | **2 steps**, subject to repository validation |
| Bundle types on Free | FPB and PPB |
| Revenue/order limits | None |
| Existing merchant transition | Configurable legacy access; default planning assumption of **90 days** for affected merchants |
| Monthly and annual entitlements | Identical |
| Subscription system | Shopify App Pricing, unless the repository proves a required migration path |
| Growth display name | `Growth` |
| Plan identifiers | Stable internal codes; do not derive logic from display names |

The annual hypothesis is intentionally simple:

- Monthly annualized cost: `$19.99 × 12 = $239.88`.
- Proposed annual cost: `$199`.
- Annual savings: `$40.88`.
- Effective monthly cost: approximately `$16.58`.
- Discount: approximately `17.0%`.

Do not advertise “two months free” unless the final prices mathematically support that claim and Shopify permits the wording in the relevant pricing surface.

---

## 3. Non-negotiable principles

### 3.1 Repository-first discovery

The repository is the source of truth for:

- Current billing implementation.
- Current database schema.
- Current app routes.
- Current admin UI.
- Current storefront behavior.
- Feature configuration.
- Feature names.
- Listing copy.
- Listing screenshots and media.
- Existing tests.
- Existing analytics.
- Existing merchant migration scripts.
- Current app configuration and Shopify API version.

Do not assume paths, frameworks, ORM models, route names, or feature availability. Discover and document the actual repository structure first.

### 3.2 Official Shopify documentation only for platform behavior

For billing, pricing, alerts, App Store requirements, and Shopify APIs:

- Use Shopify Dev MCP or official Shopify developer documentation.
- Do not rely on blogs, old tutorials, Stack Overflow, or remembered APIs.
- Revalidate documentation against the API version used by the repository.
- Record the documentation title, date checked, API version, and relevant constraint in an implementation research log.

### 3.3 One entitlement system

Do not scatter checks such as:

```ts
if (shop.plan === "Growth") { ... }
```

throughout the application.

Create one authoritative entitlement layer used by:

- Admin loaders and actions.
- API routes.
- Services.
- Background jobs.
- Bundle publishing.
- Storefront configuration generation.
- Shopify Function-related configuration, where applicable.
- UI rendering.
- Tests.

The UI may mirror entitlement state, but the server remains authoritative.

### 3.4 No data destruction

A downgrade, cancellation, frozen subscription, billing error, or migration must never delete:

- Bundles.
- Product selections.
- Discount settings.
- Design settings.
- Template selections.
- Copy settings.
- Analytics history.
- Merchant-authored configuration.

Restrict activation or publishing when necessary, but preserve the data.

### 3.5 Free must remain complete

The Free tier must support an end-to-end merchant outcome:

1. Create a bundle.
2. Configure products and variants.
3. Preview the bundle.
4. Publish one bundle.
5. Let customers complete the bundle.
6. Add the bundle to cart.
7. Complete checkout.
8. Track at least basic bundle activity if such analytics already exist.

A Free merchant must not discover that the app is merely a non-functional demo.

### 3.6 Never gate product obligations

Do not gate:

- Security fixes.
- HMAC validation.
- Authentication correctness.
- Cart correctness.
- Checkout correctness.
- Inventory correctness.
- Basic product-variant compatibility.
- Accessibility.
- Keyboard support.
- Focus states.
- Screen-reader support.
- Mobile responsiveness.
- Core theme compatibility.
- Performance fixes.
- Bug fixes.
- Uninstall cleanup.
- Data-protection behavior.
- Required compliance behavior.

### 3.7 No misleading upgrade UX

A locked feature is not automatically an “error.”

Use:

- Informational alerts for plan discovery.
- Warnings for approaching or reached plan limits.
- Inline errors when a requested save, publish, or activation action cannot be completed.
- Red error banners only for actual failures or critical disruptions.
- Success toasts for completed subscription changes.

Do not use fabricated urgency, countdown timers, guaranteed revenue claims, or repeated upgrade banners across every page.

---

## 4. Required repository deliverables

Create a documentation directory using the repository’s existing conventions. If no suitable convention exists, use:

```text
docs/subscriptions/
```

Produce the following artifacts before or alongside implementation:

1. `00-repository-subscription-inventory.md`
2. `01-current-billing-state.md`
3. `02-feature-entitlement-audit.md`
4. `03-entitlement-decision-matrix.csv`
5. `04-subscription-architecture-adr.md`
6. `05-pricing-decision-record.md`
7. `06-existing-merchant-migration-plan.md`
8. `07-shopify-app-pricing-setup-runbook.md`
9. `08-app-store-pricing-content-delta.md`
10. `09-alert-and-gating-copy-inventory.md`
11. `10-test-matrix.md`
12. `11-rollout-and-rollback-runbook.md`
13. `12-final-implementation-report.md`

Do not fabricate repository evidence. Every current-state claim must cite an actual file, symbol, database field, route, query, test, or configuration discovered in the codebase.

---

## 5. Definition of done

The project is complete only when all of the following are true:

- Free and Growth are represented by a centralized entitlement model.
- Growth monthly and Growth annual produce identical feature access.
- A Free shop can publish exactly the allowed number of active bundles.
- A Free shop can complete a real storefront purchase flow.
- A Free shop cannot bypass a Growth restriction by calling an API directly.
- A Growth shop is not incorrectly blocked by Free restrictions.
- Existing merchant data is preserved.
- Existing merchants affected by new gates have an explicit migration state.
- Subscription status is verified from Shopify rather than trusted from URL parameters or client state.
- Plan status failures have a bounded, documented fallback policy.
- Shopify-compatible alerts are used for every gate and billing state.
- Monthly and annual prices are configuration-driven.
- The Shopify App Store pricing setup has a documented Partner Dashboard runbook.
- Current listing claims are reconciled with the approved entitlement matrix.
- Listing images do not contain pricing.
- All published listing locales have pricing descriptions.
- Unit, integration, end-to-end, accessibility, and regression tests pass.
- A rollback switch can disable enforcement without deleting configuration.
- Instrumentation reports gate encounters, pricing intent, activation, and churn.
- No Reddit marketing work is included.

---

# PART I — DISCOVERY AND PRODUCT DECISIONS

## 6. Phase 0: Establish a safe baseline

### SUB-000 — Create the working branch and baseline report

**Goal:** Establish a reproducible baseline before subscription changes.

**Actions:**

1. Create a dedicated branch.
2. Record:
   - Commit SHA.
   - Runtime versions.
   - Package manager.
   - Shopify app framework and version.
   - Admin API version.
   - Database and migration system.
   - Test commands.
   - Lint and type-check commands.
   - Local development command.
3. Run the current:
   - Unit tests.
   - Integration tests.
   - End-to-end tests.
   - Type checking.
   - Linting.
   - Build.
4. Record all pre-existing failures separately.
5. Do not attribute pre-existing failures to subscription work.

**Output:**

- Baseline section in `00-repository-subscription-inventory.md`.

**Stopping criteria:**

- The repository can be built or every blocking baseline failure is documented.
- Codex knows how to run the app and test storefront/admin behavior.

---

## 7. Phase 1: Repository reconnaissance

### SUB-001 — Locate all billing and pricing code

Search the repository for concepts such as:

```text
billing
subscription
pricing
plan
trial
charge
appSubscriptionCreate
currentAppInstallation
activeSubscription
plan_handle
managed pricing
Shopify App Pricing
Billing API
APP_SUBSCRIPTIONS_UPDATE
recurring
annual
monthly
free plan
upgrade
downgrade
cancel
frozen
```

Inspect:

- App configuration files.
- Environment-variable schemas.
- Authentication middleware.
- Shop/session models.
- Billing routes.
- Pricing pages.
- Webhook handlers.
- GraphQL clients.
- Partner API clients.
- Admin API clients.
- Background reconciliation jobs.
- Tests.
- Development-store setup.
- Listing configuration retained in the repository.

Classify the current system as one of:

1. No billing implementation.
2. Manual Billing API.
3. Legacy managed pricing.
4. Current Shopify App Pricing.
5. Hybrid or partially migrated.
6. Custom internal plan flags without Shopify billing.
7. Unknown because required code is outside the repository.

**Output:**

- `01-current-billing-state.md`.

**Required evidence table:**

| Area | Actual path/symbol | Current behavior | Risk | Required change |
|---|---|---|---|---|

**Stopping criteria:**

- The billing source of truth is known.
- The migration path is known.
- No billing implementation begins from an assumption.

---

### SUB-002 — Locate current App Store listing material

The repository may contain:

- App listing copy.
- Localization files.
- Feature bullets.
- Pricing copy.
- App introduction.
- App details.
- Media captions.
- Screenshots.
- Feature images.
- Submission notes.
- Demo-store information.

Codex must:

1. Locate these assets.
2. Record every listing claim that names a feature or service.
3. Map each claim to current implementation evidence.
4. Flag claims that are:
   - Implemented and stable.
   - Implemented but incomplete.
   - Hidden or unavailable.
   - Planned but not implemented.
   - Intended for Growth.
   - Intended for Free.
   - Ambiguous.
5. Do not rewrite screenshots or listing copy during discovery.
6. Do not put pricing into screenshots or other undesignated listing areas.
7. Treat screenshots as evidence of claimed functionality, not as the source of entitlement logic.

**Output:**

- Listing section in `00-repository-subscription-inventory.md`.
- Initial `08-app-store-pricing-content-delta.md`.

**Stopping criteria:**

- Every material listing claim is mapped to a feature or marked unresolved.

---

### SUB-003 — Build the complete feature inventory

Search:

- Admin forms.
- Configuration schemas.
- Bundle models.
- Bundle type discriminators.
- Discount rule schemas.
- Template and preset registries.
- Storefront renderers.
- Theme app extensions.
- Shopify Functions.
- Metafields.
- Analytics code.
- Support/onboarding surfaces.
- Tests and fixtures.
- Merchant-facing documentation.

Inventory every independently configurable capability.

At minimum, investigate whether the repository contains:

- Full-page bundles.
- Product-page bundles.
- Multi-step construction.
- Product/category selection.
- Product search.
- Product variants.
- Quantity controls.
- Fixed discounts.
- Percentage discounts.
- Tiered discounts.
- Step-based progress.
- Box sizes or tier selectors.
- Free gifts.
- Included/default products.
- Add-ons.
- Upsells.
- Template choices.
- Basic design customization.
- Advanced design customization.
- Custom CSS.
- Editable copy.
- Branding removal.
- Analytics.
- AOV or revenue attribution.
- Scheduling.
- Duplication.
- Import/export.
- Localization.
- Priority support or onboarding.
- Integrations.
- Headless support.
- Multi-store functionality.

For each feature, record:

| Field | Meaning |
|---|---|
| Feature key | Stable machine-readable identifier |
| Merchant-facing name | Current UI/listing name |
| Bundle type | FPB, PPB, both, or app-wide |
| Configuration source | Schema/model path |
| UI source | Screen/component path |
| Server mutation | Route/service path |
| Storefront source | Renderer/extension/function path |
| Tests | Existing test path |
| Current usage | Measurable from DB or unknown |
| Current listing claim | Yes/no and source |
| Stability | Stable, partial, experimental, broken, unknown |
| Independent enforceability | Easy, moderate, difficult |
| Proposed tier | Free, Growth, never gate, defer |
| Migration risk | Low, medium, high |

**Output:**

- `02-feature-entitlement-audit.md`.

**Stopping criteria:**

- No merchant-facing capability is omitted.
- Every proposed Growth feature exists and is stable enough to sell.
- Broken or unfinished features are not used to justify Growth pricing.

---

## 8. Phase 2: Feature classification

### SUB-004 — Classify each feature

Use these classifications:

#### `NEVER_GATE`

Required for correctness, trust, safety, accessibility, or basic operation.

Examples:

- Cart correctness.
- Inventory sync.
- Normal variants.
- Mobile responsiveness.
- Accessibility.
- Performance.
- Security.
- Bug fixes.

#### `CORE_FREE`

Needed to let a merchant receive meaningful value before paying.

Examples may include:

- One real active bundle.
- FPB and PPB.
- Basic variants.
- Basic quantity selection.
- Basic fixed or percentage discount.
- Basic styling and copy.
- Storefront preview.
- Normal cart flow.

#### `GROWTH_FEATURE`

An advanced, independently valuable merchandising or customization capability.

Examples may include:

- Multi-tier discounts.
- Advanced progress rules.
- Free gifts.
- Upsells.
- Add-ons.
- All premium templates.
- Advanced design controls.
- Branding removal.
- Advanced analytics.

#### `GROWTH_LIMIT`

A scale-based difference rather than a feature difference.

Examples:

- More than one active bundle.
- More than the Free step limit.
- More advanced campaign capacity.

#### `DEFER_UNTIL_STABLE`

A feature that could be premium later but is not ready to sell.

#### `LEGACY_ONLY`

A capability preserved temporarily for existing merchants during migration.

### Decision rubric

A feature should be gated only when all of the following are true:

1. Free remains end-to-end useful without it.
2. The feature provides understandable merchant value.
3. The feature can be enforced server-side.
4. Gating does not compromise correctness or accessibility.
5. Existing usage can be migrated safely.
6. The feature is stable enough to support as a paid promise.
7. The listing can describe it accurately.
8. The gate is not merely an arbitrary inconvenience.

Do not use a mathematical score as an automatic decision. Use a worksheet to support a human-readable decision.

**Output:**

- `03-entitlement-decision-matrix.csv`.
- Decision notes in `02-feature-entitlement-audit.md`.

---

## 9. Provisional entitlement hypothesis

This matrix is a starting hypothesis. Codex must validate every row against repository evidence before implementing it.

| Capability | Free hypothesis | Growth hypothesis | Notes |
|---|---|---|---|
| Active bundles | 1 | Unlimited | Count across FPB and PPB |
| Draft bundles | Unlimited | Unlimited | Reassess only if there is real cost/abuse |
| FPB | Included | Included | Core value |
| PPB | Included | Included | Core value |
| FPB steps | Up to 2 | Unlimited | Validate step architecture |
| Standard FPB template | Included | Included | Confirm actual default name |
| Default PPB template | Included | Included | Confirm actual default name |
| Other stable templates | Preview only or locked | Included | Preview should not publish on Free |
| Product variants | Included | Included | Never gate normal variant support |
| Quantity controls | Included | Included | Core operation |
| One basic discount rule | Included | Included | Define exact rule boundary |
| Multiple discount tiers | Locked | Included | Strong Growth candidate |
| Step-based discount progress | Locked | Included | Strong Growth candidate |
| Box-size/tier selection | Locked | Included | Validate actual feature |
| Categories | Limited/basic | Included | Determine whether needed for Free UX |
| Product search | Limited/basic | Included | Do not make large bundles unusable |
| Free gifts | Locked | Included | Strong Growth candidate |
| Add-ons | Locked | Included | Strong Growth candidate |
| Upsells | Locked | Included | Strong Growth candidate |
| Default-included products | Locked | Included | Strong Growth candidate |
| Basic colors and typography | Included | Included | Free must match merchant theme |
| Basic editable copy | Included | Included | Avoid visibly generic Free widgets |
| Advanced component styling | Locked | Included | Validate design system |
| Custom CSS | Locked or deferred | Included or deferred | Gate only if safe and supported |
| Remove Wolfpack branding | Locked | Included | Common paid entitlement |
| Basic analytics | Included if already present | Included | Basic proof of value helps activation |
| Advanced analytics | Locked | Included | Only if implemented and accurate |
| Standard support | Included | Included | Required for operation |
| Priority support/onboarding | Not included | Included | Service entitlement |
| Order cap | None | None | Do not use |
| Revenue cap | None | None | Do not use |
| Storefront views cap | None | None | Do not use |
| Accessibility/performance | Included | Included | Never gate |

### Required human-readable rationale

For every final Growth gate, Codex must write:

- What merchant problem the feature solves.
- Why Free remains useful without it.
- How the server enforces it.
- What happens to an existing configuration on downgrade.
- What alert is shown.
- What event is recorded.
- What test proves the gate cannot be bypassed.

---

# PART II — PRICING STRATEGY

## 10. Phase 3: Select the Growth price

### SUB-005 — Create a current competitor pricing benchmark

Codex must research current comparable Shopify bundle apps at the time of implementation.

Use current Shopify App Store data and record the date checked.

Select approximately 10–15 relevant apps across these categories:

- Build-a-box.
- Mix-and-match bundles.
- Full-page bundle builders.
- Product-page bundles.
- Tiered discount bundle apps.
- Gift and upsell bundle apps.
- Low-cost bundle utilities.
- Premium merchandising suites.

For each competitor, record:

| Field | Required |
|---|---|
| App name | Yes |
| Date checked | Yes |
| Free plan | Yes/no |
| Trial | Days/none |
| Entry paid price | Monthly |
| Comparable paid price | Monthly |
| Annual option | Price/discount |
| Order/revenue cap | Yes/no |
| Active bundle cap | Yes/no |
| Key paid features | Normalized |
| Rating/review count | Context only; do not use as causal proof |
| Positioning | Utility, mid-market, premium |
| Source | Current listing |

Normalize features rather than comparing plan names.

Do not treat a competitor’s highest plan as comparable if it includes materially different enterprise services.

**Output:**

- Competitor section in `05-pricing-decision-record.md`.

---

### SUB-006 — Calculate Wolfpack’s economic floor

Codex must gather or create placeholders for:

- Shopify revenue share.
- Payment/billing deductions handled by Shopify.
- Hosting cost per active shop.
- Database cost.
- Job/queue cost.
- Logging and observability cost.
- Support time per paid merchant.
- Theme-compatibility support burden.
- Expected refund/credit allowance.
- Tax/accounting considerations.
- Target gross margin.
- Development maintenance allowance.

Use this formula:

```text
minimum_monthly_price =
  (monthly_variable_cost_per_paid_shop
   + support_cost_per_paid_shop
   + risk_allowance)
  / (1 - platform_revenue_share - target_margin_adjustment)
```

Do not invent unavailable financial inputs. Mark them as owner-supplied values and provide a spreadsheet-ready table.

**Output:**

- Cost-floor section in `05-pricing-decision-record.md`.

---

### SUB-007 — Measure existing merchant value and feature demand

Use repository-accessible data where lawful and available.

Measure:

- Number of installed shops.
- Active shops.
- Shops with at least one bundle.
- Shops with at least one published bundle.
- Number of active bundles per shop.
- FPB versus PPB use.
- Number of steps per FPB.
- Template selection.
- Discount rule usage.
- Gift/add-on/upsell usage.
- Advanced design usage.
- Analytics usage.
- Time from install to first draft.
- Time from install to publish.
- First bundle order.
- 30-day retention.
- Support topics.
- Features most frequently requested.
- Features used by the most engaged merchants.

Do not expose merchant PII in the pricing report.

Where historical instrumentation is absent:

1. State that the metric is unavailable.
2. Add the required event.
3. Run a shadow-measurement period before final enforcement where feasible.

**Output:**

- Merchant-value section in `05-pricing-decision-record.md`.

---

### SUB-008 — Prepare willingness-to-pay research

Codex cannot replace merchant interviews, but it must generate a concise research instrument.

Create questions covering:

- Current bundle app and monthly price.
- Primary bundle use case.
- Most important Wolfpack feature.
- Current pain or workaround.
- Price that feels inexpensive.
- Price that feels reasonable.
- Price that feels expensive but still possible.
- Price that feels too expensive.
- Whether annual billing is acceptable.
- Expected support level.
- Whether one Free active bundle is sufficient for evaluation.
- Whether two Free FPB steps are sufficient for evaluation.

Target an initial sample of engaged or founding merchants rather than broad low-intent survey traffic.

Record results without tying statements to public identities.

**Output:**

- Interview appendix in `05-pricing-decision-record.md`.

---

## 11. Candidate price scorecard

Evaluate at least these candidates:

| Candidate | Monthly | Annual | Approximate annual discount | Effective monthly |
|---|---:|---:|---:|---:|
| Accessible | $19.99 | $199 | 17.0% | $16.58 |
| Mid | $24.99 | $249 | 17.0% | $20.75 |
| Premium | $29.99 | $299 | 16.9% | $24.92 |

Score each candidate from 1–5 using:

| Criterion | Weight |
|---|---:|
| Merchant willingness to pay | 25% |
| Feature-value alignment | 20% |
| Comparable market positioning | 15% |
| Support and infrastructure margin | 15% |
| Free-to-paid conversion risk | 10% |
| Future pricing headroom | 10% |
| Annual commitment attractiveness | 5% |

Calculate:

```text
weighted_score =
  Σ(criterion_score × criterion_weight)
```

### Default decision rule

Use **$19.99/month and $199/year** unless the evidence shows one of the following:

Choose **$24.99/$249** when:

- Growth includes multiple mature, differentiated merchandising capabilities.
- Engaged merchants consistently accept a price above $20.
- Support burden makes $19.99 unattractive.
- Comparable products with similar depth cluster above $20.

Choose **$29.99/$299** only when:

- Advanced analytics and optimization features are mature.
- The app reliably replaces multiple narrower apps.
- Merchant interviews support the premium.
- Support/onboarding services are operationally defined.
- Conversion risk is acceptable.

Do not choose a higher price merely to appear premium.

### Trial decision

Default to **no Growth trial** because Free already provides a real evaluation path.

Add a Growth trial only when data shows merchants need to test advanced features before subscribing. If added:

- Keep the duration configuration-driven.
- Do not use fake urgency.
- Clearly explain what happens at trial end.
- Test cancellation and downgrade behavior.
- Update the Pricing details accurately.

### Price approval gate

Before production pricing is configured, `05-pricing-decision-record.md` must contain:

- Final monthly price.
- Final annual price.
- Exact annual discount.
- Trial duration.
- Effective date.
- Existing-subscriber price policy.
- Owner approval.
- Evidence summary.
- Rollback/change policy.

If owner approval is unavailable, Codex may implement the system using non-production default configuration, but must not claim that Partner Dashboard production pricing has been finalized.

---

# PART III — SUBSCRIPTION ARCHITECTURE

## 12. Phase 4: Architecture decision record

### SUB-009 — Define the canonical model

Create stable internal types similar to:

```ts
type PlanCode = "FREE" | "GROWTH";
type BillingInterval = "NONE" | "MONTHLY" | "ANNUAL";

type SubscriptionStatus =
  | "ACTIVE"
  | "PENDING"
  | "CANCELLED"
  | "FROZEN"
  | "EXPIRED"
  | "UNKNOWN";

type SubscriptionProvider =
  | "SHOPIFY_APP_PRICING"
  | "LEGACY_BILLING_API"
  | "ENTITLEMENT_OVERRIDE";
```

Monthly and annual must map to the same `PlanCode: "GROWTH"`.

Never implement feature access by checking price, billing interval, display name, or UI label.

### Entitlement primitives

Prefer capabilities and limits:

```ts
type EntitlementKey =
  | "bundle.publish"
  | "bundle.active.limit"
  | "bundle.steps.limit"
  | "bundle.template.premium"
  | "discount.multiple_tiers"
  | "discount.step_progress"
  | "merchandising.free_gift"
  | "merchandising.add_on"
  | "merchandising.upsell"
  | "merchandising.default_included"
  | "design.advanced"
  | "design.remove_branding"
  | "analytics.advanced"
  | "support.priority";
```

Use the repository’s actual feature vocabulary after discovery.

### Required services

Create or adapt these responsibilities:

1. **Subscription provider**
   - Fetches current Shopify subscription.
   - Maps provider data to internal status.
2. **Subscription repository/cache**
   - Stores a local snapshot.
   - Does not become the ultimate billing source of truth.
3. **Entitlement resolver**
   - Converts plan plus overrides into capabilities and limits.
4. **Usage-limit service**
   - Counts active bundles transactionally.
5. **Bundle requirement detector**
   - Determines which Growth entitlements a configuration uses.
6. **Gate assertion service**
   - Rejects unauthorized mutations using typed errors.
7. **Migration/override service**
   - Applies temporary legacy access.
8. **Telemetry service**
   - Records gate and subscription events.
9. **Reconciliation job**
   - Refreshes stale subscription state.
10. **Alert mapping layer**
    - Converts typed gate errors to appropriate merchant UX.

**Output:**

- `04-subscription-architecture-adr.md`.

**Stopping criteria:**

- Entitlements are independent of billing interval.
- The backend is authoritative.
- Legacy migration is explicitly represented.
- Failure behavior is documented.

---

## 13. Suggested local data model

Adapt this to the repository’s ORM and conventions.

### `SubscriptionSnapshot`

Suggested fields:

```text
id
shopId
provider
planCode
billingInterval
status
shopifyPlanHandle
shopifySubscriptionId
currentPeriodStart
currentPeriodEnd
pendingPlanCode
pendingBillingInterval
lastVerifiedAt
verificationExpiresAt
lastSyncErrorCode
lastSyncErrorAt
createdAt
updatedAt
```

This is a cache and audit aid, not independent proof of payment.

### `EntitlementOverride`

Suggested fields:

```text
id
shopId
overrideType
planCode
featureKey
limitKey
limitValue
reason
startsAt
expiresAt
createdBy
createdAt
updatedAt
```

Use cases:

- Existing merchant transition.
- Staff shop.
- Development shop.
- Support-approved temporary access.
- Migration exception.

Overrides must be:

- Auditable.
- Time-bounded unless explicitly justified.
- Server-side.
- Revocable.
- Excluded from public pricing logic.

### `SubscriptionAuditEvent`

Suggested fields:

```text
id
shopId
eventType
provider
previousPlanCode
nextPlanCode
previousStatus
nextStatus
source
dedupeKey
metadataJson
occurredAt
createdAt
```

Do not store secrets or unnecessary PII.

---

## 14. Subscription source-of-truth policy

### Current Shopify App Pricing path

At implementation time, verify the current official Shopify behavior.

The expected target behavior is:

- Shopify hosts plan selection and billing.
- Growth supports monthly and annual choices.
- Redirect parameters are hints, not proof.
- Confirm the active subscription using Shopify’s current subscription API.
- For current Shopify App Pricing, use the Partner API active-subscription data as the canonical live contract state.
- Handle cancellations, freezes, and changes that occur outside an app redirect through reconciliation or just-in-time verification.
- Store plan handles in configuration.
- Never trust `plan_handle`, `shop`, or other URL parameters without authenticated verification.

### Legacy Billing API path

If repository discovery finds active legacy billing:

1. Document it.
2. Do not abruptly switch the source of truth.
3. Follow Shopify’s current migration guidance.
4. During migration, query both the current Shopify App Pricing subscription and legacy Billing API subscription where required.
5. Do not interpret a null Shopify App Pricing response as Free until the legacy system also confirms no paid entitlement.
6. Retire dual-read only when no legacy subscriptions remain.
7. Preserve existing subscriber terms unless an explicit migration policy says otherwise.

### Cache policy

Implement a bounded cache:

- Use the last verified active Growth state for a short grace window during a Shopify API outage.
- Do not grant Growth to a shop whose paid state has never been verified.
- Do not demote a known paid merchant immediately because of a transient API failure.
- Mark stale status visibly in internal observability.
- Retry with backoff.
- Refresh before high-impact mutations when the cache exceeds the defined freshness threshold.
- Make thresholds configuration-driven.

Suggested starting values for review:

```text
normal subscription cache TTL: 15 minutes
known-active outage grace: 24 hours
background reconciliation: at least daily
high-impact action refresh: when stale beyond normal TTL
```

These values must be reviewed against app traffic and Partner API limits.

---

# PART IV — SHOPIFY APP PRICING

## 15. Phase 5: Configure the billing model

### SUB-010 — Adopt Shopify App Pricing

Unless discovery shows a justified exception, use Shopify App Pricing for the public app.

The public pricing structure should be:

#### Free

- No charge.
- Entitlements defined by the Free capability set.

#### Growth

- Display name: `Growth`.
- Monthly option.
- Annual option.
- Same features for both intervals.
- No semi-annual option.
- No usage charge.
- No revenue cap.
- No order cap.

Codex must not attempt to simulate a six-month interval.

### Code responsibilities

The application should:

- Provide a pricing/plan-management entry point.
- Link merchants to Shopify’s hosted plan-selection flow using the current supported mechanism.
- Handle the configured welcome/return link.
- Authenticate the returning shop.
- Verify the live subscription.
- Update the local snapshot.
- Recompute entitlements.
- Show success or actionable failure feedback.
- Handle monthly-to-annual and annual-to-monthly changes.
- Display pending changes accurately.
- Handle Free downgrade.
- Handle cancellation/frozen/expired states.
- Avoid duplicate billing logic already handled by Shopify.

### Partner Dashboard responsibilities

Codex cannot safely assume it can modify Partner Dashboard production settings. It must generate a precise runbook.

The runbook must cover:

1. Open the app in the Partner/Developer Dashboard.
2. Open the app’s distribution and App Store listing management.
3. Open Pricing content.
4. Create or confirm a Free public plan.
5. Create one Growth public plan using monthly with annual option.
6. Enter the approved monthly price.
7. Enter the approved annual price.
8. Configure the approved trial duration, normally zero.
9. Decide whether development stores receive no-charge access.
10. Configure the welcome link to the app’s verified billing callback route.
11. Record generated or configured plan handles.
12. Add Growth plan descriptions for every published listing locale.
13. Add the top Growth features from the approved entitlement matrix.
14. Save as draft first.
15. Test with a development store.
16. Verify monthly selection.
17. Verify annual selection.
18. Verify redirect parameters.
19. Verify active-subscription state.
20. Verify plan appearance in the App Store pricing section.
21. Publish only after code rollout readiness.
22. Record screenshots of Partner Dashboard settings internally for audit, not as public listing media.

**Output:**

- `07-shopify-app-pricing-setup-runbook.md`.

---

## 16. Billing-plan manifest

Create a single application manifest, adapted to repository conventions.

Example shape:

```ts
export const BILLING_PLAN_MANIFEST = {
  free: {
    internalCode: "FREE",
    expectedPlanHandle: process.env.SHOPIFY_FREE_PLAN_HANDLE,
    billingIntervals: [],
  },
  growth: {
    internalCode: "GROWTH",
    expectedPlanHandle: process.env.SHOPIFY_GROWTH_PLAN_HANDLE,
    billingIntervals: ["MONTHLY", "ANNUAL"],
    expectedMonthlyPriceUsd: 19.99,
    expectedAnnualPriceUsd: 199,
  },
} as const;
```

Requirements:

- Prices must not be repeated across unrelated files.
- Plan handles must not be inferred from plan display names.
- Production values must be verified against Partner Dashboard.
- Tests must fail if required production configuration is missing.
- Price values are for display/validation only; Shopify is the billing authority.
- Do not expose Partner API credentials to the browser.
- Do not commit secrets.

---

# PART V — ENTITLEMENT ENFORCEMENT

## 17. Phase 6: Implement centralized gating

### SUB-011 — Build the entitlement resolver

Required API shape may resemble:

```ts
resolveEntitlements({
  planCode,
  subscriptionStatus,
  overrides,
  shopContext,
}): ResolvedEntitlements
```

`ResolvedEntitlements` should answer:

```ts
can(featureKey): boolean
limit(limitKey): number | "UNLIMITED"
reason(featureKey): EntitlementReason
```

The reason should distinguish:

- Included in Free.
- Included in Growth.
- Locked by plan.
- Limit reached.
- Subscription pending.
- Subscription frozen.
- Legacy access.
- Temporary override.
- Unknown billing state.

### SUB-012 — Build the bundle requirement detector

Implement:

```ts
deriveRequiredEntitlements(bundleConfig): EntitlementRequirement[]
```

It must inspect a bundle configuration and report every Growth dependency.

Example output:

```ts
[
  { key: "discount.multiple_tiers", sourcePath: "pricing.rules" },
  { key: "bundle.template.premium", sourcePath: "design.preset" },
]
```

Use this before:

- Draft save, according to policy.
- Publish.
- Activate.
- Duplicate.
- Import.
- Server-side rendering/config generation.
- Function/metafield publication.

### SUB-013 — Enforce usage limits transactionally

For the Free active-bundle limit:

- Define “active bundle” precisely.
- Count across FPB and PPB unless the approved matrix says otherwise.
- Enforce in a transaction or with an equivalent concurrency-safe mechanism.
- Prevent two browser tabs from activating two bundles simultaneously.
- Do not count drafts.
- Do not count archived or deleted bundles.
- Clarify whether scheduled bundles count before their activation date.
- Clarify whether the same bundle embedded in multiple places counts once.
- Return a typed `ACTIVE_BUNDLE_LIMIT_REACHED` error.

### SUB-014 — Enforce every mutation server-side

Do not rely on disabled UI.

Audit and protect:

- Create.
- Save.
- Publish.
- Activate.
- Duplicate.
- Import.
- Template change.
- Discount change.
- Gift/add-on/upsell change.
- Advanced design change.
- Branding removal.
- Analytics export.
- Any public or internal API endpoint.
- Background jobs that publish configuration.
- Shopify Function configuration updates.
- Metafield writes.

Every rejection must include:

- Stable machine code.
- Human-readable merchant message.
- Required plan.
- Feature key.
- Suggested remediation.
- Safe metadata for telemetry.

### SUB-015 — Keep storefront authorization out of the hot path

The customer-facing storefront should not call the billing API on every page view.

Instead:

1. Authorize configuration at publish/activation time.
2. Store an authorized published snapshot.
3. Serve only authorized snapshots.
4. Reconcile published snapshots after plan changes.
5. Prevent stale unauthorized configuration from being newly published.
6. Define downgrade grace behavior.
7. Ensure cart, checkout, discounts, and Functions use the authorized snapshot.

This avoids performance regressions and billing-provider dependency in the storefront path.

---

## 18. Preview, draft, and publish policy

Recommended behavior:

| Action | Free merchant with Growth feature |
|---|---|
| See feature | Yes |
| Read description | Yes |
| Preview feature | Yes when technically safe |
| Configure in temporary preview | Yes when technically safe |
| Save as Growth-required draft | Prefer yes |
| Publish or activate | No |
| API bypass | No |
| Existing published legacy config | Follow migration policy |
| Data deletion | Never |

Benefits:

- Merchants understand Growth before subscribing.
- Merchants can prepare a campaign before upgrading.
- The paywall occurs at a meaningful commitment point.
- Configuration is not lost.

If Growth-required drafts are allowed:

- Add `requiredEntitlements` or derive it on demand.
- Clearly label the draft.
- Prevent accidental storefront activation.
- Show exactly which settings require Growth.
- Provide a direct plan-management action.

Do not allow a premium preview to create customer-facing behavior without authorization.

---

# PART VI — ALERTS AND GATING UX

## 19. Phase 7: Implement Shopify-compatible alerts

### SUB-016 — Create a typed alert mapping

Map domain errors to UI patterns centrally.

Suggested types:

```ts
type GateAlertKind =
  | "LOCKED_FEATURE_INFO"
  | "LIMIT_WARNING"
  | "ACTION_BLOCKED_ERROR"
  | "BILLING_ERROR"
  | "SUBSCRIPTION_PENDING_INFO"
  | "SUBSCRIPTION_SUCCESS"
  | "DOWNGRADE_ACTION_REQUIRED"
  | "LEGACY_ACCESS_INFO";
```

### Alert decision matrix

| Situation | Pattern | Tone | Persistence | Action |
|---|---|---|---|---|
| Merchant notices locked feature | Contextual banner/card caption | Informational | Dismissible or contextual | View Growth plan |
| Locked control displayed | Disabled control + subdued caption + Growth badge | Informational | Persistent with control | Learn more |
| Merchant approaches limit | Inline warning or page banner | Warning | Until resolved/dismissed as appropriate | Review bundles |
| Merchant reaches active-bundle limit | Inline warning before action | Warning | Until resolved | Archive a bundle / View Growth |
| Save/publish blocked | Inline error near source; page-level error if needed | Error | Until resolved | Remove Growth features / View Growth |
| Billing verification fails | Error banner | Error | Until resolved | Retry / Manage plan / Contact support |
| Subscription pending | Informational banner | Informational | Until verified | Refresh status |
| Growth activated | Toast or success banner | Success | Temporary | Continue |
| Downgrade pending | Informational banner | Informational | Until effective | Review effective date |
| Downgrade effective with incompatible bundles | Warning, then error only when action is blocked | Warning/error | Until remediated | Choose active bundle / Upgrade |
| Legacy access expiring | Informational banner, later warning | Informational/warning | Time-appropriate | Review changes |
| Network error unrelated to plan | Error | Error | Until retry/resolution | Retry |

### Content requirements

Every blocking alert must answer:

1. What happened?
2. Why did it happen?
3. What can the merchant do now?

Good structure:

```text
Title: This bundle uses Growth features

Body: Multi-tier discounts and the selected template are available on
Growth. Remove those settings to publish on Free, or view the Growth plan.

Primary action: View Growth plan
Secondary action: Review settings
```

Avoid:

- “Upgrade now to double revenue.”
- “Critical failure” for a normal plan restriction.
- Error codes as the only explanation.
- Humor, idioms, or scary language.
- Repeating the same upgrade banner on every page.
- Using color without text and iconography.
- Auto-disappearing error messages.
- Red alerts for mere feature discovery.

### Accessibility requirements

- Do not rely only on color.
- Include appropriate iconography and text.
- Use semantic alert roles.
- Use `aria-live` appropriately.
- Move focus to blocking errors after failed submit when needed.
- Return focus correctly after pricing modals.
- Ensure keyboard access to the plan action.
- Meet contrast requirements.
- Test at browser zoom levels.
- Test screen-reader announcements.
- Keep error text close to the relevant field or section.

### Required UI states

Implement and test:

- Free, unlocked.
- Free, locked.
- Free, limit nearly reached.
- Free, limit reached.
- Growth monthly.
- Growth annual.
- Growth pending.
- Growth cancellation pending.
- Growth frozen.
- Billing unknown.
- Legacy access.
- Legacy access near expiry.
- Development/test entitlement.
- Subscription API unavailable.

**Output:**

- `09-alert-and-gating-copy-inventory.md`.

The inventory should contain message IDs and purpose, not scattered literal strings.

---

# PART VII — EXISTING MERCHANT MIGRATION

## 20. Phase 8: Build a migration strategy

### SUB-017 — Audit existing merchant impact

Before enforcement, generate a dry-run report.

For every installed shop, determine:

- Current bundle count.
- Active bundle count.
- FPB/PPB usage.
- Steps per active bundle.
- Premium template usage.
- Multi-tier discount usage.
- Gift/add-on/upsell usage.
- Advanced design usage.
- Existing paid status, if any.
- Whether the final Free matrix would block the current state.
- Whether the listing previously represented the capability as free.
- Recommended migration class.

Migration classes:

1. `FREE_COMPATIBLE`
2. `GROWTH_FEATURES_IN_DRAFT_ONLY`
3. `GROWTH_FEATURES_ACTIVE`
4. `MULTIPLE_ACTIVE_BUNDLES`
5. `LEGACY_PAID_SUBSCRIPTION`
6. `DEVELOPMENT_OR_STAFF`
7. `UNKNOWN_REQUIRES_REVIEW`

No enforcement may launch until the unknown class is reviewed or safely handled.

### SUB-018 — Implement explicit legacy access

Recommended default:

- Existing merchants using Growth-classified features receive temporary legacy Growth access.
- Store an entitlement override with a clear reason and expiry.
- Default planning assumption: 90 days.
- Make the duration configuration-driven.
- Do not silently disable current storefronts on launch day.
- Record every override.
- Provide an internal report of overrides and expiration dates.

If the owner chooses indefinite grandfathering for specific merchants, represent it explicitly rather than hiding it in code.

### SUB-019 — Downgrade behavior

#### Monthly to annual or annual to monthly

- Entitlements remain Growth.
- Show the current interval and pending interval.
- Do not flicker access during the transition.
- Let Shopify handle billing-cycle mechanics.
- Verify live state after redirect.

#### Growth to Free

Until the downgrade becomes effective:

- Keep Growth access.
- Show the effective date.
- Let the merchant review incompatible bundles.

After it becomes effective:

1. Preserve every bundle and setting.
2. Permit read access.
3. Identify all incompatible active bundles.
4. Ask the merchant to select the one bundle to retain on Free.
5. Prefer a merchant decision over an automatic choice.
6. If no decision occurs, apply the approved grace policy.
7. After grace, preserve the most recently published or explicitly designated bundle and pause the others.
8. If the retained bundle uses Growth-only settings, show a remediation workflow:
   - Replace premium template.
   - Reduce steps.
   - Remove extra discount tiers.
   - Remove gifts/add-ons/upsells.
   - Restore branding.
   - Or reactivate Growth.
9. Never delete configuration.

#### Frozen, cancelled, or expired

- Follow the live Shopify status.
- Use a bounded grace only as documented.
- Preserve data.
- Avoid treating a transient API failure as cancellation.
- Show clear recovery guidance.

### SUB-020 — Existing listing transition

Because repository listing material may currently describe features as free:

1. Generate a claim-to-entitlement delta.
2. Do not change public claims before the app can enforce and support the new plans.
3. Do not enable enforcement before pricing is visible and accurate.
4. Coordinate code rollout and Partner Dashboard publication.
5. Keep a rollback copy of the prior listing content.
6. Avoid removing claims for features that remain included.
7. Move plan-specific claims into the designated pricing content where appropriate.
8. Ensure no screenshot contains pricing.
9. Ensure screenshots do not imply a Free entitlement that is no longer true.
10. Do not redesign screenshots as part of this project unless a screenshot becomes materially inaccurate.

**Output:**

- `06-existing-merchant-migration-plan.md`.
- Updated `08-app-store-pricing-content-delta.md`.

---

# PART VIII — APP STORE PRICING CONTENT

## 21. Phase 9: Prepare listing-related subscription outputs

This phase is limited to subscription accuracy. It is not a general App Store copywriting or screenshot-redesign project.

### SUB-021 — Derive Growth feature bullets from code

Codex must generate Growth plan feature candidates from the approved entitlement matrix.

Rules:

- Include only implemented, stable features.
- Use merchant-facing language.
- Do not mention technical mechanics.
- Do not promise revenue outcomes.
- Do not say “best,” “only,” “guaranteed,” or similar.
- Do not include price outside Pricing details.
- Keep feature bullets concise and scannable.
- Validate field limits in the current Partner Dashboard.
- Provide localized descriptions for every published listing locale.
- Keep monthly and annual feature lists identical.
- Do not list roadmap features.

Potential feature/service categories to validate against the repository:

- Unlimited active bundle campaigns.
- All supported FPB and PPB templates.
- Advanced multi-step bundle builders.
- Multiple discount tiers and progress messaging.
- Free gifts, add-ons, and upsells.
- Advanced storefront design controls.
- Branding removal.
- Advanced bundle analytics.
- Priority support or onboarding.

These are categories, not approved final claims.

### SUB-022 — Produce a pricing-content runbook

The runbook must contain fields for:

```text
Free plan display name
Free top features
Growth display name
Growth monthly price
Growth annual price
Growth trial
Growth top features
Welcome link
Development-store treatment
Plan handles
Published locales
Effective date
Reviewer
```

### SUB-023 — Validate listing consistency

Check:

- App introduction.
- App details.
- General feature list.
- Pricing details.
- Top features under Free.
- Top features under Growth.
- Demo-store behavior.
- Screenshots.
- Feature image.
- Help documentation.
- In-app pricing page.

Produce a delta table:

| Surface | Current claim | Approved entitlement | Change required | Owner |
|---|---|---|---|---|

Do not automatically rewrite every surface. Make only subscription-accuracy changes approved by the final matrix.

---

# PART IX — ANALYTICS AND OBSERVABILITY

## 22. Phase 10: Instrument the subscription funnel

### SUB-024 — Add subscription events

Use the repository’s existing analytics system where available.

Suggested events:

```text
subscription_pricing_page_viewed
subscription_interval_selected
subscription_checkout_started
subscription_redirect_received
subscription_verification_succeeded
subscription_verification_failed
subscription_growth_activated
subscription_downgrade_requested
subscription_downgrade_effective
subscription_cancelled
subscription_frozen
subscription_cache_stale
subscription_override_applied
subscription_override_expired

entitlement_locked_feature_viewed
entitlement_locked_feature_clicked
entitlement_limit_warning_shown
entitlement_action_blocked
entitlement_growth_draft_saved
entitlement_publish_blocked
entitlement_remediation_started
entitlement_remediation_completed
```

Required dimensions:

- Shop pseudonymous identifier.
- Plan code.
- Billing interval.
- Feature key.
- Gate location.
- Bundle type.
- Action.
- Result.
- Error code.
- Migration class.
- App version.

Do not include:

- Customer PII.
- Product names unless justified and protected.
- Partner API secrets.
- Raw access tokens.
- Full bundle configuration.

### Metrics

Track:

- Install to first draft.
- Install to first publish.
- First bundle order.
- Free active-bundle utilization.
- Locked-feature encounter rate.
- Pricing-page view rate.
- Checkout-start rate.
- Checkout approval rate.
- Monthly versus annual selection.
- Growth activation rate.
- Upgrade trigger by feature.
- 30-day and 90-day paid retention.
- Downgrade rate.
- Cancellation rate.
- Verification failure rate.
- False gate reports.
- Support tickets per paid merchant.
- Legacy migration completion.
- Shops blocked by incompatible downgrade state.

### Pricing evaluation window

For the initial engaged-merchant objective:

- Favor qualitative feedback and successful activation over raw install volume.
- Review the first 10–20 serious Growth prospects individually.
- Record why each merchant:
  - Did not view pricing.
  - Viewed but did not start checkout.
  - Started but did not approve.
  - Approved monthly.
  - Approved annual.
  - Cancelled.
  - Stayed.

Do not change pricing after every anecdote. Use a defined review cadence and minimum evidence threshold.

---

# PART X — TESTING

## 23. Phase 11: Automated test plan

### SUB-025 — Unit tests

Test:

- Plan mapping.
- Monthly and annual map to Growth.
- Free entitlement resolution.
- Growth entitlement resolution.
- Overrides.
- Override expiry.
- Unknown status.
- Frozen/cancelled status.
- Active-bundle limit.
- Step limit.
- Required-entitlement detection.
- Multiple Growth features in one configuration.
- Alert-kind mapping.
- Annual savings calculation.
- Price formatting.
- Stale-cache behavior.
- Migration classification.
- Typed gate errors.
- No plan-name string checks outside the plan catalog.

### SUB-026 — Integration tests

Test server behavior:

1. Free shop creates first draft.
2. Free shop publishes first eligible bundle.
3. Free shop creates another draft.
4. Free shop cannot activate a second bundle.
5. Free shop cannot publish a Growth-required draft.
6. Free shop cannot bypass a gate through direct API calls.
7. Free shop can use normal product variants.
8. Free shop can complete a customer storefront flow.
9. Growth monthly can use all Growth entitlements.
10. Growth annual can use all Growth entitlements.
11. Monthly and annual entitlement snapshots are identical.
12. Pending subscription is not treated as active without verification.
13. Tampered redirect parameters do not grant access.
14. Verified redirect activates Growth.
15. Cancellation/downgrade retains access until effective when Shopify reports it.
16. Effective downgrade preserves data.
17. Legacy override preserves existing behavior until expiry.
18. Override expiry triggers remediation, not deletion.
19. Concurrent activation attempts cannot exceed the Free limit.
20. API outage uses bounded known-active grace.
21. Unknown shops are not granted Growth during outage.
22. Legacy billing fallback works if migration requires it.
23. Subscription reconciliation is idempotent.
24. Audit events are deduplicated.

### SUB-027 — Storefront regression tests

For every supported bundle type and relevant template:

- Product selection.
- Variant selection.
- Quantity changes.
- Discount calculations.
- Gift/add-on/upsell behavior where authorized.
- Summary/sidebar/footer behavior.
- Cart creation.
- Cart transform behavior.
- Checkout path.
- Inventory changes.
- Mobile behavior.
- Accessibility.
- Published snapshot authorization.
- Downgrade reconciliation.

The subscription layer must not create storefront LCP regressions by making runtime billing requests.

### SUB-028 — End-to-end tests with Chrome DevTools

Use the available Chrome tooling and a development store.

Test at minimum:

#### Free

- Pricing page.
- Free current-plan state.
- One active bundle.
- Second activation warning.
- Locked premium control.
- Premium preview.
- Growth-required draft.
- Publish error.
- Alert focus behavior.
- Direct navigation and refresh.
- Mobile admin viewport.

#### Growth monthly

- Select monthly.
- Shopify plan flow.
- Redirect.
- Verification.
- Success toast.
- Premium publish.
- Pricing page current state.

#### Growth annual

- Select annual.
- Shopify plan flow.
- Redirect.
- Verification.
- Same premium publish.
- Correct annual state.
- Correct savings display.

#### Lifecycle

- Pending.
- Cancelled.
- Frozen.
- Downgrade pending.
- Downgrade effective.
- Legacy access.
- API failure.
- Retry.
- Uninstall and reinstall where relevant.

Record:

- Screenshots for internal QA.
- Console errors.
- Network errors.
- Accessibility findings.
- Layout shifts.
- Billing request count.
- Subscription verification timing.

### SUB-029 — Accessibility tests

Test:

- Keyboard-only navigation.
- Screen-reader alert announcements.
- Focus after blocked submit.
- Focus after closing plan modal.
- Disabled-state semantics.
- Error association.
- Color contrast.
- Icons plus text.
- 200% zoom.
- Mobile viewport.
- No inaccessible tooltip-only explanations.

### SUB-030 — Security tests

Test:

- Shop spoofing.
- Redirect tampering.
- Plan-handle tampering.
- Session-shop mismatch.
- Cross-shop entitlement access.
- Cached state poisoning.
- Client state manipulation.
- Replay of subscription callbacks.
- Unauthorized override creation.
- Secrets exposed in browser bundles.
- Logging of tokens or credentials.
- Race conditions on active-bundle count.
- Forged internal API requests.

---

## 24. Complete test matrix

Create `10-test-matrix.md` with columns:

| ID | Plan | Interval | Status | Migration state | Feature | Action | Expected UI | Expected server result | Automated test | Manual test |
|---|---|---|---|---|---|---|---|---|---|---|

No subscription state may remain untested merely because it is uncommon.

---

# PART XI — ROLLOUT

## 25. Phase 12: Progressive rollout

### SUB-031 — Add rollout controls

Use the repository’s existing feature-flag system. If none exists, add the smallest appropriate mechanism.

Required controls:

```text
subscription_ui_enabled
subscription_shadow_mode
subscription_backend_enforcement_enabled
subscription_existing_merchants_enabled
subscription_new_installs_enabled
subscription_migration_alerts_enabled
subscription_plan_redirect_enabled
```

A master emergency switch must disable new enforcement while preserving existing subscription records and bundle data.

### Rollout stages

#### Stage 0 — Development only

- Billing integration in development environment.
- No production gates.
- Complete automated tests.

#### Stage 1 — Shadow mode

- Resolve entitlements.
- Detect violations.
- Record what would be blocked.
- Do not block merchant actions.
- Produce impact report.

#### Stage 2 — Staff/test shops

- Enable UI and backend enforcement for internal shops.
- Complete monthly and annual test flows.
- Test downgrade and rollback.

#### Stage 3 — Selected existing merchants

- Apply explicit overrides.
- Show migration notices.
- Validate support workflows.
- Do not silently remove access.

#### Stage 4 — New installs

- Present Free and Growth immediately.
- Enforce final matrix.
- Observe activation and gate events.

#### Stage 5 — Existing merchant migration

- Begin grace countdown.
- Support remediation.
- Monitor affected shops.
- Pause incompatible bundles only according to approved policy.

#### Stage 6 — General availability

- Publish pricing changes.
- Enable enforcement for all eligible shops.
- Monitor billing and gate failures.

### Rollback triggers

Rollback enforcement when:

- Paid merchants are incorrectly identified as Free.
- Storefront checkout is affected.
- Active-bundle counts are inconsistent.
- Partner API verification failure exceeds threshold.
- Existing bundle data is modified unexpectedly.
- App review rejects the pricing implementation.
- Alert UX blocks normal work.
- Subscription redirects fail.
- Monthly/annual mapping diverges.
- Support volume indicates systemic confusion.

Rollback must:

- Disable blocking gates.
- Preserve subscription data.
- Preserve merchant configuration.
- Keep telemetry.
- Avoid downgrading paid merchants.
- Produce an incident report.

**Output:**

- `11-rollout-and-rollback-runbook.md`.

---

# PART XII — CODEX EXECUTION LOOP

## 26. Agentic loop

For each implementation slice, Codex must use this loop:

### 1. Observe

- Read relevant repository files.
- Read existing tests.
- Run the current behavior.
- Capture actual state.
- Re-check relevant official Shopify documentation.

### 2. Define

Write:

- Exact behavior to change.
- Files likely involved.
- Entitlement key.
- Server enforcement point.
- UI state.
- Alert state.
- Migration behavior.
- Tests.
- Stopping criteria.

### 3. Implement the smallest coherent slice

Examples:

- Subscription types and catalog.
- Active-subscription provider.
- Entitlement resolver.
- One backend gate.
- One UI locked state.
- One alert type.
- One migration classifier.

Do not combine unrelated refactors.

### 4. Test

Run:

- Focused unit tests.
- Related integration tests.
- Type checking.
- Lint.
- Build.
- Browser verification when UI changes.
- Storefront regression when publishing changes.

### 5. Inspect

Check:

- No duplicate plan logic.
- No client-only gate.
- No data loss.
- No new accessibility issue.
- No performance regression.
- No unverified Shopify assumption.
- No accidental listing claim change.

### 6. Record

Update:

- Decision docs.
- Test matrix.
- Migration report.
- Final implementation report.

### 7. Continue or stop

Continue only when the slice stopping criteria are met.

Stop and report a blocker when:

- Required billing credentials are unavailable.
- Partner Dashboard setup is required.
- Repository data contradicts the entitlement hypothesis.
- Existing merchant impact is materially larger than expected.
- A feature proposed for Growth is incomplete or broken.
- Shopify’s current API behavior differs from this plan.

Do not conceal uncertainty by inventing behavior.

---

## 27. Small implementation tasks

Codex should decompose work approximately as follows:

| Task | Scope |
|---|---|
| SUB-000 | Baseline |
| SUB-001 | Billing discovery |
| SUB-002 | Listing-material discovery |
| SUB-003 | Feature inventory |
| SUB-004 | Entitlement classification |
| SUB-005 | Competitor benchmark |
| SUB-006 | Cost floor |
| SUB-007 | Existing merchant usage |
| SUB-008 | Willingness-to-pay instrument |
| SUB-009 | Architecture ADR |
| SUB-010 | Shopify App Pricing integration design |
| SUB-011 | Entitlement resolver |
| SUB-012 | Bundle requirement detector |
| SUB-013 | Transactional active-bundle limit |
| SUB-014 | Server mutation enforcement |
| SUB-015 | Authorized storefront snapshot |
| SUB-016 | Alerts and locked UI |
| SUB-017 | Migration audit |
| SUB-018 | Legacy overrides |
| SUB-019 | Downgrade workflow |
| SUB-020 | Listing transition plan |
| SUB-021 | Growth feature bullet derivation |
| SUB-022 | Partner Dashboard runbook |
| SUB-023 | Listing consistency validation |
| SUB-024 | Analytics |
| SUB-025 | Unit tests |
| SUB-026 | Integration tests |
| SUB-027 | Storefront regression |
| SUB-028 | Chrome end-to-end tests |
| SUB-029 | Accessibility |
| SUB-030 | Security |
| SUB-031 | Rollout controls |
| SUB-032 | Staged rollout |
| SUB-033 | Final report |

Each task should be reviewable and independently testable.

---

# PART XIII — ACCEPTANCE CRITERIA BY DOMAIN

## 28. Product acceptance criteria

- Free is permanently usable.
- Free supports one real published bundle.
- Free has no revenue or order cap.
- Growth has one feature set.
- Monthly and annual differ only in billing interval and price.
- Growth is positioned as advanced merchandising and scale.
- No unfinished feature is sold.
- No core obligation is gated.
- Existing merchants have an explicit migration path.
- No configuration is deleted on downgrade.

## 29. Billing acceptance criteria

- Shopify is the billing authority.
- Redirect values are verified.
- Plan handles are configuration-driven.
- Monthly and annual both resolve to Growth.
- Free resolves to Free.
- Pending, frozen, cancelled, and expired states are handled.
- Legacy billing is dual-read if required.
- Caching has a bounded failure policy.
- Development-store billing is tested without production charges.
- Partner Dashboard steps are documented.
- Pricing appears in the App Store pricing section.

## 30. Gating acceptance criteria

- Every gate is server-enforced.
- Every gate has a stable feature key.
- Every blocked mutation returns a typed error.
- UI checks use the same resolved entitlement payload.
- Free limits are concurrency-safe.
- Growth-required drafts cannot become live on Free.
- Published storefront configuration is authorized.
- Direct API calls cannot bypass restrictions.
- No plan logic depends on display name or price.

## 31. Alert acceptance criteria

- Locked discovery is informational, not red.
- Limit warnings appear before destructive failure where possible.
- Failed save/publish shows an inline error.
- Billing failures use actionable error banners.
- Success uses a toast or success banner.
- Alerts identify what happened and what to do.
- No manipulative claims.
- No color-only communication.
- Keyboard and screen-reader behavior pass.

## 32. Pricing acceptance criteria

- Final price is backed by a decision record.
- Annual savings are mathematically correct.
- Annual discount is approximately 15–20% unless evidence supports otherwise.
- Default hypothesis is $19.99/$199.
- No trial is the default.
- Monthly and annual feature lists match.
- Prices are not present in listing images.
- Pricing is accurate in every designated surface.
- Existing-subscriber price policy is documented.

## 33. Migration acceptance criteria

- Every current shop is classified.
- Affected merchants are identified before enforcement.
- Legacy access is explicit and auditable.
- Grace expiry is tested.
- Downgrade preserves data.
- Extra active bundles are paused only through approved policy.
- The merchant can remediate incompatible bundles.
- Rollback can restore non-blocking behavior.

## 34. App Store acceptance criteria

- Free and Growth pricing content is configured.
- Growth shows monthly and annual choices.
- No semi-annual option exists.
- Every published locale has a plan description.
- Growth bullets match implemented entitlements.
- Listing claims do not contradict Free/Growth boundaries.
- Screenshots do not contain pricing.
- No unsubstantiated revenue guarantees are introduced.
- Online Store requirements remain accurate.

---

# PART XIV — FINAL CODEX REPORT

## 35. Required final response from Codex

At completion, Codex must produce `12-final-implementation-report.md` containing:

### Summary

- What was implemented.
- Final Free entitlements.
- Final Growth entitlements.
- Final monthly price.
- Final annual price.
- Trial.
- Migration policy.
- Rollout status.

### Repository changes

| Area | Files | Purpose |
|---|---|---|

### Billing architecture

- Provider.
- Source of truth.
- Cache policy.
- Reconciliation.
- Legacy handling.
- Failure policy.

### Gating architecture

- Entitlement catalog.
- Server enforcement.
- UI behavior.
- Storefront authorization.
- Draft/publish policy.

### Existing merchant impact

- Total shops analyzed.
- Migration classes.
- Overrides.
- Incompatible active bundles.
- Unresolved shops.

### App Store work

- Pricing-content changes required.
- Partner Dashboard steps completed or pending.
- Locales.
- Plan handles.
- Listing consistency findings.

### Tests

- Commands run.
- Results.
- Browser scenarios.
- Accessibility results.
- Security results.
- Remaining known failures.

### Rollout

- Current feature-flag state.
- Next rollout stage.
- Monitoring dashboard.
- Rollback procedure.

### Open decisions

Only include decisions that genuinely cannot be inferred from repository evidence or approved defaults.

---

# PART XV — REFERENCE CHECKLIST FOR CODEX

Before implementation, verify the current official Shopify documentation for:

- Shopify App Pricing overview.
- Setting up recurring subscription charges.
- Monthly with annual subscription options.
- Active Subscription API.
- Partner API authentication and permissions.
- Migration from the legacy Billing API.
- Subscription redirect parameters.
- Development-store subscription testing.
- App Store pricing-content setup.
- App Store requirements for accurate pricing.
- App Store listing feature limits and localization.
- Shopify app alert patterns.
- Shopify app marketing and locked premium-feature guidance.
- Built for Shopify UX and accessibility requirements.

Record the documentation check in:

```text
docs/subscriptions/shopify-platform-research-log.md
```

Suggested columns:

| Date checked | Documentation title | API version | Constraint | Implementation consequence |
|---|---|---|---|---|

---

# Final instruction to Codex

Do not begin by adding `isPro` conditionals.

Begin by discovering the repository, documenting the current billing system, inventorying every merchant-facing feature, and measuring existing merchant impact. Then establish the entitlement catalog and subscription source of truth. Implement server enforcement before relying on UI locks. Use Shopify-compatible informational, warning, error, and success alerts according to the actual merchant state. Preserve all merchant data. Use Shopify App Pricing for Free plus one Growth plan with monthly and annual choices unless repository evidence requires a documented migration path.

The default launch hypothesis is:

```text
Free: $0
Growth monthly: $19.99 USD
Growth annual: $199 USD
Trial: none
Free active bundles: 1
Free FPB steps: 2
Revenue/order caps: none
```

Treat these as configuration-driven defaults. Validate them through the pricing decision record before production publication. The project is not complete until billing, entitlements, alerts, migration, App Store pricing content, tests, staged rollout, and rollback are all addressed as one coherent system.
