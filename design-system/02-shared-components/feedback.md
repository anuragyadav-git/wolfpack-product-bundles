---
schema_version: 1
id: shared-component-feedback
title: Shared Component - Feedback
type: component-contract
status: active
summary: Shared inline, banner, and toast feedback surfaces.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/shared/toast-manager.js
  - app/assets/widgets/shared/condition-validator.js
related_docs:
  - design-system/01-foundations/color.md
  - design-system/01-foundations/accessibility-foundations.md
tags:
  - component
  - feedback
  - toast
keywords:
  - validation
  - success
  - warning
  - error
---

# Feedback

## Required Behaviors

- Inline validation messages
- Banner-level messaging for blocked interactions
- Toast lifecycle with deterministic duration model
- Error state and recovery guidance

## Accessibility

- Status changes should be exposed to assistive tech where appropriate.
- Error feedback should remain accessible under loading delays.
