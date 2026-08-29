---
schema_version: 1
id: subscription-alert-copy-inventory
title: Subscription Alert and Gating Copy Inventory
type: content-inventory
status: active
summary: Maps typed entitlement failures to the localized persistent feedback used by both bundle editors.
last_audited: 2026-08-29
owners:
  - product
  - engineering
domains:
  - subscriptions
systems:
  - admin
source_paths:
  - app/lib/subscriptions/alerts.ts
  - app/i18n/locales/
related_docs:
  - internal docs/Subscriptions/10-test-matrix.md
tags:
  - alerts
  - localization
keywords:
  - message id
  - remediation
---

# Subscription Alert and Gating Copy Inventory

| Domain state | Heading key | Message key | Persistence |
|---|---|---|---|
| Public-bundle limit reached | `common.upgradePrompt.limitReachedTitle` | `common.upgradePrompt.limitReachedBody` | Until resolved |
| Growth feature required | `common.alerts.bundleNotSaved` | `billing.cta.body` | Until resolved |
| Billing unverified | `billing.error.heading` | `billing.error.verificationFailed` | Until resolved |
| Untyped save failure | `common.alerts.bundleNotSaved` | `common.alerts.operationFailed` | Until resolved |
The analytics summary notice is localized in English, Spanish, Brazilian Portuguese, French, German, and Japanese.

Every blocking response includes a typed code, entitlement key, required plan,
and remediation. FPB and PPB use `getEntitlementAlertCopyKeys` so diagnostic
codes never become merchant-facing copy.
