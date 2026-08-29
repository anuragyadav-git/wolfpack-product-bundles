---
schema_version: 1
id: subscription-final-implementation-report
title: Subscription Implementation Report
type: implementation-report
status: local-qa-complete-prod-gates-pending
summary: Reports the locally verified Free and Growth implementation, completed SIT pricing setup, and remaining production release gates.
last_audited: 2026-08-29
owners:
  - engineering
domains:
  - subscriptions
systems:
  - billing
  - admin
  - storefront
source_paths:
  - app/lib/subscriptions/
  - app/services/subscriptions/
  - prisma/schema.prisma
related_docs:
  - internal docs/Subscriptions/10-test-matrix.md
  - internal docs/Subscriptions/11-rollout-and-rollback-runbook.md
tags:
  - implementation
  - handoff
keywords:
  - verification
  - pending gates
---

# Subscription Implementation Report

## Implemented

- Central Free/Growth entitlement model with monthly/annual parity.
- Partner API managed-pricing provider, persistent snapshots, bounded cache,
  and 24-hour paid outage grace.
- Transactional FPB/PPB public bundle limit, two-step limit, template gate, and
  effective advanced-Design gate. Draft saves no longer auto-publish or sync.
- Server-gated advanced analytics plus a fixed 30-day Free activity summary.
- Shopify-hosted plan navigation, validated destinations, and force-verified return handling.
- Complete removal of app-owned Billing API routes, handlers, webhooks, compatibility providers, migration scripts, overrides, and remediation models.
- Immediate Free-plan policy application with deterministic compatible-bundle retention, Draft demotion, storefront resync, and hourly retry reconciliation.
- Release-time atomic cutover with immediate enforcement and no runtime rollout flag.
- One Growth plan with Shopify-owned monthly/yearly billing, a 14-day trial, proration, and trial-reuse protection.
- Shop-specific Shopify Admin pricing URLs derived from authenticated shop plus Admin-returned current app identity.
- Native Inngest Cloud manual invocation for the cutover reconciliation, using the same function as the hourly schedule.
- Free-visible locked advanced Design controls while basic brand colors and
  typography remain editable.
- Privacy-safe subscription and entitlement BusinessEvent taxonomy.
- Prisma migration, focused TDD specs/tests, navigation map, research log, and
  required subscription runbooks.

## Local verification

- `npm test`: 2,228 passed, 0 failed across unit, integration, and repository E2E suites.
- `npm run typecheck`: passed.
- `npx prisma validate`: passed.
- `npm run build-dev`: passed.
- Changed-code and repository-wide ESLint: zero errors; the repository's
  existing warning baseline remains permitted by policy.
- `npm run graphify:rebuild`: passed with 33,427 nodes, 43,001 edges, and an
  updated generated community report.
- `git diff --check` and the ordered documentation-frontmatter check: passed.
- Signed-in SIT Chrome QA passed after cache-bypassing reloads at desktop and
  an actual 390x844 browser window: the Free/Growth pricing content, usage
  quota, feature comparison, responsive layout, and Growth confirmation modal
  rendered and behaved correctly. No subscription purchase was initiated.

## Deliberately Free

Bundle subscriptions/customer selling plans, custom CSS, scripts, selectors,
copy, translations, discounts and tiers, gifts, add-ons, upsells, both bundle
types, unlimited Drafts, correctness, security, accessibility, performance, and
compatibility remain Free.

## Verified Partner Dashboard facts

- Partner organization `4162406` owns both apps.
- PROD is a published public app; SIT is a draft public app. SIT is therefore eligible for Partner API `activeSubscription`; its dev tunnel does not determine API eligibility.
- The published App Store listing locale is English only and is primary.
- SIT has Free and Growth App Pricing configured with handles `free` and
  `growth`, the approved English feature copy, monthly/yearly billing, and the
  14-day trial. SIT remains unpublished for internal development.
- PROD is still on manual pricing and its equivalent App Pricing setup remains
  pending.

## Pending external gates

- Create the equivalent Free and Growth plans for PROD and complete the PROD
  Partner Dashboard App Pricing switch only when production cutover is approved.
- Manual SIT deployment when a deployed extension build is required; this
  change was verified against the active Shopify dev tunnel and was not deployed.
- Complete no-charge SIT monthly and annual subscription activation, interval
  switch, downgrade, cancellation, frozen-state, trial-reuse, concurrent
  publication, and CDN-served storefront evidence before production cutover.
- Complete the final Admin accessibility review for the managed-plan lifecycle.

Pricing of `$19.99/month` and `$199/year` was approved by the product owner on
2026-08-28. SIT Partner Dashboard pricing was configured before this QA pass.
No deployment, production mutation, or completed purchase-flow claim is made
by this report.
