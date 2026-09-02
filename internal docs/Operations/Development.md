---
schema_version: 1
id: development
title: Development
type: operations
status: authoritative
summary: Defines root workspace commands for local Shopify and static website development.
last_audited: 2026-09-02
owners:
  - engineering
domains:
  - operations
systems:
  - development
source_paths:
  - package.json
  - apps/OnlyBundles-app/package.json
  - apps/OnlyBundles-website/package.json
related_docs:
  - Architecture/Repository Layout.md
  - Operations/Build Process.md
tags:
  - development
keywords:
  - SIT
  - npm-workspaces
---

# Development

## Install

Install all workspaces from the repository root. The root `package-lock.json` is the only lockfile.

```bash
npm ci
```

## SIT Dev Stack

Use the preserved root command for normal Shopify development:

```bash
npm run dev:sit
```

This delegates to `apps/OnlyBundles-app` and runs `shopify app dev --config shopify.app.wolfpack-product-bundles-sit.toml` from that workspace. Configure Save, Sync Product, Sync Bundle, and Preview publish storefront data synchronously through the app server. They do not require a local Inngest storefront-sync queue, dynamic SDK URL discovery, or `INNGEST_DEV=1`. Do not use bare `npm run dev` for SIT work; it does not pin the SIT Shopify app config.

The static website can be developed independently with:

```bash
npm run website:dev
```

Use `npm run verify:all` for aggregate app and website verification. The website remains pre-rendered and must not gain a Cloudflare adapter, Worker entry point, bindings, or `nodejs_compat` unless its architecture intentionally changes to on-demand rendering.
