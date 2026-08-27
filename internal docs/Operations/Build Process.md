---
schema_version: 1
id: build-process
title: Build Process
type: operations
status: authoritative
summary: Build, minification, lint, and pre-commit requirements for deployable application and storefront assets.
last_audited: 2026-08-24
owners:
  - engineering
domains:
  - operations
systems:
  - asset-pipeline
source_paths:
  - scripts/build-storefront.mjs
  - scripts/minify-assets.js
  - scripts/rebuild-graphify.mjs
  - scripts/rebuild-graphify-core.cjs
  - .graphifyignore
  - .githooks/pre-commit
  - .githooks/post-commit
  - .githooks/post-checkout
  - .gitattributes
related_docs:
  - internal docs/index.md
tags:
  - build
  - storefront-assets
keywords:
  - widget bundles
  - css minification
---

# Build Process

## Widget Bundles

Source files use ES modules. Must be bundled to IIFEs for Shopify extension use.

```bash
npm run build:widgets              # all widgets
npm run build:widgets:full-page    # FPB only
npm run build:widgets:product-page # PDP only
```

### Source → Output

| Source | Output |
|---|---|
| `app/storefront/full-page.ts` | `extensions/bundle-builder/assets/bundle-widget-full-page-bundled.js` |
| `app/storefront/product-page.ts` | `extensions/bundle-builder/assets/bundle-widget-product-page-bundled.js` |
| `app/storefront/sdk.ts` | `extensions/bundle-builder/assets/wolfpack-bundles-sdk.js` |
| `app/storefront/app-embed.ts` | `extensions/bundle-builder/assets/bundle-app-embed.js` |

**Both source AND bundled files must be committed.**

`scripts/build-storefront.mjs` is the only JavaScript asset producer. esbuild follows ESM imports from each entry and emits minified IIFEs; `scripts/minify-assets.js` owns CSS only. Widget controllers and method modules import shared primitives directly from `app/assets/widgets/shared/`; do not introduce compatibility barrels or rely on browser globals to satisfy module dependencies. Do not add manual module arrays, import stripping, source concatenation, or a second JS minification pass.

Keep split source modules semantically named by responsibility. Mechanical split names such as `chunk-01.js` or `part-01.css` are not acceptable long-term source structure.

## Cart Transform WASM

```bash
cd extensions/bundle-cart-transform-ts && npm run build
```
`dist/` is gitignored — WASM output is NOT committed.

## CSS Size Limit

Shopify enforces **100,000 B** on app block CSS assets.

```bash
wc -c extensions/bundle-builder/assets/*.css
```

Do not fix an oversized file by making source CSS unreadable. Reduce the base asset by deleting unused/conflicting selectors and moving template-specific CSS into separately generated extension assets. Current split assets:

| Base asset | Template assets |
|---|---|
| `bundle-widget-full-page.css` | `bundle-widget-full-page-standard.css`, `bundle-widget-full-page-classic.css`, `bundle-widget-full-page-compact.css`, `bundle-widget-full-page-horizontal.css` |
| `bundle-widget.css` | `bundle-widget-product-page-cascade.css`, `bundle-widget-product-page-cognive.css`, `bundle-widget-product-page-modal.css` |

`scripts/minify-assets.js` validates every generated CSS asset against Shopify's limit.

### Selector minification gotcha

Do not write a descendant selector as `.parent :is(.child-a, .child-b)` in storefront source CSS. The current minifier can remove the descendant combinator and emit `.parent:is(...)`, which changes the selector to target one element matching both sides. Use explicit descendant selectors, or a combinator such as `.parent > :is(...)` when direct-child semantics are correct. Compound selectors such as `.parent:is(.variant-a, .variant-b)` are safe when they intentionally target the same element.

## Linting

Before every commit, lint modified files:
```bash
npx eslint --max-warnings 9999 <file1> <file2>
```

`--max-warnings 9999` prevents pre-existing warnings (~6500 project-wide) from blocking the check. Fix new **errors** you introduced; leave pre-existing warnings alone.

## Pre-Commit Hook

Tracked hooks live in `.githooks/`. Install them with:

```bash
npm run hooks:install
```

`npm install` also runs a warning-only `prepare` installer unless `CI=true` or
`WPB_SKIP_HOOK_INSTALL=1` is set.

The pre-commit hook is staged-file aware. It blocks commits for critical
breakage: staged diff whitespace errors, partially staged checked source files,
ESLint errors on staged source, raw JS syntax errors, banned styling unit-test
patterns, related Jest failures, and stale generated widget/CSS assets when
their source files are staged. It also attempts `npm run graphify:rebuild` and
auto-stages `graphify-out/GRAPH_REPORT.md` plus `graphify-out/graph.json` when
the rebuild succeeds. Local graphify runtime/configuration failures warn only so
developer-specific Python or uv setup does not block unrelated commits.

Graphify's official `post-commit` and `post-checkout` hooks share the tracked
`.githooks/` path with Wolfpack's pre-commit hook. Run `graphify hook install`
after installing or upgrading the uv tool; this also registers the `graphify`
merge driver used by `.gitattributes`. Verify all three with
`graphify hook status`, `git config --get core.hooksPath`, and
`git config --get merge.graphify.driver`.

## Graphify Knowledge Graph

After modifying code files:
```bash
npm run graphify:rebuild
```

The npm wrapper invokes the installed public CLI as `graphify update . --force`.
Do not import underscore-prefixed Graphify Python functions or depend on the
system Python: Graphify's uv tool environment owns the executable and its
dependencies. The wrapper keeps Wolfpack-owned pre/post sanitization for invalid
legacy file types, excluded generated sources, and duplicate hyperedge IDs.

`graphify-out/GRAPH_REPORT.md` and `graphify-out/graph.json` are tracked.
`graphify-out/.graphify_python`, caches, manifests, lock/temp files, dated
protected-output backups, `graph.html`, and `GRAPH_TREE.html` are generated
support artifacts and should stay ignored. Current Graphify versions emit an
aggregated `graph.html` for graphs above 5,000 nodes; `graphify tree` remains a
useful filesystem-oriented fallback.

Keep `graphify-out/` in `.graphifyignore`. Graphify uses `.graphifyignore`
instead of `.gitignore` when present, so the file must also list normal
dependency/build directories such as `node_modules/`, `.git/`, and build
outputs. Do not let graphify ingest its own `GRAPH_REPORT.md` or backup
folders as source input.

Also keep local agent/editor state out of graphify input: `.claude/`,
`.codex/`, and `.vscode/`. The entire generated `Wolfpack: Product Bundles/`
wiki must be excluded, not only its Obsidian state; otherwise Graphify ingests
its own generated pages and recursively degrades community and query signal.

If ignored, deleted, or generated files were previously scanned, use the
wrapper's forced public update. It explicitly prunes known generated-source
nodes before and after Graphify updates the remaining corpus.

If a rebuild warns about invalid `file_type: "concept"` nodes, those are stale
semantic nodes preserved from an older graphify schema. Normalize them to
`document` before rebuilding so validation is clean.
