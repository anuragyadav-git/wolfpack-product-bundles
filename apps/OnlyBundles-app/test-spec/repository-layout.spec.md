---
schema_version: 1
id: repository-layout-test-spec
title: Repository Layout Test Spec
type: test-spec
status: active
summary: Defines behavior checks for monorepo root discovery, path normalization, and root npm command delegation.
last_audited: 2026-09-02
owners:
  - engineering
domains:
  - repository-architecture
systems:
  - npm-workspaces
source_paths:
  - apps/OnlyBundles-app/scripts/lib/repository-layout.cjs
  - apps/OnlyBundles-app/tests/unit/scripts/repository-paths.test.ts
related_docs:
  - internal docs/Architecture/Repository Layout.md
tags:
  - tdd
keywords:
  - monorepo
---

# Test Spec: Repository Layout

**Spec ID:** repository-layout  **Created:** 2026-09-02

## Purpose

Verify that path-aware tooling can locate the repository root from either workspace, normalize paths consistently, and preserve the established root npm command surface through explicit workspace delegation.

## Test Cases

### RepositoryLayout

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Normalize Windows separators | `apps\\OnlyBundles-app\\app` | `apps/OnlyBundles-app/app` | Platform-independent graph and hook paths |
| 2 | Discover root from app workspace | Nested app path | Root containing the exact workspace declaration | Must not depend on process cwd |
| 3 | Resolve app-owned path | Root plus `prisma/schema.prisma` | Absolute path below `apps/OnlyBundles-app` | No legacy-root fallback |
| 4 | Preserve legacy root commands | Root package scripts | Commands delegate to the Shopify workspace | Existing command names remain stable |
| 5 | Expose explicit workspace commands | Root package scripts | `app:*`, `website:*`, and `verify:all` exist | npm only; no orchestration layer |
| 6 | Preserve exact renames during hook checks | Staged `R100` destination plus authored file | Exact rename is excluded; authored file remains checked | Prevents migration-only false positives without skipping edited renames |

## Acceptance Criteria

- [x] All listed test cases pass
- [x] Exact case-sensitive workspace paths are enforced
- [x] Root commands delegate through npm workspaces
