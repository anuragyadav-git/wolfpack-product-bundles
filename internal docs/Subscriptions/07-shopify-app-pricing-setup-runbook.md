---
schema_version: 1
id: shopify-app-pricing-setup-runbook
title: Shopify App Pricing Setup Runbook
type: runbook
status: sit-configured-prod-pending
summary: Records the completed SIT App Pricing setup and the equivalent production setup still required for Free and Growth.
last_audited: 2026-08-29
owners:
  - product
  - engineering
domains:
  - subscriptions
systems:
  - shopify-partner-dashboard
  - shopify-partner-api
source_paths:
  - app/services/subscriptions/shopify-app-pricing.server.ts
  - app/services/subscriptions/app-pricing-navigation.server.ts
related_docs:
  - internal docs/Subscriptions/05-pricing-decision-record.md
  - internal docs/Subscriptions/shopify-platform-research-log.md
tags:
  - runbook
  - managed-pricing
keywords:
  - Partner Dashboard
  - plan handle
---

# Shopify App Pricing Setup Runbook

## Approved fields to complete

| Field | Value/status |
|---|---|
| Free plan display name | Free |
| Free top features | One public bundle; two steps; FPB and PPB; all merchandising; brand colors and typography; 30-day summary |
| Growth display name | Growth |
| Growth monthly price | `$19.99 USD`; approved 2026-08-28 |
| Growth annual price | `$199 USD`; approved 2026-08-28 |
| Growth trial | 14 days |
| Growth top features | Unlimited public bundles and steps; all templates; advanced Design; advanced analytics; priority support |
| Welcome link | Embedded `/app/billing/return`; exact Dashboard field pending |
| Development-store treatment | SIT is a draft public app in the same Partner organization and can use Partner API plus no-charge development-store plan testing |
| Plan handles | Define as `free` and `growth` in Partner Dashboard |
| Published locales | English only; primary |
| Cutover | Single release; immediate enforcement |
| Reviewer | Aditya Awasthi |

SIT now has the Free and Growth plans configured with handles `free` and
`growth`, the approved feature copy, monthly/yearly billing, and the 14-day
trial. SIT remains an unpublished internal development app. Repeat the same
configuration for PROD only when production cutover is approved.

Create one Growth plan using Shopify's **monthly with yearly option** billing model. Set its monthly charge to `$19.99`, yearly charge to `$199`, and free trial duration to `14`. Shopify then owns the trial, billing-period changes, and proration. Do not create a local trial ledger or two separate Growth plans.

Shopify tracks consumed trial days across a 180-day period. This prevents reinstall-based trial reuse. Because monthly and annual are billing options on the same Growth plan, switching periods does not create a second app-owned trial.

## Server configuration

Configure only the Partner API secret in the server environment:

```text
SHOPIFY_PARTNER_API_ACCESS_TOKEN
```

The application queries Shopify Admin `app { id handle }` using the existing app session. The GID feeds `activeSubscription(appId, shopId)` and the handle builds the shop-specific hosted pricing destination. The return route treats `plan_handle` only as a hint and force-verifies the active subscription before granting Growth.

Partner organization `4162406`, Partner API version `2026-07`, and stable plan handles `free` and `growth` are application constants. Cache duration and the 24-hour paid outage grace use code-owned defaults. None require deployment-specific environment overrides. Subscription enforcement has no environment flag and begins when the released code runs.

## Verified identifiers and where they come from

| Value | PROD | SIT | Source |
|---|---|---|---|
| Partner organization ID | `4162406` | `4162406` | Numeric segment in the Partner Dashboard organization URL: `/4162406/` |
| Partner app ID | `261615583233` | `299492081665` | Numeric segment in each Partner Dashboard app URL |
| Partner API App GID | `gid://shopify/App/261615583233` | `gid://shopify/App/299492081665` | Shopify GID form of the Partner app ID; verify with the first Partner API query |
| App handle | `wolfpack-product-bundles` | `wolfpack-product-bundles-sit` | `handle` in the matching `shopify.app*.toml` |

Create the Partner API client under Partner Dashboard **Settings → Partner API clients** with **Manage apps** permission, then store its token only in the corresponding server environment. The dev tunnel is only the SIT transport; Partner API eligibility comes from SIT being a public app. The live Dashboard currently labels SIT **Public app / Draft**, so it is eligible even though it is unpublished.

When creating the plans, explicitly set the Free plan handle to `free` and the Growth plan handle to `growth`. Shopify asks developers to define stable plan handles. During SIT testing, confirm that `activeSubscription.items[].handle` returns those values; there is nothing to copy into environment files.

## Partner Dashboard procedure

1. Verify locales, feature bullets, and cutover date against the approved pricing record.
2. Create a permanent Free plan and one Growth plan using monthly with yearly option and a 14-day trial.
3. Set the plan handles to exactly `free` and `growth`.
4. Set the embedded welcome/return link to `/app/billing/return` using the Dashboard-supported application URL.
5. Confirm Shopify Admin returns the current app GID and handle through `app { id handle }`.
6. Test Free, monthly, annual, interval switch, downgrade, cancellation, frozen state, trial state, and return verification on SIT development stores.
7. For PROD only, publish the approved pricing/listing content before releasing the subscription cutover. SIT does not need publication.
8. At cutover, trigger subscription reconciliation so existing Free shops receive the policy immediately; retain the hourly schedule for retries.

Production deployment remains manual. Never run `shopify app deploy` directly;
use the repository deployment script only after approval.
