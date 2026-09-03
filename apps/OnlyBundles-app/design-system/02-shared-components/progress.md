---
schema_version: 1
id: shared-component-progress
title: Shared Component - Progress
type: component-contract
status: active
summary: Shared progress and completion component contracts for steps and selections.
last_audited: 2026-08-06
owners:
  - Wolfpack Product Bundles
domains:
  - storefront
systems:
  - full-page-widget
  - product-page-widget
source_paths:
  - app/assets/widgets/full-page/methods/side-panel-methods.js
  - app/assets/widgets/shared/template-design-system.js
related_docs:
  - design-system/01-foundations/motion.md
  - design-system/01-foundations/color.md
tags:
  - component
  - progress
  - state
keywords:
  - completion
  - step-progress
  - bar
---

# Progress

## Required Behaviors

- Step/category completion visibility
- Selected item count and ratio
- Clear empty/incomplete/complete transitions
- No reliance on color alone to express progress state

## Animation Policy

- Progress transitions use tokenized motion.
- Respect reduced-motion.
