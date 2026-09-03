---
schema_version: 1
id: sdk-documentation-test-spec
title: SDK Documentation Test Spec
type: test-spec
status: active
summary: Defines the indexable limited-release Only Bundles SDK guide and every public discovery link.
last_audited: 2026-09-03
owners:
  - engineering
domains:
  - website
systems:
  - astro
source_paths:
  - apps/OnlyBundles-website/src/pages/developers/sdk.astro
  - apps/OnlyBundles-website/tests/sdk-documentation.test.mjs
related_docs:
  - internal docs/Architecture/Public Website.md
  - internal docs/Architecture/Widget Architecture.md
tags:
  - tdd
keywords:
  - Only Bundles SDK
  - developers sdk
---

# Test Spec: SDK Documentation

**Spec ID:** sdk-documentation  **Created:** 2026-09-03

## Purpose

Publish one truthful, indexable developer guide for the limited-release Product
Page Bundle SDK without claiming a self-service Theme Editor toggle or a public
package distribution that does not exist.

## Test Cases

### Generated SDK Guide

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Build guide | `/developers/sdk/` | Static indexable HTML with canonical metadata | Astro stays fully static |
| 2 | Disclose availability | Guide content | Limited release, support-enabled, PPB and OS 2.0 boundaries | No stale activation claim |
| 3 | Document API | Guide content | All methods, state fields, and actual events including init failure | Runtime identifier stays exact |
| 4 | Show safe initialization | Quickstart code | DOM creation and `textContent` | No product interpolation through `innerHTML` |
| 5 | Explain integration | Guide sections | Prerequisites, pricing, cart, debugging, errors, limitations, launch checklist | Anchored sections |
| 6 | Request access | Enablement action | Existing Shopify listing support surface | No invented SDK toggle |

### Discovery

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Desktop navigation | Website header | Developers link reaches SDK guide | Root-relative static link |
| 2 | Mobile navigation | Website menu | SDK link reaches guide | Same destination |
| 3 | Footer navigation | Resource links | SDK link reaches guide | Same destination |
| 4 | Search discovery | Sitemap | `/developers/sdk/` is included | Indexable route |

## Acceptance Criteria

- [x] All listed output tests pass.
- [x] `website:verify` passes with no adapter, bindings, secrets, or Worker entry point.
- [x] Public examples do not use `innerHTML`.
