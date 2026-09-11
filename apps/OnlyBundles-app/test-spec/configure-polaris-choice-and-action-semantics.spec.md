---
schema_version: 1
id: configure-polaris-choice-and-action-semantics
title: Configure Polaris Choice and Action Semantics Test Spec
type: test-spec
status: active
summary: Defines canonical mutually exclusive choice grouping and accessible action behavior for FPB and PPB configure surfaces.
last_audited: 2026-09-11
owners:
  - engineering
domains:
  - admin-ui
systems:
  - polaris-app-home
source_paths:
  - app/routes/app/_shared/bundle-configure/CommonConfigureSidebar.tsx
  - app/routes/app/_shared/bundle-configure/CommonBundleWidgetSection.tsx
  - app/routes/app/_shared/bundle-configure/BundleSubscriptionConfiguration.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRuleModeContent.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/StepSetupRulesCard.tsx
  - app/routes/app/app.bundles.full-page-bundle.configure.$bundleId/sections/DiscountProgressBarOptions.tsx
  - app/routes/app/app.bundles.product-page-bundle.configure.$bundleId/PpbRulesConfigurationCard.tsx
related_docs:
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - tdd
  - polaris
keywords:
  - radiogroup
  - accessibilityLabel
---

# Test Spec: Configure Polaris Choice and Action Semantics

**Spec ID:** configure-polaris-choice-and-action-semantics **Created:** 2026-09-10

## Purpose

Keep mutually exclusive configure choices in one accessible group and preserve accessible names and route-owned callbacks for icon actions. The currently served App Home runtime has no horizontal `s-choice-list` contract, so the rule-mode exception uses native radios inside `s-stack` without custom radio styling.

## Test Cases

### Configure Polaris Semantics

| #   | Scenario                                        | Input                                                 | Expected Output                                                                   | Notes                                                          |
| --- | ----------------------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| 1   | Choose an FPB rule mode                         | `step` selected from the rule-mode group              | Existing category rules clear and one step rule is created                        | One radio group owns the mutually exclusive options            |
| 2   | Choose a PPB rule mode                          | `category` selected from the rule-mode group          | Existing step rules clear and one category rule is created                        | One radio group owns the mutually exclusive options            |
| 3   | Choose the product-page widget presentation     | `button` selected from the widget-type group          | Existing display-mode callback receives `button` once                             | No independent one-item choice lists                           |
| 4   | Choose the FPB progress presentation            | `simple` selected from the progress-type group        | Existing pricing draft callback receives `simple` once                            | No independent one-item choice lists                           |
| 5   | Choose the subscription discount purchase scope | `both` selected from the purchase-scope group         | Existing subscription draft stores `both`                                         | One mutually exclusive group has one label and one value owner |
| 6   | Use an icon-bearing configure action            | Replace, sync, add, or change-icon action is rendered | The action has a non-empty accessible name and invokes its existing callback once | Accessibility semantics only; no visual placement assertion    |
| 7   | Open FPB rule guidance                          | Activate Learn More                                   | The canonical FPB tutorial opens in a new tab                                        | Existing destination remains unchanged                         |
| 8   | Open PPB rule guidance                          | Activate Learn More                                   | The canonical PPB tutorial opens in a new tab                                        | Existing destination remains unchanged                         |

## Acceptance Criteria

- [x] Mutually exclusive option sets use one native group rather than independent one-item groups.
- [x] Choice changes preserve the existing FPB, PPB, widget, pricing, and subscription callbacks.
- [x] Rendered icon actions expose non-empty accessible names without wrapper-owned click behavior.
- [x] Focused tests, typecheck, modified-file ESLint, browser console verification, and visual Chrome QA pass.
- [x] FPB and PPB rule-mode choices render inline through one accessible radio group without custom radio styling.
- [x] FPB and PPB Learn More links remain at the top-right of the title row at desktop and supported narrow widths.
- [x] No unit test asserts CSS, class names, or visual placement.
