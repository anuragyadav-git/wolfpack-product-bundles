---
schema_version: 1
id: knip-deployable-prune
title: Knip Deployable Prune Test Spec
type: test-spec
status: active
summary: Defines behavior-preserving Knip analysis and removal of declarations with no deployable, test, script, or platform consumer.
last_audited: 2026-09-09
owners:
  - engineering
domains:
  - maintenance
systems:
  - remix
  - storefront-widgets
source_paths:
  - package.json
  - knip.jsonc
  - apps/OnlyBundles-app/package.json
  - apps/OnlyBundles-app/app/
  - apps/OnlyBundles-app/scripts/
  - apps/OnlyBundles-app/extensions/
related_docs:
  - internal docs/Operations/Knip Prune Guardrails.md
tags:
  - tdd
  - dead-code
keywords:
  - knip
  - unused exports
---

# Test Spec: Knip Deployable Prune

**Spec ID:** knip-deployable-prune  **Created:** 2026-09-08

## Purpose

Remove declarations that have no consumer while preserving the behavior of
their active module owners. Knip output is only candidate evidence; repository
references, framework entrypoints, generated builds, and Shopify extension
manifests determine whether removal is safe.

## Test Cases

### Active Owner Behavior

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Bundle selection and progress | Existing FPB and PPB selection fixtures | Quantities, selected entries, progress, and timeline state are unchanged | Removed selectors had no caller |
| 2 | Configure constants | Existing Admin configure route fixtures | Status, step-condition, category-condition, and discount-method controls retain their current values | Remove only unused duplicate option arrays |
| 3 | Admin locale resolution | Supported, regional, and unsupported locale inputs | Existing normalization and catalog loading behavior remains unchanged | Remove only the unused predicate export |
| 4 | App Embed preview gate | Enabled, disabled, and failed App Bridge checks | Existing preview verification behavior remains unchanged | Remove only the unused optimistic resolver |
| 5 | Loader cache | Cached, expired, and concurrent loads | Existing cache and request-coalescing behavior remains unchanged | Remove only the unused exported TTL alias |
| 6 | Pricing | Existing pricing fixtures across supported methods | Current minor-unit calculations and formatting remain unchanged | Remove unused display-only helpers |
| 7 | Variant lookup | Existing save, sync, and Shopify variant validation flows | Active lookup paths continue using their current canonical services | Remove two unused batch implementations |
| 8 | Legacy theme asset with no owner | Asset has no Liquid, build, or runtime consumer | Remove it from the extension package and minifier registry | A deploy directory is not ownership evidence |
| 9 | Monorepo invocation | Run `npm run knip` from the repository root or app workspace | The same root configuration analyzes root tooling, the deployable app, and all package-backed Shopify extensions while excluding the separate website deployable | Nested extension dependencies are resolved by their owning workspace manifests |
| 10 | Generated Shopify artifacts | Knip constructs the app project graph | `.shopify/**` snapshots and generated `extensions/bundle-builder/assets/**` files are outside the source project | Generated copies do not become false unused-file or export reports |
| 11 | Registered and build entrypoints | Analyze Remix route config, storefront build roots, Shopify extension target modules, repository hooks, and design-system manifest scripts | Each entrypoint is reachable from explicit Knip configuration | Convention and file-system ownership is modeled instead of documented as noise |
| 12 | Genuine issue | Add an otherwise unreferenced package to a temporary fixture workspace | Knip reports the unused dependency and exits non-zero | Configuration must not suppress real dependency findings |

## Acceptance Criteria

- [x] Every removed declaration has zero consumer references outside its definition.
- [x] No framework, build, generated-asset, CSS-import, or Shopify extension entrypoint is removed from Knip output alone.
- [x] Focused owner tests and the full Jest suite pass.
- [x] TypeScript, modified-file ESLint, widget builds, Knip, Graphify, and diff checks complete.
- [x] The minifier target registry has no in-place source/target entry or unowned legacy discount-bar asset.
- [x] Root and app-workspace Knip commands use one monorepo-aware configuration.
- [x] Generated Shopify artifacts are outside Knip's source project boundary.
- [x] All registered or file-system-owned entrypoints are modeled explicitly.
- [x] Knip exits zero for the current classified source tree and non-zero for a genuine unused-dependency fixture.
