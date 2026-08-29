---
schema_version: 1
id: subscription-rollout-rollback
title: Subscription Cutover Runbook
type: runbook
status: implementation-ready
summary: Defines one atomic subscription cutover with immediate enforcement and no runtime rollout controls.
last_audited: 2026-08-29
owners:
  - engineering
  - product
domains:
  - subscriptions
systems:
  - subscription-enforcement
  - inngest
source_paths:
  - app/services/subscriptions/bundle-entitlement-gate.server.ts
  - app/inngest/functions.ts
related_docs:
  - internal docs/Subscriptions/06-single-cutover-policy.md
  - internal docs/Subscriptions/10-test-matrix.md
tags:
  - cutover
  - rollback
keywords:
  - atomic cutover
  - immediate enforcement
---

# Subscription Cutover Runbook

## Controls

The release is the cutover. Pricing UI, hosted plan navigation, and server blocking activate immediately when the code is released. There are no cohorts, bypasses, shadow mode, activation flags, migration flags, or delayed enforcement.

## Cutover checklist

1. Configure and verify Free plus one Growth plan with monthly/yearly billing and a 14-day trial on SIT.
2. Configure the Partner API access token and create the plans with handles `free` and `growth`.
3. Run the full automated verification suite and Prisma validation.
4. Complete authenticated SIT Admin and storefront verification through direct Chrome DevTools.
5. Publish accurate Partner Dashboard and App Store pricing content.
6. Deploy manually; the release activates enforcement immediately.
7. In Inngest Cloud, open the deployed app, select **Functions**, open **subscription-reconciliation**, choose **Invoke**, and confirm the invocation. No payload is required. Verify the resulting run reports zero failed and zero skipped shops before considering cutover complete. This invokes the same function used by the hourly schedule; there is no separate operator script.

Inngest documents that scheduled functions can be manually triggered from the Functions tab. The hourly schedule continues retrying later lifecycle changes and failed storefront synchronization.

## Incident response

There is no runtime subscription bypass. Fix forward if an enforcement defect is found. Do not delete managed snapshots, bundles, settings, or BusinessEvents, and do not restore removed billing routes. Inspect hourly reconciliation failures and pause the external schedule if repeated reconciliation is worsening the incident; request-time entitlement checks remain active. Coordinate any Partner Dashboard listing correction with its owner.
