---
schema_version: 1
id: knip-candidate-inventory
title: Knip Candidate Inventory
type: operations
status: active
summary: Records the clean monorepo-aware Knip baseline and the genuine dead code removed to reach it.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - operations
systems:
  - knip
  - shopify-extensions
source_paths:
  - knip.jsonc
  - package.json
  - apps/OnlyBundles-app/package.json
related_docs:
  - Operations/Knip Prune Guardrails.md
tags:
  - maintenance
  - dead-code
keywords:
  - knip
  - unused exports
---

# Knip Candidate Inventory

The deployable Shopify app has a clean Knip baseline as of 2026-09-09. Run the
canonical root command for the root tooling package, app, and package-backed
extensions:

```bash
npm run knip
```

Run the app-local command when work is intentionally scoped to the Shopify app
and its package-backed extensions:

```bash
npm run app:knip
```

The root command intentionally excludes `apps/OnlyBundles-website`, which is a
separate deployable and outside this remediation. The app package's own
`npm run knip` resolves the same root `knip.jsonc` and selects the app plus
`apps/OnlyBundles-app/extensions/*`. This keeps invocation consistent from
either location instead of treating nested extensions as undeclared app
dependencies.

## Current Counts

- unused files: 0
- unused dependencies: 0
- unused development dependencies: 0
- unlisted dependencies: 0
- unresolved imports: 0
- unused binaries: 0
- unused exported values: 0
- unused exported types: 0
- configuration hints: 0

These are live-command results, not an ignore-list-adjusted snapshot.

## What Changed

The previous app-only invocation treated the monorepo as one package. That
caused generated deploy assets, convention-loaded roots, nested extension
dependencies, package-script binaries, and legitimate public types to appear as
hundreds of false candidates. `knip.jsonc` now models the real package graph:

- Remix route configuration, storefront build roots, the GraphQL tooling
  project, the repository hook, design-system commands, and Sidekick data are
  explicit app entrypoints.
- Checkout UI, product configuration, and Web Pixel target modules are explicit
  extension entrypoints.
- source-only `project` patterns exclude `.shopify/**` snapshots and generated
  `extensions/bundle-builder/assets/**` deploy files.
- nested dependencies are resolved from their owning workspace manifests.
- only the globally installed Shopify CLI binary is ignored; dependencies,
  files, exports, types, and configuration hints are not broadly suppressed.

Knip then identified genuine cleanup work:

- removed the unregistered Checkout UI `src/index.tsx` target stub;
- removed the uncalled `scripts/minify-assets/js-minifier.js` implementation;
- removed unnecessary export modifiers while preserving local declarations;
- declared root `knip` and `prisma`, which own the root analysis command and
  `prisma.config.ts` import; and
- removed the broken `graphql-codegen` scripts. `graphql.config.js` is an
  editor/language-tool project configuration, not a code-generation command,
  and no Codegen CLI or generated output contract existed.

## Negative Control

A disposable package containing an unreferenced `left-pad` dependency was
analyzed with the same installed Knip binary. Knip reported `Unused
dependencies (1)` and exited with status 1. This proves the zero-result baseline
does not come from a blanket dependency ignore.

## Decision Rule

Knip reports candidates, not deletion permission. Before removing a future
candidate:

1. confirm there is no source, test, package-script, build-script, Liquid, CSS
   import, Remix, or Shopify extension owner;
2. add missing entry/project ownership to `knip.jsonc` only when that owner is
   real;
3. do not add an ignore merely to make the report disappear;
4. remove genuine dead code or dependencies; and
5. run the relevant typecheck, behavior tests, builds, Knip, Graphify, lint, and
   diff checks.

Do not replace owner evidence with line-count, filename, CSS, or source-text
presence tests.
