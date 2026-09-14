---
schema_version: 1
id: canny-test-spec
title: Canny integration test specification
type: test-spec
status: partial-verification
summary: Behavior and browser acceptance for Canny changelog and store-level feedback.
last_audited: 2026-09-12
owners: [engineering]
domains: [admin]
systems: [canny, shopify]
source_paths: [apps/OnlyBundles-app/app/services/canny.server.ts]
related_docs: []
tags: [testing]
keywords: [canny, changelog, feedback]
---

# Test Spec: Canny

**Spec ID:** canny **Created:** 2026-09-12

## Purpose

Keep Canny the system of record; protect authenticated store identity, secrets,
lazy SDK lifecycle, and merchant access without blocking the Dashboard.

## Test Cases

### Server and lifecycle

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Public configuration | Complete, missing, unsafe URL | Public fields only or disabled | Never expose secret |
| 2 | Identity | Canonical Shop GID/name/email | HS256 JWT, 15-minute lifetime | Store identity shared by staff |
| 3 | Upstream error | GraphQL error, incomplete shop, network failure | No token | No fallback identity |
| 4 | Auth guard | Authorized/unauthorized | Token or Shopify redirect | Authenticate first |
| 5 | Resource failure | Missing config or upstream error | 503, no-store, safe error code | No credentials in errors |
| 6 | SDK | Concurrent loads, error, timeout, retry | One script and retryable failures | No server-side window access |
| 7 | Bell | First click, repeated clicks, remount, failed load | Open once, native toggle, retry | Initialize each trigger once |
| 8 | Feature requests | Mount, unmount, retry, expired session | Authenticated embed, clean lifecycle | No URL rewriting |
| 9 | Browser acceptance | Dashboard + feedback on Agent | Read/create/vote/comment in QA workspace | Never seed production |
| 10 | Responsive/accessibility | Desktop and narrow actual window | Usable bell, popup, embed, keyboard | No styling unit tests |

## Acceptance Criteria

- [x] All implemented automated test cases pass (37 focused checks including retired-route regression).
- [x] Desktop browser QA verifies popup, unread badge, submission, voting, and comments.
- [ ] Merchant SSO verified with a non-Canny-admin owner email (Agent owner is blocked by Canny's admin restriction).
- [ ] Mobile verified with actual resized Chrome window (resize currently leaves 1688×844 unchanged).
- [x] Public loader data excludes signing credentials; client build scan finds no QA signing key. No app-owned token persistence/logging is introduced.
- [x] Dashboard SDK requests start after initial content in local app-frame spot checks.
- [x] Production release announcement remains an unpublished draft pending verified production release.
