---
schema_version: 1
id: remix-server-stream-compatibility
title: Remix Server Stream Compatibility
type: test-spec
status: active
summary: Verifies that the installed Remix stream serializer matches the version contract declared by Remix.
last_audited: 2026-08-17
owners:
  - engineering
domains:
  - admin
systems:
  - remix-server
source_paths:
  - package.json
  - vite.config.ts
  - tests/unit/lib/remix-server-stream-compatibility.test.ts
related_docs:
  - internal docs/Operations/Deployment.md
tags:
  - remix
  - server-rendering
keywords:
  - turbo-stream
  - single-fetch
---

# Test Spec: Remix Server Stream Compatibility
**Spec ID:** remix-server-stream-compatibility  **Created:** 2026-08-17

## Purpose

Prevent an npm override from installing a stream serializer major version that
the active Remix runtime does not support.

## Test Cases

### RemixStreamDependencyContract

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Resolve the installed Remix serializer | Installed `@remix-run/react` and `turbo-stream` package manifests | Installed serializer version satisfies Remix's declared dependency range | Catches invalid npm overrides before deployment |

## Acceptance Criteria

- [ ] The installed `turbo-stream` version satisfies the dependency contract declared by `@remix-run/react`.
- [ ] The production build completes without the incompatible single-fetch stream path.
