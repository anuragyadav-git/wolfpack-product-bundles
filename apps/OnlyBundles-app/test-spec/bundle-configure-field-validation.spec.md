---
schema_version: 1
id: bundle-configure-field-validation
title: Bundle Configure Field Validation
type: test-spec
status: active
summary: Defines required-field validation for persisted FPB and PPB Admin configure flows.
last_audited: 2026-08-14
owners:
  - engineering
domains:
  - admin
systems:
  - bundle-configure
source_paths:
  - app/lib/bundle-config/configure-validation.ts
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - validation
  - tdd
keywords:
  - required fields
  - save bar
---

# Test Spec: Bundle Configure Field Validation

**Spec ID:** bundle-configure-field-validation  **Created:** 2026-08-14

## Purpose

Ensure FPB and PPB reject invalid persisted configuration before saving and expose actionable field errors to the Admin UI.

## Test Cases

### Shared configure validator

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Valid minimum configuration | Named bundle and enabled named step with a resource | No issues | Runs for every status |
| 2 | Missing identity and step fields | Blank bundle/step names and empty enabled step | Ordered identity, name, and resource issues | Disabled later steps ignored |
| 3 | Invalid rules and discounts | Partial conditions, empty enabled pricing, invalid numeric bounds | Field-specific issues | Percentages are 1–100 |
| 4 | Invalid widget or embed | Enabled feature with missing base copy or selected targets | Widget/embed issues | Hidden targeting branch ignored |
| 5 | Invalid settings and add-ons | Enabled quantity/default/add-on feature with incomplete data | Settings/add-on issues | Optional media and translations ignored |

### Save boundaries

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Invalid client save | Invalid current draft | No fetcher submission; first issue shown and focused | SaveBar remains open |
| 2 | Invalid server save | Invalid posted form | HTTP 400 with `fieldErrors`; no database update | FPB and PPB |
| 3 | Server-only variant failure | Unknown or unavailable variant | Variant field path returned | No substitution |
| 4 | Valid save | Complete posted form | Existing save and sync flow runs | No behavior change |

### Admin error lifecycle

| # | Scenario | Input | Expected Output | Notes |
|---|---|---|---|---|
| 1 | Initial render | Invalid untouched draft | No visible errors | No premature feedback |
| 2 | Correcting a failed field | Edit then blur | Error clears while editing and is rechecked on blur | No validation toast |
| 3 | Discard or successful save | Existing errors | Validation state clears | Dirty-state behavior preserved |

## Acceptance Criteria

- [ ] All listed test cases pass.
- [ ] Invalid drafts never reach persistence.
- [ ] Polaris renders required errors inline in red near the affected control.
- [ ] The first invalid section opens and receives focus.
- [ ] Disabled features and inactive branches do not block Save.
- [ ] No CSS, class-name, placement, or source-grep unit tests are added.
