---
schema_version: 1
id: storefront-typescript-architecture
title: Storefront TypeScript Architecture Test Spec
type: test-spec
status: active
summary: Verifies that storefront runtimes are TypeScript ESM graphs without prototype mutation.
last_audited: 2026-08-07
owners:
  - engineering
domains:
  - storefront
systems:
  - widget-runtime
source_paths:
  - app/storefront/
  - app/assets/widgets/
  - app/assets/sdk/
related_docs:
  - internal docs/Architecture/Widget Architecture.md
tags:
  - typescript
  - architecture
keywords:
  - prototype-mutation
  - esbuild
---

# Test Spec: Storefront TypeScript Architecture
**Spec ID:** storefront-typescript-architecture  **Created:** 2026-08-07

## Purpose
Prevent JavaScript source modules and runtime prototype mutation from returning to the storefront graph.

## Test Cases
### StorefrontTypescriptArchitecture
| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Runtime source inventory | Storefront source roots | No `.js` source files | Generated extension assets are excluded |
| 2 | Controller composition | FPB and PPB entries | No prototype mutation | Direct collaborators only |

## Acceptance Criteria
- [x] Storefront source graph is TypeScript-only.
- [x] FPB and PPB controllers do not install method modules through prototype mutation.
- [x] All storefront builds and behavior tests pass.
