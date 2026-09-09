---
schema_version: 1
id: knip-prune-guardrails
title: Knip Prune Guardrails
type: operations
status: active
summary: Defines the monorepo-aware Knip contract and evidence required before removing reported code or dependencies.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - operations
systems:
  - knip
source_paths:
  - knip.jsonc
  - package.json
  - apps/OnlyBundles-app/package.json
related_docs:
  - Operations/Knip Candidate Inventory.md
tags:
  - maintenance
keywords:
  - knip
---

# Knip Prune Guardrails

Use Knip as a candidate generator, then resolve every report through real package
and platform ownership. Do not preserve a noisy report indefinitely and do not
silence it with a broad ignore.

## Canonical Commands

Run the deployable Shopify app, its package-backed extensions, and their root
tooling from the repository root:

```bash
npm run knip
```

Run only the Shopify app and package-backed extensions when the task is app
scoped:

```bash
npm run app:knip
```

Running `npm run knip` inside `apps/OnlyBundles-app` also selects the app and
extension workspaces through the root configuration. Do not replace these with
an app-directory-only Knip invocation; that erases workspace ownership and
recreates false unlisted-dependency reports.

The website is a separate deployable and is intentionally outside these
commands. Its own verification owns website dependency cleanup.

## Configuration Ownership

`knip.jsonc` is the only Knip configuration owner. It must model:

- convention roots such as `app/routes.ts` and `graphql.config.js`;
- build roots passed to `esbuild` or read by manifest scripts;
- registered Shopify extension target modules;
- repository hook and design-system command entrypoints; and
- source project globs that intentionally exclude generated Shopify snapshots
  and deploy assets.

Prefer an explicit entrypoint or a narrower project boundary when a real
file-system/platform owner is missing from the graph. Do not add
`ignoreDependencies`, `ignoreFiles`, or blanket issue exclusions to clear a
finding. The sole binary exception is `shopify`: Shopify CLI is an operator
tool installed outside this repository and is invoked by manual npm workflows.

## Generated Assets

Generated copies are neither source roots nor proof that a source owner is
alive:

- `.shopify/**` is Shopify CLI output;
- `extensions/bundle-builder/assets/**` is generated/minified deploy output;
- raw widget and SDK sources are owned by the configured storefront build
  entrypoints; and
- Liquid and CSS import ownership must still be checked before deleting raw
  source assets.

Rebuild generated outputs after changing their source, according to the widget
build rules. Never include generated copies in `project` merely to suppress an
unused-file report.

## Autofix Guardrail

For Knip 5.88.1, pass multiple issue types as repeated flags:

```bash
npm run knip -- --fix --fix-type exports --fix-type types
```

Do not use `--fix-type exports,types`; this installed version treats the
comma-separated value as one unknown issue name. Review every autofix. In
particular, object-style CommonJS exports can be left with empty entries after
unused properties are removed. Typecheck and syntax/build checks must catch and
clean those artifacts before the change is accepted.

## Candidate Review

For each finding:

1. search for code and non-code consumers;
2. inspect the owning package manifest and Shopify extension TOML;
3. distinguish raw source from generated output;
4. configure a demonstrated owner or remove the genuine dead item;
5. rerun Knip with configuration hints as errors; and
6. run owner behavior tests, typecheck, applicable app/widget/extension builds,
   lint, `git diff --check`, and Graphify.

The current expected result is zero issues and zero configuration hints. A
disposable unused-dependency negative control must still exit non-zero; this
guards against a clean report achieved through accidental suppression.
