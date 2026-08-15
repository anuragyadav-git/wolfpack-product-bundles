---
schema_version: 1
id: shared-error-state-contract
title: Shared Error State Contract
type: design-system-component
status: active
summary: Defines recoverable and blocking storefront failures across all bundle templates.
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
  - app/assets/widgets/shared/condition-validator.ts
related_docs:
  - design-system/02-shared-components/feedback.md
tags:
  - error
  - recovery
keywords:
  - recoverable
  - blocking
---

# Error State

| Severity | Ownership | Recovery |
|---|---|---|
| Field | Owning selector or quantity control | Correct the value in place |
| Step/category | Family validation surface | Focus the first invalid or incomplete owner |
| Network recoverable | Inline banner or error state | Retry the single failed operation |
| Cart blocking | Summary/action region | Preserve selections and allow retry |
| Configuration blocking | Widget root | Hide unsafe controls and report the failure once |

Errors preserve shopper selections unless the selected entity is proven invalid. Messages are localized, associated with their owner, keyboard reachable, and never rely on color alone. A retry cannot start duplicate concurrent requests.
