---
schema_version: 1
id: documentation-hub
title: Wolfpack Product Bundles Documentation Hub
type: index
status: authoritative
summary: Routes readers to current architecture, operations, feature, audit, and implementation documentation.
last_audited: 2026-07-26
owners:
  - engineering
domains:
  - documentation
systems:
  - docs
  - internal-docs
source_paths:
  - docs/
  - internal docs/
related_docs:
  - internal docs/index.md
  - docs/app-nav-map/APP_NAVIGATION_MAP.md
tags:
  - documentation
  - index
keywords:
  - architecture
  - operations
  - feature-specifications
---

# Wolfpack Product Bundles Documentation Hub

Wolfpack uses two documentation surfaces with different responsibilities:

- [`internal docs/`](../internal%20docs/index.md) is the authoritative home for durable architecture, operations, Shopify integration knowledge, recurring gotchas, and architecture diagrams.
- [`docs/`](./) contains feature requirements, implementation records, competitive evidence, audits, test plans, and application navigation documentation.

For a current behavior claim, start in `internal docs/`, corroborate it with the graph, and inspect source only when those layers do not establish the answer. Feature and audit documents under `docs/` may describe a point-in-time implementation or evidence capture; use their `status` and `last_audited` metadata before treating them as current.

## Start Here

| Need | Document |
|---|---|
| Durable architecture and operations | [Internal documentation index](../internal%20docs/index.md) |
| Current Admin routes and user flows | [Application navigation map](app-nav-map/APP_NAVIGATION_MAP.md) |
| FPB and PPB storefront architecture | [Widget Architecture](../internal%20docs/Architecture/Widget%20Architecture.md) |
| Shared Admin configure architecture | [Admin Configure Page](../internal%20docs/Architecture/Admin%20Configure%20Page.md) |
| Cart Transform behavior | [Cart Transform Function](../internal%20docs/Architecture/Cart%20Transform%20Function.md) |
| Database model | [Database Schema](../internal%20docs/Architecture/Database%20Schema.md) |
| Build and generated-asset rules | [Build Process](../internal%20docs/Operations/Build%20Process.md) |
| Deployment and guarded backfills | [Deployment](../internal%20docs/Operations/Deployment.md) and [Deployment Backfill](../internal%20docs/Operations/Deployment%20Backfill.md) |
| EB behavior and payload contracts | [EB Implementation Reference](../internal%20docs/EB%20Implementation%20Reference.md) |
| Raw EB research evidence | [Competitor analysis index](competitor-analysis/00-index.md) |

## Documentation Areas

### Feature and implementation records

Feature folders commonly contain business requirements, product requirements, architecture decisions, and implementation notes. These files explain why a change was made and preserve its delivery record; the internal architecture vault remains authoritative when the implementation has since evolved.

### Application navigation

[`docs/app-nav-map/APP_NAVIGATION_MAP.md`](app-nav-map/APP_NAVIGATION_MAP.md) tracks Admin pages, resource routes, important modals, and merchant flows. Update it whenever a route or documented user flow changes.

### Competitive evidence and parity

[`docs/competitor-analysis/`](competitor-analysis/00-index.md) stores live evidence captures, gap analyses, parity matrices, and repeatable storefront verification plans. The distilled implementation-facing contracts live in the corresponding `internal docs/` references.

### Operations, audits, and test evidence

- [`docs/testing/`](testing/) contains manual regression plans and recorded results.
- [`docs/perf/`](perf/) contains point-in-time performance baselines.
- [`docs/plans/`](plans/) and [`docs/refactor/`](refactor/) contain bounded implementation and refactor records.
- [`docs/issues-prod/`](issues-prod/) contains issue execution records, not the canonical architecture.

## Freshness Rules

- Prefer documents with complete YAML metadata and a recent `last_audited` date.
- Treat `status: authoritative` as current only within the document's stated scope.
- Treat evidence, audit, plan, and snapshot documents as point-in-time records.
- Do not infer current architecture from an old issue or implementation plan when an internal architecture note covers the same system.
- When a durable behavior changes, update the relevant internal note and its index entry in the same documentation slice.

## Maintenance Checks

Documentation-only maintenance should verify:

1. YAML frontmatter structure and unique document IDs.
2. Internal links and referenced source paths.
3. Mermaid syntax where diagrams changed.
4. `git diff --check`.
5. A final diff restricted to `docs/**`, `internal docs/**`, and refreshed graphify artifacts.
