---
schema_version: 1
id: subscription-test-matrix
title: Subscription Test Matrix
type: test-plan
status: active
summary: Maps subscription product, managed provider, immediate enforcement, accessibility, security, and storefront acceptance to automated and manual evidence.
last_audited: 2026-08-29
owners:
  - engineering
  - qa
domains:
  - subscriptions
systems:
  - test-suite
  - chrome-devtools
source_paths:
  - tests/unit/lib/subscription-entitlements.test.ts
  - tests/unit/services/subscription-provider-resolution.test.ts
related_docs:
  - internal docs/Subscriptions/11-rollout-and-rollback-runbook.md
tags:
  - testing
  - acceptance
keywords:
  - Free
  - Growth
---

# Subscription Test Matrix

| Domain | Automated coverage | Required live evidence before production |
|---|---|---|
| Entitlement model | Free/Growth limits, interval parity, requirement detection | Confirm copy matches configured plans |
| Provider resolution | Managed Growth/Free, unknown, and 24-hour paid outage grace | Partner API monthly, annual, Free, frozen, cancelled responses |
| Public bundle gate | One public Free bundle, two steps, templates, Design, row lock | Direct POST attempts plus two concurrent publish attempts |
| Draft/preview | Draft saves stay Draft and do not public-sync | Free premium draft preview; verify live storefront unchanged |
| Settings Design | Free brand/typography and advanced field detection | Keyboard, focus, zoom, screen-reader alert checks |
| Analytics | Free summary mode and advanced action assertion | Verify Free has no detail/export/backfill/UTM controls |
| App Pricing | Shopify-only dynamic redirect and 14-day plan data | Monthly, annual, interval switch, trial reuse, return verification |
| Free-plan policy | Deterministic compatible-bundle retention and public demotion | Trigger reconciliation and verify storefront demotion sync |
| Reconciliation | Batch isolation, force refresh, and Free policy | Manually invoke the scheduled function in Inngest Cloud and inspect the run |
| Telemetry | Approved handles/dimensions | Confirm dashboards contain no PII or secrets |
| Security | Server assertions, unsafe redirect rejection, Unknown fail-closed | Authenticated cross-shop and forged return-parameter attempts |
| Storefront regression | Existing FPB/PPB and cart tests | Desktop 1280x800 and iPhone 14 390x844 purchase flows on Free/Growth |

Production acceptance also requires full unit, integration, e2e, accessibility,
and regression suites; changed-file ESLint; TypeScript; Prisma validation;
Graphify rebuild; `git diff --check`; and direct Chrome DevTools evidence after a
manual SIT deployment. Source/build tests are not deployment or browser proof.
