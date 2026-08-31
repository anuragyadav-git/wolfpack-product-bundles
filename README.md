---
schema_version: 1
id: only-bundles-readme
title: Only Bundles
type: repository-readme
status: active
summary: Development and architecture guide for the Only Bundles Shopify application.
last_audited: 2026-08-31
owners:
  - engineering
domains:
  - application
systems:
  - repository
source_paths:
  - app/
  - extensions/
related_docs:
  - internal docs/index.md
tags:
  - shopify-app
  - bundles
keywords:
  - Only Bundles
  - product bundles
---

# Only Bundles

Only Bundles is the public name of the Shopify application formerly presented
as Wolfpack Product Bundles. It creates full-page build-a-box and product-page
mix-and-match experiences from products already in a merchant's catalog.

- Shopify listing: https://apps.shopify.com/wolfpack-product-bundles-1
- Company product page: https://topnotchhsolutions.com/products/wolfpack
- Developer: Top Notchh Solutions

## Current public product

The public listing, checked on August 31, 2026, describes:

- Full-page and product-page bundle experiences.
- Steps, categories, quantity rules, and live summaries.
- Tiered discounts, gifts, add-ons, upsells, and selling plans.
- Eight responsive templates: four full-page and four product-page layouts.
- Storefront preview and design customization.
- Engagement, order, attributed revenue, and conversion reporting.

Public listing pricing on the same date:

- Free: one public bundle and up to two enabled steps or categories.
- Growth: $19.99/month or $199/year, with a 14-day trial.
- Growth includes unlimited public bundles and steps, all templates, advanced
  design and analytics, and priority support.

The billing constants in `app/constants/plans.ts` and
`app/constants/pricing-data.ts` predate the current listing. Confirm the active
Partner Dashboard billing configuration before changing enforcement or
subscription amounts in code.

## Compatibility identity

The public rebrand does not rename technical contracts used by installed
shops. Keep these stable unless a separately planned migration covers every
producer and consumer:

- Shopify app handle and deployed callback URLs.
- Package and environment names.
- Cart attributes such as `_wolfpackProductBundle:OfferId`.
- Metafield namespaces, storage keys, SDK globals, and pixel identifiers.
- SIT and production configuration filenames.

Changing those values as a text replacement can break carts, checkout
functions, existing bundle data, app authentication, and storefront embeds.

## Architecture

- Remix application for the embedded Shopify admin.
- Prisma with PostgreSQL for app data.
- Shopify Theme App Extensions and storefront widget assets.
- Rust Cart Transform function.
- Shopify Discount Function and Checkout UI extension.
- App proxy, metafield synchronization, web pixel attribution, and webhooks.
- Full-page and product-page storefront runtimes built from `app/assets`.

## Local development

Requirements:

- Node.js 22 through 25.
- npm.
- Shopify CLI and a development store.
- PostgreSQL.
- Rust stable with `wasm32-unknown-unknown` for production function builds.

Install and prepare the repository:

```bash
npm install
npm run generate:prisma
npm run migrate:dev
```

Run the Shopify development environment:

```bash
npm run dev
```

Useful verification commands:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Build individual storefront surfaces:

```bash
npm run build:widgets:full-page
npm run build:widgets:product-page
npm run build:sdk
```

## Deployment

Production deployment builds the Rust Cart Transform function, deploys the
Shopify app configuration, and runs the general synchronization task:

```bash
npm run deploy:prod
```

Review `shopify.app.toml`, database migrations, webhook configuration, and
Partner Dashboard billing before deploying. Do not rename legacy handles,
URLs, or cart contracts as part of a display-name change.

## Repository map

- `app/routes`: embedded admin routes and API endpoints.
- `app/assets`: storefront runtimes and shared bundle behavior.
- `app/services`: Shopify, billing, sync, analytics, and bundle services.
- `app/i18n/locales`: merchant-facing translations.
- `extensions`: Shopify Functions and checkout/theme extensions.
- `prisma`: database schema and migrations.
- `scripts`: build, deployment, synchronization, and audit utilities.
- `tests`: unit, integration, and end-to-end test harnesses.

## Rebrand rule

Merchant-visible copy uses **Only Bundles**. Legacy `wolfpack` identifiers are
technical compatibility values, not public branding.
