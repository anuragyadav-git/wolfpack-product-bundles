---
schema_version: 1
id: repository-subscription-inventory
title: Repository Subscription Inventory
type: inventory
status: active
summary: Audited inventory of Only Bundles billing, entitlement, merchant UI, storefront, analytics, and deployment surfaces.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
systems:
  - billing
  - admin
  - storefront
source_paths:
  - app/services/subscriptions/
  - prisma/schema.prisma
  - app/routes/app/app.billing.tsx
related_docs:
  - internal docs/Subscriptions/01-current-billing-state.md
  - internal docs/Subscriptions/02-feature-entitlement-audit.md
tags:
  - inventory
  - billing
keywords:
  - Shopify App Pricing
  - entitlement
---

# Repository Subscription Inventory

## Repository boundary

- The checkout contained unrelated Settings Design, branding, Graphify, test, and asset changes before subscription implementation. They are preserved and are not subscription cleanup targets.
- Runtime: Remix on Node, Prisma/PostgreSQL, Shopify Admin and Storefront APIs, theme app extension, Cart Transform Function, checkout extension, and Render-hosted application services.

## Managed pricing surface

- `prisma/schema.prisma` stores managed pricing verification snapshots and plan-restriction markers.
- `app/services/subscriptions/shopify-app-pricing.server.ts` verifies the Partner API `activeSubscription` response.
- `app/services/subscriptions/subscription-entitlement-service.server.ts` owns cache freshness, force refresh, and persistence.
- `app/lib/subscriptions/entitlements.ts` owns stable plan codes, capabilities, limits, and typed failures.
- `/app/pricing`, `/app/billing`, and `/app/billing/return` are the only app-plan purchase and verification routes.
- Billing API create, confirm, status, cancel, callback, grant-plan, subscription webhook, and compatibility re-export surfaces were removed.

## Current enforcement and storefront behavior

- Bundle creation produces Draft bundles and does not need a plan gate because Drafts remain unlimited.
- Draft creation remains unlimited. FPB/PPB publication and configuration mutation use server-owned entitlement assertions.
- Public bundle statuses are `active` and `unlisted`; `draft` and `archived` are private.
- PPB has Shopify-hosted configuration/policy snapshots; FPB prefers a Liquid-metafield cache and has an app-proxy fallback. Billing verification must not enter either storefront hot path.
- Draft preview authorization already uses a signed, shop/bundle-bound, 15-minute token.

## Current merchant-facing feature groups

- FPB and PPB creation/configuration, product and category selection, quantity rules, pricing/discounts, progress, free gifts, add-ons, upsells, default products, customer selling plans, templates, Design, translations, controls/integrations, attribution analytics, widget placement, preview, and public sync.
- Customer selling plans are owned by `Bundle.bundleSubscriptionConfig` and the shared `BundleSubscriptionsSection`; they are not app-plan billing and remain Free.
- Settings Design persists global styles and general settings for FPB and PPB. Advanced fields are Growth-gated while basic brand controls remain Free.

## Tests and delivery

- Jest projects cover unit, integration, and e2e tests through `tests/test-runner.ts` and `jest.config.js`.
- TDD sessions require a matching `test-spec/*.spec.md`.
- Widget, SDK, and CSS source changes require their repository build/minification commands.
- Code changes require changed-file ESLint, typecheck, focused/full tests as appropriate, `git diff --check`, and `npm run graphify:rebuild`.
- Shopify deployment and the local development server are manual user-owned actions.

## External configuration still required

- The live Partner Dashboard inventory and English pricing copy are recorded in the App Pricing runbook and operator handoff. Draft plans must be created with the code-owned handles `free` and `growth`.
