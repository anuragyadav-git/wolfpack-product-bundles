---
schema_version: 1
id: subscription-reconciliation
title: Subscription Reconciliation Test Spec
type: test-spec
status: active
summary: Defines scheduled managed subscription verification and Free-plan policy retry orchestration.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
systems:
  - inngest
  - shopify-partner-api
source_paths:
  - app/services/subscriptions/subscription-reconciliation.server.ts
  - app/services/subscriptions/subscription-reconciliation-runner.server.ts
  - app/inngest/functions.ts
related_docs:
  - internal docs/Subscriptions/11-rollout-and-rollback-runbook.md
tags:
  - tdd
  - reconciliation
keywords:
  - scheduled verification
  - Free plan policy
---

# Test Spec: Subscription Reconciliation

**Spec ID:** subscription-reconciliation  **Created:** 2026-08-28

## Purpose

Refresh installed-shop subscription state without allowing one failed shop to stop the rest of the batch.

## Test Cases

### Reconciliation batch

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Managed provider responds | Two installed shops | Two verified | Force refresh. |
| 2 | One shop fails | Two shops | One verified and one failed | Batch continues. |
| 3 | No Shopify GID | Shop without identity | Skipped before provider call | Data prerequisite. |
| 4 | Shop verifies as Free | Public bundles exceed policy | Free-plan policy applied | Storefront sync failures remain retryable. |
| 5 | One-shot operator run | Invoke the scheduled function in Inngest Cloud | The same function as the hourly schedule runs immediately | No duplicate command path. |
| 6 | Runner unit isolation | Load the runner service in Jest | Shopify runtime is mocked before import and the process exits cleanly | Prevents leaked session timers. |

## Acceptance Criteria

- [ ] Reconciliation is idempotent and reports verified, failed, and skipped counts.
- [ ] No provider token or merchant PII is included in errors or events.
- [ ] The scheduled function can be manually invoked from Inngest Cloud for cutover.
