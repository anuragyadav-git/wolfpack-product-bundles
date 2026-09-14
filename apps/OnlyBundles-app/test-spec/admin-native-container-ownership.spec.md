---
schema_version: 1
id: admin-native-container-ownership
title: Admin Native Container Ownership
type: test-spec
status: active
summary: Verifies that Admin route behavior remains intact while Polaris layout components own their documented responsibilities.
last_audited: 2026-09-10
owners:
  - engineering
domains:
  - admin
  - shopify
systems:
  - polaris-app-home
  - remix
source_paths:
  - app/routes/app/app.settings/SettingsLandingShell.tsx
  - app/routes/app/app.attribution/AttributionRouteShell.tsx
related_docs:
  - internal docs/Shopify Integration/Polaris Web Components Reference.md
  - internal docs/Architecture/Admin Configure Page.md
tags:
  - polaris
  - layout
keywords:
  - query container
  - responsive admin
---

# Test Spec: Admin Native Container Ownership

**Spec ID:** admin-native-container-ownership **Created:** 2026-09-10

## Purpose

Keep Settings and Analytics behavior unchanged while native Polaris components own page structure and responsive containment and app CSS owns only the demonstrated layout gaps.

## Test Cases

### AdminNativeContainerOwnership

| #   | Scenario                                 | Input                                             | Expected Output                                                                                        | Notes                           |
| --- | ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------- |
| 1   | Merchant opens a Settings destination    | Activate the Design, Language, or Controls action | The selected destination is reported to the route owner                                                | Behavior test                   |
| 2   | Merchant signals intent to open Settings | Focus a Settings destination                      | The optional intent callback runs                                                                      | Behavior test                   |
| 3   | Settings is viewed at desktop width      | Hard reload at 1280x800 or larger                 | Content is centered, cards form the intended grid, and no horizontal overflow or clipping appears      | Chrome visual verification only |
| 4   | Settings is viewed at mobile width       | Hard reload at an actual 390x844 Chrome window    | Cards form one readable column with no horizontal overflow or clipping                                 | Chrome visual verification only |
| 5   | Analytics is viewed at desktop width     | Hard reload at 1280x800 or larger                 | Title, status, funnel, filters, and metrics remain correctly placed with no overflow                   | Chrome visual verification only |
| 6   | Analytics is viewed at mobile width      | Hard reload at an actual 390x844 Chrome window    | All analytics content remains ordered, readable, and contained without horizontal overflow or clipping | Chrome visual verification only |

## Acceptance Criteria

- [x] Settings selection and intent behavior pass focused tests.
- [x] Polaris layout components receive only documented props.
- [ ] Desktop and mobile Chrome checks show no visual regression, overflow, clipping, or misplaced content. Desktop and the browser's actual 500x844 minimum pass; the requested 390x844 resize remains unverified because Chrome retained a 500 px outer width.
- [x] Modified files pass lint and type checking.
