---
schema_version: 1
id: shared-toast-contract
title: Shared Toast Contract
type: design-system-component
status: active
summary: Defines transient storefront feedback shared by FPB and PPB templates.
last_audited: 2026-08-07
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - fpb
  - ppb
source_paths:
  - app/assets/widgets/shared/toast-manager.ts
related_docs:
  - design-system/02-shared-components/feedback.md
tags:
  - feedback
  - toast
keywords:
  - live-region
  - dismiss
---

# Toast

## Contract

Toasts communicate non-blocking success, information, warning, or error outcomes. Blocking validation remains inline at the owning control or in the family error surface.

| State | Required content | Behavior |
|---|---|---|
| Success | Localized outcome | Polite announcement; auto-dismiss allowed |
| Information | Localized context | Polite announcement; auto-dismiss allowed |
| Warning | Actionable localized message | Remains long enough to read; optional dismiss |
| Error | Failure and recovery direction | Assertive announcement; dismiss must not remove unresolved inline errors |

## Responsive and accessibility

- A toast never obscures the mobile summary primary action or modal close control.
- Only one assertive announcement is emitted for one failure.
- Close controls have an accessible localized name and minimum touch target.
- Motion follows shared duration tokens and becomes an immediate visibility change under reduced motion.
