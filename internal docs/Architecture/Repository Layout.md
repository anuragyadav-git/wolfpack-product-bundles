---
schema_version: 1
id: repository-layout
title: Repository Layout
type: architecture
status: authoritative
summary: Defines the npm workspace boundary between the Shopify application, static website, and repository-level documentation and delivery tooling.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - architecture
systems:
  - npm-workspaces
source_paths:
  - package.json
  - apps/OnlyBundles-app/
  - apps/OnlyBundles-website/
related_docs:
  - Architecture/System Overview.md
  - Operations/Development.md
  - Operations/Deployment.md
  - Operations/Build Process.md
  - Architecture/Public Website.md
tags:
  - monorepo
keywords:
  - repository-layout
---

# Repository Layout

Only Bundles is an npm-workspaces monorepo with one root lockfile and no separate task orchestrator.

```text
/
├── apps/
│   ├── OnlyBundles-app/       # Shopify Remix app, Prisma, extensions, tests, and app tooling
│   └── OnlyBundles-website/   # Pre-rendered Astro site deployed as Worker static assets
├── docs/                      # Project documentation and implementation records
├── internal docs/             # Authoritative architecture and operations vault
├── marketing/                 # Listing and marketing artifacts
├── graphify-out/              # Generated repository knowledge graph
├── package.json               # Workspace declarations and compatibility command wrappers
├── package-lock.json          # Only npm lockfile
├── prisma.config.ts           # Root Prisma schema discovery for Render and operator commands
└── Dockerfile                 # Render image built from the repository root
```

The exact workspace declaration is:

```json
[
  "apps/OnlyBundles-app",
  "apps/OnlyBundles-app/extensions/*",
  "apps/OnlyBundles-website"
]
```

Root commands preserve the established Shopify operator interface. For example, `npm run build`, `npm test`, `npm run dev:sit`, `npm run deploy:prod`, and `npm run webhook-worker` delegate to `wolfpack-product-bundles`. Explicit `app:*` and `website:*` commands are available when the target should be stated directly.

`npx prisma generate` from the repository root resolves `apps/OnlyBundles-app/prisma/schema.prisma` through `prisma.config.ts`. Because Prisma config disables its implicit dotenv lookup, the root config uses Node 22's built-in env-file loader when `apps/OnlyBundles-app/.env` exists; process variables supplied by Render remain authoritative. App-local Prisma scripts use the same schema explicitly. Shopify TOML values, routes, webhooks, persistence contracts, and storefront assets are unchanged by the directory boundary.

The website is fully static. `apps/OnlyBundles-website/wrangler.jsonc` has no Worker entry point, bindings, routes, secrets, environments, adapter, Node compatibility flag, or visitor analytics integration. Unknown routes use the generated `404.html`. Public marketing, feature, Help, editorial, tutorial, Privacy, and Terms routes are indexable on the `workers.dev` hostname. The approved legal pages are part of the sitemap, and no analytics environment variable is required for production deployment.
