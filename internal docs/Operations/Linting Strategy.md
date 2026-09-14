---
schema_version: 1
id: linting-strategy
title: Linting Strategy
type: operations
status: active
summary: Defines fast local linting, repository-wide CI gates, and incremental debt reduction for each source surface.
last_audited: 2026-09-07
owners:
  - engineering
domains:
  - operations
systems:
  - eslint
  - github-actions
  - shopify-cli
source_paths:
  - apps/OnlyBundles-app/.eslintrc.cjs
  - apps/OnlyBundles-app/scripts/pre-commit-critical.mjs
  - apps/OnlyBundles-app/scripts/pre-commit-critical-core.cjs
  - apps/OnlyBundles-app/package.json
  - apps/OnlyBundles-website/package.json
  - .github/workflows/
related_docs:
  - internal docs/index.md
  - internal docs/Operations/Build Process.md
tags:
  - linting
  - quality-gates
keywords:
  - eslint
  - warning ratchet
  - staged files
---

# Linting Strategy

## Outcome

Prevent new correctness, security, localization, and source-validity defects
without turning inherited warning debt into an incentive to skip verification.
Linting must stay fast during normal development, deterministic in CI, and
appropriate to the source format being checked.

This is a multi-lane strategy. ESLint remains the JavaScript and TypeScript
owner; Shopify CLI, Astro, Prisma, Cargo, and the existing asset builders own
their native formats. Do not force CSS, Markdown, Liquid, Prisma, or Rust
through ESLint.

## Current Baseline

The application already has a strong staged-file-aware pre-commit hook. It
checks staged diff integrity, ESLint errors, raw JavaScript syntax, banned UI
styling tests, related Jest coverage, generated storefront assets, CSS size,
and Graphify freshness.

The Git hook starts at the repository root, but app Jest checks must execute
with `apps/OnlyBundles-app` as their working directory and receive app-relative
paths. This matches the canonical workspace test commands and keeps legitimate
fixture paths deterministic. Do not make individual tests guess whether Jest
was launched from the monorepo root or the app workspace.

The remaining gaps are:

- repository-wide lint is not a pull-request status check; the current GitHub
  workflows enforce branch direction only;
- `app/assets/**` is ignored by ESLint even though the pre-commit planner sends
  those paths to ESLint, so raw storefront TypeScript can receive only an
  ignored-file warning before its build;
- the website, Rust Functions, Prisma schema, Shopify configuration, and Liquid
  extensions need explicit native validation lanes;
- warning debt is too large for a big-bang `--max-warnings 0` cutover; a dirty
  working-tree observation on 2026-09-07 reported 8,505 warnings, led by the
  type-aware `no-unsafe-*` rules. Establish the authoritative baseline from a
  clean target branch before automating a warning ratchet;
- the Remix ESLint preset is deprecated ahead of React Router 7, but changing
  lint architecture during feature work would create unnecessary migration
  risk.

## Rules of Engagement

1. Every changed lintable file must have zero ESLint errors before commit.
2. New JavaScript and TypeScript files should have zero warnings. Existing
   files may retain pre-existing warnings, but a change must not knowingly add
   warning debt.
3. A rule disable must be the narrowest possible line-level disable and include
   a reason. File-wide disables are reserved for generated files or a reviewed
   framework constraint.
4. Generated assets are validated by their producer and are not hand-linted or
   hand-edited.
5. Feature pull requests fix lint findings caused by their changes. Broad debt
   cleanup is a separate, owner-approved slice so merchant-facing behavior is
   not changed incidentally.
6. Lint is one gate, not proof of runtime correctness. Tests, typecheck, builds,
   Shopify validation, and browser QA remain separate checks.

## Validation Lanes

| Surface | Fast local or pre-commit gate | Pull-request gate | Policy |
|---|---|---|---|
| Admin/server TypeScript and tests | Scoped type-aware ESLint on changed files | Full application ESLint plus typecheck | Zero errors; new files zero warnings |
| Storefront source under `app/storefront/` and `app/assets/` | Dedicated source ESLint lane, raw JS `node --check`, and affected widget build | Full storefront lint and widget build | Do not lint generated extension bundles |
| Admin and storefront CSS | Affected build or CSS minifier and Shopify 100,000 B asset limit | Production build and CSS minification | Add Stylelint only after a recurring defect class justifies it |
| Astro website | `astro check` for touched work | Existing `website:verify` workflow | Astro owns `.astro` and website TypeScript validation |
| Shopify TOML and extensions | Shopify CLI configuration validation | `shopify app config validate --json` for PROD and SIT configs, then app build | Shopify schemas are authoritative |
| Prisma schema | `prisma validate` after schema changes | `prisma validate` and client generation | Do not use ESLint for Prisma |
| Rust Functions | `cargo fmt --check` and focused tests | `cargo fmt --check`, `cargo clippy`, tests, and Shopify Function build | Introduce Clippy as a scoped baseline; do not hide existing failures |
| Liquid extension files | Affected Shopify app build | Shopify app build | Use Shopify-native validation; do not invent a custom Liquid parser |
| Markdown and repository metadata | `git diff --check` and frontmatter/link validation | Documentation validation | Do not pass Markdown to the TypeScript ESLint parser |

## Command Contract

During development, use the smallest relevant command:

```bash
npx eslint --max-warnings 9999 <changed-ts-or-js-files>
node --check <changed-raw-js-file>
npm run build:widgets
npm run minify:assets -- css
npm run website:check
```

Before a pull request is eligible to merge, CI should run these independent
jobs so failures identify their owner:

```bash
npm run lint -- --max-warnings 9999
npm run typecheck
npm run build-dev
npm run website:verify
shopify app config validate --json
shopify app config validate --config wolfpack-product-bundles-sit --json
```

Prisma, Rust, storefront asset, and affected test commands should run only when
their paths change. Shopify deploy is never part of linting.

## Warning-Debt Policy

Warnings must be reduced by ratchet, not by a repository-wide cleanup mixed
into delivery work:

1. Capture counts by rule and directory from a clean target branch.
2. Fail CI on any increase to that checked-in baseline, while always failing on
   errors.
3. Require zero warnings for newly added files.
4. Prioritize debt in this order: unsafe calls and assignments at Shopify/API
   boundaries, ignored storefront source, security warnings, unused code, then
   stylistic preferences.
5. Lower the stored baseline only in a dedicated cleanup change after the full
   verification lane passes. Never raise it merely to make CI green.

Do not make `--max-warnings 9999` the permanent definition of quality. It is a
temporary compatibility setting while the ratchet is introduced.

## Rollout

### Phase 1 — Make Existing Enforcement Visible

- Add a required CI job for full application ESLint with zero errors.
- Add the existing website verification as a separate required job.
- Add Shopify configuration validation for both PROD and SIT files.
- Record the clean-branch warning baseline; do not use the current dirty
  checkout as the baseline.

### Phase 2 — Close Source Coverage Gaps

- Add a dedicated ESLint override or config for `app/assets/**` instead of
  ignoring it. Start with syntax, correctness, and security rules that can pass
  without a mass rewrite.
- Wire that command into the current staged-file planner and CI.
- Add Prisma and Rust path-aware native checks.

### Phase 3 — Ratchet Warnings Down

- Enforce zero warnings for new files.
- Prevent rule-and-directory warning counts from increasing.
- Clean the highest-risk `no-unsafe-*` findings at external-data boundaries in
  small, tested slices.

### Phase 4 — Modernize ESLint Deliberately

- Replace the deprecated Remix preset and evaluate ESLint flat config only in a
  dedicated tooling change.
- Pin compatible ESLint, TypeScript ESLint, import resolver, Jest, security,
  Prisma, Unicorn, and i18n plugin versions together.
- Prove equivalent route, test, localization, and security coverage before
  removing the current config.

## Merge Acceptance

A change is lint-complete when:

- changed lintable files have zero ESLint errors;
- no new warnings are knowingly introduced, and new files have zero warnings;
- every changed non-ESLint surface passes its native lane;
- generated assets match their source when storefront source changes;
- the required CI lanes pass from a clean checkout;
- lint suppressions are narrow and justified;
- failures outside the change are reported separately rather than silently
  waived or fixed through unrelated edits.
