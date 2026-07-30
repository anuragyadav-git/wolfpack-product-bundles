---
schema_version: 1
id: additional-configurations-behavior
title: Additional Configurations Behavior Test Spec
type: test-spec
status: active
summary: Verifies EB-matched field dependencies and action availability on Additional Configurations.
last_audited: 2026-07-30
owners:
  - Wolfpack Product Bundles
domains:
  - admin-settings
systems:
  - additional-configurations
source_paths:
  - app/lib/additional-configurations-behavior.ts
  - app/routes/app/app.settings/SettingsControls.tsx
  - app/routes/app/app.settings/SettingsRoute.tsx
related_docs:
  - docs/competitor-analysis/checkout-integrations-additional-configurations-parity-plan.md
tags:
  - settings
  - behavior
keywords:
  - dependencies
  - disabled-fields
  - unsaved-changes
---

# Test Spec: Additional Configurations Behavior

**Spec ID:** additional-configurations-behavior  **Created:** 2026-07-30

## Purpose

Match EB field dependencies while preserving values and protect dirty settings
when merchants navigate between Additional Configurations sections.

## Test Cases

### AdditionalConfigurationsBehavior

| # | Scenario | Input | Expected Output | Notes |
| --- | --- | --- | --- | --- |
| 1 | Cart Messaging off | Master unchecked | Child toggles, format, and Edit Language disabled | Live EB contract |
| 2 | Discount Display off | Cart Messaging on | Discount format disabled | Nested dependency |
| 3 | Cart Messaging on | Both masters checked | Messaging children enabled | Values preserved |
| 4 | Integration masters off | All integration enables unchecked | Related scripts, selectors, and token disabled | Independent groups |
| 5 | Partial integrations on | Theme and cart enabled | Only Judge.me token disabled | No cross-group coupling |
| 6 | Clean navigation | No dirty controls | Destination runs immediately | No unnecessary blocker |
| 7 | Dirty navigation | Unsaved controls | Destination runs only after discard or successful save | Save-bar flow |
| 8 | Repeated dirty navigation | Two destination requests | Latest destination replaces the older request | Merchant intent wins |
| 9 | Video logo update | Uploaded Shopify Files URL plus Update Image | Logo preview receives the uploaded URL | Save persists both values |

## Acceptance Criteria

- [x] Disabled fields retain their saved values.
- [x] Cart Messaging matches live EB dependency behavior.
- [x] Integration detail fields follow their own enable toggle.
- [x] Judge.me token uses secret-safe input behavior.
- [x] Advanced image upload uses Shopify Files and updates the saved logo preview.
- [x] Layout, tab, group, and Back navigation use save-bar leave confirmation.
- [x] Focused tests pass.
